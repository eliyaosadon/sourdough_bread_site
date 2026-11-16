import { ADVISOR_TOOLS, SYSTEM_PROMPT, runTool } from "@/lib/advisor";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// The API key stays on the server. The browser only ever talks to this route.
//
// This route speaks the "OpenAI-compatible" chat format, which many providers offer,
// including free tiers (Groq, OpenRouter, Google Gemini). To switch provider you only
// change three environment variables, not the code:
//   LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };
type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};
type ApiMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

function fail(error: string, status = 400) {
  return Response.json({ error }, { status });
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return null;
  }

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string" ||
      content.length === 0 ||
      content.length > MAX_MESSAGE_LENGTH
    ) {
      return null;
    }
    messages.push({ role, content });
  }

  // The conversation sent to the model must start and end with the customer.
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return null;
  }
  return messages;
}

function parseArguments(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

// The tool definitions are written once in lib/advisor.ts; here we convert them
// to the OpenAI-compatible shape.
const TOOLS = ADVISOR_TOOLS.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
}));

export async function POST(request: Request) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return fail(
      "The bread advisor is not set up yet. Please ask the bakery directly.",
      503,
    );
  }

  const limit = rateLimit(`advisor:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return fail("You are asking a lot of questions. Please wait a moment and try again.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  const chat = parseMessages(body);
  if (!chat) return fail("Invalid conversation.");

  const baseUrl = (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  const conversation: ApiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...chat.map((m): ApiMessage => ({ role: m.role, content: m.content })),
  ];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: conversation,
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 700,
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (response.status === 429) {
        // Free tiers have small limits, so this will happen sometimes.
        return fail(
          "The advisor is very busy right now. Please try again in a minute.",
          503,
        );
      }
      if (!response.ok) {
        const details = await response.text().catch(() => "");
        console.error("LLM API error:", response.status, details.slice(0, 500));
        return fail("The bread advisor is unavailable right now. Please try again later.", 502);
      }

      const data = (await response.json()) as {
        choices?: {
          message?: { content?: string | null; tool_calls?: ToolCall[] };
        }[];
      };
      const message = data.choices?.[0]?.message;
      if (!message) {
        return fail("The bread advisor sent an empty answer. Please try again.", 502);
      }

      const toolCalls = message.tool_calls ?? [];
      if (toolCalls.length > 0) {
        conversation.push({
          role: "assistant",
          content: message.content ?? null,
          tool_calls: toolCalls,
        });
        for (const call of toolCalls) {
          conversation.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(
              runTool(call.function.name, parseArguments(call.function.arguments)),
            ),
          });
        }
        continue;
      }

      const reply = (message.content ?? "").trim();
      return Response.json({
        reply: reply || "Sorry, I could not find an answer to that.",
      });
    }

    return fail("The advisor needed too many steps for that question. Try asking it more simply.", 502);
  } catch (error) {
    console.error("Advisor request failed:", error);
    return fail("The bread advisor is unavailable right now. Please try again later.", 502);
  }
}

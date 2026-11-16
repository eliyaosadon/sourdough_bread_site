import { ADVISOR_TOOLS, SYSTEM_PROMPT, runTool } from "@/lib/advisor";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// The Claude API key stays on the server. The browser only ever talks to this route.

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-5-5";
const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };
type Block = { type: string; text?: string; id?: string; name?: string; input?: unknown };
type ToolResult = { type: "tool_result"; tool_use_id: string; content: string };
type ApiMessage = {
  role: "user" | "assistant";
  content: string | Block[] | ToolResult[];
};

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

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
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

  const model = process.env.ADVISOR_MODEL || DEFAULT_MODEL;
  const conversation: ApiMessage[] = chat.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 700,
          system: SYSTEM_PROMPT,
          tools: ADVISOR_TOOLS,
          messages: conversation,
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        console.error("Claude API error:", response.status, details.slice(0, 500));
        return fail("The bread advisor is unavailable right now. Please try again later.", 502);
      }

      const data = (await response.json()) as {
        content?: Block[];
        stop_reason?: string;
      };
      const content = data.content ?? [];

      if (data.stop_reason === "tool_use") {
        const results: ToolResult[] = content
          .filter((b) => b.type === "tool_use" && b.id && b.name)
          .map((b) => ({
            type: "tool_result" as const,
            tool_use_id: b.id as string,
            content: JSON.stringify(runTool(b.name as string, b.input)),
          }));

        conversation.push({ role: "assistant", content });
        conversation.push({ role: "user", content: results });
        continue;
      }

      const reply = content
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("\n")
        .trim();

      return Response.json({ reply: reply || "Sorry, I could not find an answer to that." });
    }

    return fail("The advisor needed too many steps for that question. Try asking it more simply.", 502);
  } catch (error) {
    console.error("Advisor request failed:", error);
    return fail("The bread advisor is unavailable right now. Please try again later.", 502);
  }
}

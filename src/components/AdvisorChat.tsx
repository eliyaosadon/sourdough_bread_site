"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getProductBySlug } from "@/lib/products";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Which bread is best for sandwiches?",
  "I want something savory to go with cheese",
  "What is vegan and high in fiber?",
  "How should I store my loaf?",
];

/** Turns /shop/<slug> paths in the assistant text into real links. */
function renderWithLinks(text: string): ReactNode[] {
  return text.split(/(\/shop\/[a-z0-9-]+)/g).map((part, index) => {
    const slug = part.startsWith("/shop/") ? part.slice("/shop/".length) : "";
    const product = slug ? getProductBySlug(slug) : undefined;
    if (product) {
      return (
        <Link key={index} href={part} className="font-semibold underline">
          {product.name}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function readReply(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "reply" in data) {
    const reply = (data as { reply: unknown }).reply;
    if (typeof reply === "string" && reply.trim()) return reply;
  }
  return null;
}

function readError(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const error = (data as { error: unknown }).error;
    if (typeof error === "string") return error;
  }
  return "The advisor could not answer right now. Please try again.";
}

export function AdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readError(data));
        return;
      }
      const reply = readReply(data);
      if (!reply) {
        setError("The advisor sent an empty answer. Please try again.");
        return;
      }
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Could not reach the advisor. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-wheat/70 bg-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-parchment px-4 py-3 text-sm">
          Hi! I am the bread advisor. Tell me what you like or what you are
          planning to serve, and I will suggest breads from our shop.
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void send(starter)}
                className="rounded-full border border-wheat bg-cream px-3.5 py-1.5 text-sm hover:border-crust"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "ml-auto rounded-tr-sm bg-crust text-cream"
                : "rounded-tl-sm bg-parchment"
            }`}
          >
            {message.role === "assistant"
              ? renderWithLinks(message.content)
              : message.content}
          </div>
        ))}

        {loading && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-parchment px-4 py-3 text-sm text-ink-soft">
            Thinking...
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-wheat/60 p-3">
        <label className="sr-only" htmlFor="advisor-input">
          Ask the bread advisor
        </label>
        <input
          id="advisor-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask about breads, allergens, storage..."
          className="flex-1 rounded-full border border-wheat bg-cream px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-crust px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-crust-dark disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

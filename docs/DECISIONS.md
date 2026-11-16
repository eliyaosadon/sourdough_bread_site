# Decisions log

Record each decision briefly: what, why, and alternatives considered.

## 1. Next.js + TypeScript
Why: one codebase for frontend and backend, strong ecosystem, widely used in job listings.

## 2. LLM API called from the server only
Why: keeps the API key secret and lets the server control tools, limits and logging.

## 2b. OpenAI-compatible format, free tier by default
Why: many providers (Groq, OpenRouter, Gemini) accept the same request format, so changing provider is a config change. Free tiers have small rate limits and can change, so the route returns a friendly message when the provider says 429.

## 3. Money stored as integers
Why: avoids floating-point rounding errors in prices and totals.

# Architecture (draft)

```
Browser
  |
  v
Next.js app (Vercel)
  |-- Pages and components (shop UI, cart, checkout, chat widget)
  |-- API routes / server actions
  |      |-- Products, orders, admin
  |      |-- Payment webhook handler
  |      |-- /api/advisor  --> Claude API (server-side key)
  |                              ^
  |                              |  tool calls: search_products, check_stock
  |                              +--- reads from the database
  v
PostgreSQL (managed)
```

## Key rules
- Secrets (database URL, Claude API key, payment keys) exist only on the server.
- The AI advisor never answers about products from memory; it uses tools that read the real catalog.
- Payment status is confirmed by the provider's webhook, not by the browser.
- All external input is validated with Zod before use.

## AI advisor flow
1. Customer sends a message from the chat widget.
2. The server adds the system prompt, recent conversation, and retrieved knowledge.
3. Claude may call tools (`search_products`, `check_stock`).
4. The server runs the tools against the database and returns results to Claude.
5. The final answer streams back to the browser.
6. The exchange is logged and rate limited.

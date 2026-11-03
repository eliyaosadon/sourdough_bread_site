# Decisions log

Record each decision briefly: what, why, and alternatives considered.

## 1. Next.js + TypeScript
Why: one codebase for frontend and backend, strong ecosystem, widely used in job listings.

## 2. Claude API called from the server only
Why: keeps the API key secret and lets the server control tools, limits and logging.

## 3. Money stored as integers
Why: avoids floating-point rounding errors in prices and totals.

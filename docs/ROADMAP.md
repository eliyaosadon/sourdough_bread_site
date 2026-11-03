# Roadmap

Mark each item when done. Each phase also lists what it teaches.

## Phase 0: Scope the MVP
- [ ] Decide v1 scope: catalog, cart, checkout, order management, AI advisor
- [ ] Leave out for now: accounts, reviews, subscriptions
- [ ] Decide Israel-specific details: Hebrew/RTL, ILS, pickup vs delivery, payment provider

## Phase 1: Project setup and workflow
- [x] Create the repository
- [ ] Scaffold Next.js + TypeScript + Tailwind
- [ ] Linting and formatting
- [ ] CI with GitHub Actions
- Teaches: Git workflow, project structure, tooling

## Phase 2: Design and data model
- [ ] Wireframes: home, product page, cart, checkout
- [ ] Finalize schema (see DATA_MODEL.md)
- [ ] Architecture diagram (see ARCHITECTURE.md)

## Phase 3: Backend and API
- [ ] Product and order CRUD
- [ ] Input validation with Zod, error handling
- [ ] Stock tracking per batch

## Phase 4: Frontend
- [ ] Product listing with filters, product detail page
- [ ] Cart, responsive design, accessibility
- [ ] SEO basics: titles, structured data, sitemap

## Phase 5: Checkout and payments
- [ ] Payment integration with webhooks
- [ ] Order confirmation emails
- [ ] Failure handling and duplicate-submission protection

## Phase 6: Admin panel
- [ ] Manage breads and stock
- [ ] View and update orders
- [ ] Authentication with role checks

## Phase 7: AI bread advisor
- [ ] Chat UI with streaming responses
- [ ] Server-side Claude API calls
- [ ] Knowledge retrieval (RAG) over bread info and FAQs
- [ ] Tool use: look up products, check stock
- [ ] Guardrails: stay on topic, careful allergen answers
- [ ] Evaluation set of 20-30 test questions
- [ ] Rate limiting, length caps, logging

## Phase 8: Testing and security
- [ ] Unit tests for pricing and cart logic
- [ ] End-to-end tests with Playwright
- [ ] Abuse protection and secret scanning

## Phase 9: Deployment
- [ ] Deploy app and managed Postgres
- [ ] Custom domain, HTTPS, environment variables
- [ ] Error monitoring and backups

## Phase 10: Launch and iterate
- [ ] Analytics
- [ ] Test with real customers
- [ ] Write a short case study

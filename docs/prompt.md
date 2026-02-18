# Build apix — Express REST API with Prisma

You are building a **portfolio project** for a Senior AI Engineer's public GitHub. It must be impressive, clean, and production-grade. Read these docs before writing any code:

1. **`E01-express-rest-api.md`** — Complete project spec: architecture, phases, module design, auth flow, commit plan. This is your primary blueprint. Follow it phase by phase.
2. **`github-portfolio.md`** — Portfolio goals and Definition of Done (Level 1 + Level 2). Understand the quality bar.
3. **`github-portfolio-checklist.md`** — Pre-publish checklist. Every item must pass before you're done.

---

## Instructions

### Read first, build second
Read all three docs completely before writing a single line of code. Understand the Express 5 + Prisma + TypeScript architecture, the module pattern, and the auth flow.

### Follow the phases in order
The project spec has 4 phases. Do them in order:
1. **Foundation** — project setup, TypeScript strict config, Prisma schema, Express app skeleton, error handling middleware
2. **Auth Module** — user model, registration, login, JWT token generation/verification, auth middleware, refresh tokens
3. **Core Modules** — CRUD resources (at least 2 domain models with relationships), pagination, filtering, validation (Zod)
4. **Middleware + Polish** — rate limiting, request logging, comprehensive Jest tests, refactor, README

### Commit frequently
Follow the commit plan in the spec. Use **conventional commits**. Each commit should be a logical unit.

### Quality non-negotiables
- **TypeScript strict mode.** Zero `any` types. Strict null checks. Full type safety from request to response.
- **Express 5.** Use the latest Express with native async error handling. No `express-async-errors` hack.
- **Prisma ORM.** Schema-first design. Migrations. Type-safe queries. Relations.
- **Zod validation.** Request body validation with Zod schemas. Parse, don't validate.
- **JWT auth.** Registration, login, protected routes. Refresh token rotation.
- **Comprehensive Jest tests.** Supertest for HTTP integration tests. Unit tests for services. Test database with Prisma.
- **Error handling middleware.** Centralized, consistent JSON error responses. No `try/catch` in every handler.
- **Lint clean.** ESLint + Prettier. `tsc --noEmit` passes. Zero warnings.
- **No Docker for the app.** PostgreSQL can run in Docker. The app is `npm run dev` / `npm start`. Include PostgreSQL setup in README.

### What NOT to do
- Don't use `any` anywhere. TypeScript strict mode means strict.
- Don't use callbacks. Async/await everywhere.
- Don't skip Prisma migrations. No raw SQL for schema changes.
- Don't use `express-validator`. Use Zod for validation.
- Don't commit `node_modules`, `.env`, or `prisma/dev.db`.
- Don't leave `// TODO` or `// FIXME` comments anywhere.

---

## GitHub Username

The GitHub username is **devaloi**. For npm scripts and package.json, use package name `apix`. For any GitHub URLs, use `github.com/devaloi/apix`.

## Start

Read the three docs. Then begin Phase 1 from `E01-express-rest-api.md`.

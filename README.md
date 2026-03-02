# apix

[![CI](https://github.com/devaloi/apix/actions/workflows/ci.yml/badge.svg)](https://github.com/devaloi/apix/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade REST API built with **Express 5**, **Prisma ORM**, **PostgreSQL**, and **JWT auth** — TypeScript strict mode throughout with comprehensive Jest tests.

## Features

- 🔐 **JWT Authentication** — Register, login, protected routes
- 📝 **Full CRUD** — Posts with ownership enforcement
- 📄 **Cursor-based Pagination** — Efficient, scalable pagination with search & filtering
- ✅ **Zod Validation** — Type-safe request validation on all endpoints
- 🛡️ **Rate Limiting** — In-memory sliding window per IP
- 🏗️ **Layered Architecture** — Controller → Service → Prisma (testable, maintainable)
- 🐳 **Docker Ready** — One command to run everything
- 🧪 **29 Tests** — Auth, CRUD, pagination, ownership, rate limiting, full integration flow

## Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/devaloi/apix.git && cd apix
docker compose up -d
# API available at http://localhost:3000
```

### Local Development

```bash
# Prerequisites: Node.js 20+, PostgreSQL

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | No | Authenticate, returns JWT |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/users/me` | Yes | Get current user profile |
| `PATCH` | `/api/v1/users/me` | Yes | Update profile (name, email) |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/posts` | No | List posts (paginated, searchable) |
| `GET` | `/api/v1/posts/:id` | No | Get single post |
| `POST` | `/api/v1/posts` | Yes | Create post |
| `PATCH` | `/api/v1/posts/:id` | Yes | Update post (owner only) |
| `DELETE` | `/api/v1/posts/:id` | Yes | Delete post (owner only) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

## Cursor-Based Pagination

List endpoints use cursor-based pagination for consistent, scalable results:

```
GET /api/v1/posts?limit=20&cursor=abc123&search=typescript&published=true
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | string | — | Cursor from previous response (post ID) |
| `limit` | number | 20 | Results per page (1–100) |
| `search` | string | — | Case-insensitive search in title and body |
| `published` | boolean | — | Filter by published status |

**Response format:**

```json
{
  "data": [{ "id": "...", "title": "...", ... }],
  "meta": {
    "cursor": "clx9abc123",
    "hasMore": true,
    "total": 42
  }
}
```

Use `meta.cursor` as the `cursor` parameter in the next request. When `meta.hasMore` is `false`, there are no more results.

## Response Format

**Success:**
```json
{
  "data": { "id": "...", "email": "...", ... }
}
```

**Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "details": [
      { "path": "email", "message": "Invalid email address" }
    ]
  }
}
```

## curl Examples

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# Create post (use token from login response)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"My Post","body":"Hello world","published":true}'

# List posts with search
curl "http://localhost:3000/api/v1/posts?search=typescript&published=true&limit=10"

# Get profile
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

## Architecture

```
src/
├── app.ts                  # Express app factory (testable)
├── index.ts                # Entry point
├── config.ts               # Typed env config (Zod)
├── modules/
│   ├── auth/               # Register, login, JWT middleware
│   ├── user/               # Profile, update
│   └── post/               # CRUD, pagination, ownership
├── middleware/
│   ├── error-handler.ts    # Global error handler
│   ├── validate.ts         # Zod validation middleware
│   ├── rate-limit.ts       # Sliding window rate limiter
│   └── request-id.ts       # X-Request-ID generation
├── lib/
│   ├── jwt.ts              # JWT sign/verify
│   ├── password.ts         # bcrypt hash/compare
│   ├── errors.ts           # Custom error classes
│   └── prisma.ts           # Prisma client singleton
└── types/
    └── express.d.ts        # Express type augmentation
```

Each module follows **Controller → Service → Prisma** layering:
- **Controller** — HTTP concerns (req/res), delegates to service
- **Service** — Business logic, uses Prisma for data access
- **Schemas** — Zod schemas for input validation

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Express 5** | Native async error handling, modern routing |
| **Prisma** | Type-safe queries, auto-generated migrations, excellent DX |
| **Cursor pagination** | Consistent results under concurrent writes (no offset drift) |
| **Zod** | Runtime validation with TypeScript type inference |
| **bcryptjs** | Pure JS bcrypt — no native compilation needed |
| **App factory** | `createApp()` returns testable Express instance |
| **No `any`** | TypeScript strict mode enforced project-wide |
| **In-memory rate limiting** | Simple, no Redis dependency; suitable for single-instance |

## Development

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run start        # Run compiled JS
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration time |
| `BCRYPT_ROUNDS` | `10` | bcrypt cost factor |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

## Testing

Tests use **Jest** with **supertest** and mock the Prisma client — no database required:

```bash
npm test              # Run all tests
npm test -- --verbose # Verbose output
```

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — run `npm run lint && npm test` before submitting.

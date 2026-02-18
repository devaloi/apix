# E01: apix — Express REST API with Prisma

**Catalog ID:** E01 | **Size:** M | **Language:** TypeScript
**Repo name:** `apix`
**One-liner:** A production-grade REST API built with Express 5, Prisma ORM, PostgreSQL, and JWT auth — TypeScript throughout with comprehensive Jest tests.

---

## Why This Stands Out

- **Express 5** — latest version with async error handling, shows you're current
- **Prisma ORM** — type-safe database queries, migrations, seed data
- **TypeScript strict mode** — no `any`, full type safety end to end
- **Layered architecture** — controller → service → repository, dependency injection
- **Error handling** — custom error classes, global handler, consistent response format
- **Real pagination** — cursor-based (not offset), proper link headers
- **Rate limiting + request validation** — Zod schemas, per-endpoint rate limits
- **Docker compose** — app + PostgreSQL + Redis, one command

---

## Architecture

```
apix/
├── src/
│   ├── index.ts                  # Entry: create app, connect DB, start server
│   ├── app.ts                    # Express app setup, middleware, routes
│   ├── config/
│   │   └── env.ts                # Typed config from environment
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification middleware
│   │   ├── validate.ts           # Zod schema validation middleware
│   │   ├── rateLimit.ts          # Per-route rate limiting (in-memory)
│   │   ├── errorHandler.ts       # Global error handler
│   │   └── requestId.ts          # X-Request-ID generation
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts    # Zod validation schemas
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.test.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.schema.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.test.ts
│   │   └── posts/
│   │       ├── post.controller.ts
│   │       ├── post.service.ts
│   │       ├── post.schema.ts
│   │       ├── post.routes.ts
│   │       └── post.test.ts
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── jwt.ts                # JWT sign/verify helpers
│   │   ├── password.ts           # bcrypt hash/compare
│   │   └── errors.ts             # Custom error classes (AppError, NotFound, etc.)
│   └── types/
│       └── express.d.ts          # Express type augmentation (req.user)
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Auto-generated migrations
│   └── seed.ts                   # Seed data for development
├── tests/
│   ├── setup.ts                  # Test database setup/teardown
│   └── helpers.ts                # Auth helpers, request builders
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── jest.config.ts
├── package.json
├── .env.example
├── .gitignore
├── .eslintrc.json
├── LICENSE
└── README.md
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create account, return JWT |
| POST | `/api/v1/auth/login` | No | Authenticate, return JWT |
| POST | `/api/v1/auth/refresh` | Yes | Refresh token |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | Yes | Current user profile |
| PATCH | `/api/v1/users/me` | Yes | Update profile |

### Posts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/posts` | No | List (cursor pagination, filter, search) |
| GET | `/api/v1/posts/:id` | No | Get single post |
| POST | `/api/v1/posts` | Yes | Create post |
| PATCH | `/api/v1/posts/:id` | Yes | Update (owner only) |
| DELETE | `/api/v1/posts/:id` | Yes | Delete (owner only) |

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": { "cursor": "abc123", "hasMore": true, "total": 42 }
}
```

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5+ (strict) |
| Framework | Express 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 15+ |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Testing | Jest + supertest |
| Linting | ESLint + Prettier |
| Container | Docker + docker-compose |

---

## Phased Build Plan

### Phase 1: Foundation

**1.1 — Project setup**
- `npm init`, install deps, configure TypeScript strict, ESLint, Prettier
- Directory structure, Dockerfile, docker-compose.yml
- Scripts: dev, build, start, test, lint, db:migrate, db:seed

**1.2 — Prisma schema + migrations**
- User model: id, email, name, passwordHash, createdAt, updatedAt
- Post model: id, title, body, published, authorId, createdAt, updatedAt
- Relations: User hasMany Posts
- Initial migration, seed script with sample data

**1.3 — Express app shell**
- App factory function (testable)
- Health check endpoint `/health`
- Global error handler middleware
- Request ID middleware
- Typed config from env vars
- Test: health check returns 200

### Phase 2: Auth Module

**2.1 — JWT + password helpers**
- `signToken(userId)` → JWT with exp, iat
- `verifyToken(token)` → decoded payload or throw
- `hashPassword(plain)` → bcrypt hash
- `comparePassword(plain, hash)` → boolean
- Tests for each helper

**2.2 — Auth controller + service**
- Register: validate with Zod, check duplicate email, hash password, create user, return JWT
- Login: find user by email, compare password, return JWT
- Auth middleware: extract Bearer token, verify, attach `req.user`
- Zod schemas: `registerSchema`, `loginSchema`
- Tests: register success, duplicate email 409, login success, wrong password 401

### Phase 3: Core Modules

**3.1 — User module**
- Get profile: return current user from `req.user`
- Update profile: validate with Zod, update name/email
- Tests: get profile, update, unauthorized 401

**3.2 — Post module (CRUD)**
- Create: validate, associate with auth user
- GetById: return or 404
- Update: verify ownership or 403
- Delete: verify ownership or 403
- Zod schemas: `createPostSchema`, `updatePostSchema`
- Tests: full CRUD, ownership enforcement

**3.3 — Post list with cursor pagination**
- Cursor-based: `?cursor=abc&limit=20&search=golang&published=true`
- Sort by createdAt desc (default)
- Search: case-insensitive title/body match
- Return: data array + meta (cursor, hasMore, total)
- Tests: pagination, filtering, search, empty results

### Phase 4: Middleware + Polish

**4.1 — Validation middleware**
- Generic `validate(schema)` middleware factory
- Validates body, query, params against Zod schemas
- Returns structured errors: `{ errors: [{ path, message }] }`
- Tests: valid input passes, invalid returns 400 with details

**4.2 — Rate limiting**
- In-memory sliding window per IP
- Configurable per route: auth endpoints stricter
- Returns 429 with Retry-After header
- Tests: under limit passes, over limit blocks

**4.3 — Integration tests**
- Full flow: register → login → create post → list → update → delete
- Concurrent user isolation
- Auth edge cases: expired token, malformed token

**4.4 — README**
- Badges, install, quick start with Docker
- API reference with curl examples
- Environment variables
- Architecture diagram
- Testing instructions

---

## Commit Plan

1. `chore: scaffold project with TypeScript, Docker, Prisma`
2. `feat: add Prisma schema, migrations, and seed data`
3. `feat: add Express app shell with error handling`
4. `feat: add JWT and password helpers`
5. `feat: add auth module (register, login, middleware)`
6. `feat: add user module (profile, update)`
7. `feat: add post module (CRUD)`
8. `feat: add cursor-based pagination and search`
9. `feat: add Zod validation middleware`
10. `feat: add rate limiting middleware`
11. `test: add integration tests for full API flow`
12. `docs: add README with API reference`

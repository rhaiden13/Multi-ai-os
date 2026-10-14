# Multi-AI OS — Full-stack foundation (v1)

A responsive multi-provider AI chat workspace with **real PostgreSQL accounts, session cookies, saved conversations, provider API calls, comparison mode, daily request caps, and basic admin statistics**.

## Important status

- Implemented in source: database schema, registration/login/logout, secure server-side session cookies, conversations, OpenAI/Anthropic/Gemini/DeepSeek text API adapters, model readiness, comparison, request caps, basic admin counts.
- Not implemented: payment subscriptions, image generation, file analysis, real-time token streaming, email verification, password resets, MFA, billing-grade metering, team workspaces, production-ready fraud prevention, fully polished admin operations, legal notices. UI explicitly labels these as planned.
- **Do not publicly deploy this as a paid SaaS without security review, abuse controls, email verification, cost budgeting, payment integration, and full integration testing.**

## Local setup

```bash
npm install
cp .env.example .env.local
# Fill DATABASE_URL and desired provider API keys in .env.local
# For db:init, export DATABASE_URL into your shell or use a dotenv-compatible runner.
npm run db:init
npm run dev
```

Open http://localhost:3000. Use `npm run lint` for TypeScript checking, `npm run build` to build, and `npm test` for local dependency-free checks.

## Database & deployment

1. Provision PostgreSQL (e.g., on Railway) and set `DATABASE_URL`.
2. Apply `db/schema.sql` using `psql` or `npm run db:init` with DATABASE_URL exported.
3. Set API keys as private **server environment variables**. Never use `NEXT_PUBLIC_` for secrets.
4. Build and deploy the Next.js project. Verify `/api/health` and register a test account.
5. Only enable public registration after rate-limit, abuse-prevention, mail verification, hosting capacity, and privacy review.

## Production cautions

- Daily request limits are atomically reserved per account in PostgreSQL; they are **not** monetary spending caps. Configure hard budgets and account limits with every provider separately.
- Authentication uses `scrypt` password hashing, opaque random server-side session tokens, HTTP-only SameSite cookies, and ownership-enforced database queries. Registration does not yet verify email or rate-limit password attempts. Put application behind an edge abuse-prevention service before exposing publicly.
- AI calls are currently nonstreaming. Network failures return a safe error; the request reservation is consumed.
- Conversation history is clipped to the last 20 messages for provider context; the stored conversation remains complete.
- Provider model IDs change over time. Override `OPENAI_MODEL`, `ANTHROPIC_MODEL`, `GEMINI_MODEL`, or `DEEPSEEK_MODEL` using current enabled IDs.
- `/api/health` is process-only, not a database or provider readiness check.
- API key availability is represented by the presence of a key, not a verified successful call.
- Set admin role only via a controlled administrator-run database change; users cannot self-promote.

## Planned subsequent releases

Advanced project storage, attachments and PDF retrieval, images, streaming text, verified payment/credits ledger, OAuth/MFA, email service, full moderation and platform support, granular workspace permissions, and agent workflows.


## V1.1 enhancements
- Same-origin protection on all mutating API routes (`APP_URL` recommended for production reverse proxies).
- PostgreSQL-backed per-account/IP auth throttling (15-minute windows).
- Per-user conversation rename and JSON data export.
- Account deletion removes dependent records through database cascade.
- Reduced exposure of provider error bodies and capped conversational context size.
- Security-related response headers.

**Important:** These mitigations are not a substitute for an external security audit. Cookies use SameSite=Lax and HttpOnly; production must use HTTPS, trusted proxy configuration, hard spend limits, and a genuine account verification/password reset flow before public launch. The current application does not offer billing or advanced studios.

Set `APP_URL=https://your-production-domain.example` in production. Initialize the schema again using `npm run db:init` to create the new `auth_attempts` table.

## V1.2 Full-Power Foundation upgrade (2026-10-14)

### Implemented in source
- Secure account password change endpoint (`POST /api/account/password`) requiring old password and revoking all login sessions.
- Session listing and revoke-other-sessions endpoints (`GET`/`DELETE /api/account/sessions`), with no bearer tokens returned to client.
- Owned project CRUD (`GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/:id`) with PostgreSQL-backed records and dashboard UI.
- Enforced maximum request body size against streamed bytes, not only Content-Length.
- Updated UI settings for changing password and revoking other sessions.
- New test cases for these protections and endpoints.

### Deploy/update checklist
1. Supply `DATABASE_URL`, `APP_URL`, `DATABASE_SSL` as appropriate and required AI provider API keys via secrets manager. Never expose secrets to frontend.
2. Run `npm install` then `npm run db:init` (idempotent CREATE TABLE statements append the `projects` table), `npm test`, `npm run lint`, and `npm run build`.
3. Verify auth, project CRUD, password change, session revocation, provider usage and quotas in a staging deployment before production.
4. Audit production rate limits, spend limits, API pricing, CSRF strategy, and restore from a database backup.

### Honest readiness status
The 17 built-in **source-level** tests passed in the build environment, but npm registry DNS was unavailable (`EAI_AGAIN`), so package installation, TypeScript build, real API calls, and browser E2E tests could not be verified here. Therefore this package is **not certified production-ready**. AI Studio, PDF processing, subscription billing, email reset, advanced agents, and project-to-chat linking are planned, **not implemented** in this version.

## V1.3 deployment readiness update
- Railway startup now initializes the idempotent PostgreSQL schema before running the application. For serious production use, replace this with controlled versioned migrations.
- `/api/health` checks database connectivity and required tables; no credentials are disclosed.
- GitHub Actions workflow runs tests, TypeScript checks and a build on push/PR.
- The package does **not** yet include a dependency lockfile due npm registry DNS failure in this environment. CI currently runs `npm install`; generate and commit `package-lock.json`, then switch to `npm ci` for reproducible builds.
- Configure `DATABASE_URL`, `APP_URL`, and provider API keys via Railway environment variables before deployment.
- Not production ready: email verification, real payment integration, spending enforcement, live provider tests, and full external review remain outstanding.

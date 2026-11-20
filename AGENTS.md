<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pizza Plaza Client

Next.js 16.4.6 App Router; single npm package, all source under `src/` (`@/*` → `src/*`). Frontend only: menu/order data comes from a separate Express API at `BASE_API_URL`; auth sessions and image upload are handled in this app.

## Commands

- `npm run dev` | `npm run build` | `npm start` | `npm run lint`. No test, format, or CI setup — don't look for `npm test`. Typecheck is `npx tsc --noEmit` (not an npm script). Single-file lint: `npx eslint src/app/menu/page.tsx`.
- Full check: `npx tsc --noEmit && npm run lint && npm run build`. All three currently pass clean (lint: 0 warnings).
- `next build` loads `.env`; `src/lib/auth.ts` throws at import if neither `BETTER_AUTH_DB_URL` nor `DB_URI` is set, so keep env populated.

## API / data flow

- All Express API calls go through `apiFetch()` in `src/lib/api-server.ts`: pass `withAuth: true` to attach a Better Auth JWT as `Authorization: Bearer <token>`; the API re-derives role/ownership. Pages pre-check `BASE_API_URL` and wrap calls in try/catch, showing `NoticeCard` "unavailable" states instead of throwing.
- `.env*` is gitignored; never commit its values. `README.md` says `cp .env.example .env`, but no `.env.example` is tracked — create `.env` manually. Required vars: `DB_URI` (or `BETTER_AUTH_DB_URL`), `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BASE_API_URL`, `IMGBB_SECRET`.
- Better Auth uses MongoDB database `pizzaplaza` with custom user fields (`role`, `isBlocked`, `businessName`, `subscriptionPlan`, `subscriptionExpiresAt`); handler at `src/app/api/auth/[...all]/route.ts`, client helpers at `src/lib/auth-client.ts`. Server code authorizes via `auth.api.getSession({ headers: await headers() })` (see `src/lib/auth-guard.ts`) — pass `headers()` and never trust client-supplied roles.
- Sign-up offers only `customer`/`vendor` and requires an uploaded image for email sign-up; admin is DB-assigned. `/api/upload-image` proxies to ImgBB with `IMGBB_SECRET`.
- `src/index.js` is a local, gitignored Express backend draft (`MONGO_CLIENT_URI`, default port 6000). It is not built by this repo and does not match the `.env` API URL.

## Framework / toolchain quirks

- `next.config.ts` enables `cacheComponents` + `partialPrefetching` on Turbopack. Request-time reads (`headers()`, Better Auth sessions, backend `fetch`) must sit inside `<Suspense>`. Routes that must block on the server also export `instant = false` — used by all three `dashboard/**/layout.tsx` and most request-time pages (`profile`, `menu/[id]`, `payment/success`, dashboards); add it when introducing request-time reads. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- Tailwind v4 with no `tailwind.config.*`: theme variables are in `src/app/globals.css`, and all CSS goes through `@tailwindcss/turbopack`. shadcn v4 `base-nova` style, RSC/TSX (`components.json`); add primitives with `npx shadcn add <name>` — they use `@base-ui/react`, not Radix. `src/lib/utils.ts` re-exports `cn` from the `cn` npm package.

## Routes / code layout

- Role dashboards live in `src/app/dashboard/{admin,vendor,customer}`; each role layout wraps children in `DashboardGuard`. Many pages are still placeholders (profile, payment, most dashboards); wired flows are menu browse/detail, auth forms, vendor add/my menu items and orders, customer my-orders, admin manage-users/menu review/transactions.
- Route folder casing is part of the URL: `admin/Transactions`, `vendor/Add-menu-items`, and the misspelled `admin/manange-menu-items` — preserve exact names when editing.
- Shared backend-shaped types live in `src/lib/types/all-types.ts` (`IUser`, `IMenuItem`, `IOrders`, `ITransactions`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pizza Plaza Client

Next.js 16.4.6 App Router app; single npm package, all source under `src/` (`@/*` → `src/*`). Frontend only: menu/order data comes from a separate API at `BASE_API_URL`; auth sessions and image upload are handled in this app.

## Commands

- `npm run dev` | `npm run build` | `npm start` | `npm run lint`. There are no test, typecheck, format, or CI configs — don't look for `npm test` / `npm run typecheck`.
- Verify with `npx tsc --noEmit && npm run lint && npm run build` (baseline: tsc clean, lint 5 warnings, build passes). Single-file lint: `npx eslint src/app/menu/page.tsx`.
- `next build` loads `.env`; `src/lib/auth.ts` throws at import if neither `BETTER_AUTH_DB_URL` nor `DB_URI` is set, so keep env populated.

## Framework / toolchain quirks

- `next.config.ts` enables `cacheComponents` + `partialPrefetching` on Turbopack. Request-time reads (`headers()`, Better Auth sessions, backend `fetch`) must sit inside `<Suspense>`; `src/app/menu/[id]/page.tsx` exports `instant = false` because the shared navbar reads the URL. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- Tailwind v4 with no `tailwind.config.*`: theme variables are in `src/app/globals.css`, and all CSS goes through `@tailwindcss/turbopack`. shadcn v4 `base-nova` style, RSC/TSX (`components.json`); add primitives with `npx shadcn add <name>` — they use `@base-ui/react`, not Radix. `src/lib/utils.ts` re-exports `cn` from the `cn` npm package.

## Environment / data flow

- `.env*` is gitignored; never commit its values. Required vars: `DB_URI` (or `BETTER_AUTH_DB_URL`), `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BASE_API_URL`, `IMGBB_SECRET`.
- Better Auth uses MongoDB database `pizzaplaza` with custom user fields (`role`, `isBlocked`, `businessName`, `subscriptionPlan`, `subscriptionExpiresAt`); handler at `src/app/api/auth/[...all]/route.ts`, client helpers at `src/lib/auth-client.ts`. Server code authorizes via `auth.api.getSession({ headers: await headers() })` — pass `headers()` and never trust client-supplied roles.
- Menu and order reads/writes call `${BASE_API_URL}/items` and `/orders`; a missing or unreachable API degrades to "unavailable" UI rather than throwing. `/api/upload-image` proxies to ImgBB with `IMGBB_SECRET`, and sign-up requires an uploaded image.
- `src/index.js` is a local, gitignored Express backend draft (`MONGO_CLIENT_URI`, default port 6000). It is not built by this repo and does not match the `.env` API URL.

## Routes / code layout

- Role dashboards live in `src/app/dashboard/{admin,vendor,customer}`. Many pages are still placeholder headings (profile, payment, most dashboards); wired flows are menu browse/detail, auth forms, vendor add/my menu items, and customer my-orders.
- Route folder casing is part of the URL: `admin/Transactions`, `vendor/Add-menu-items`, and the misspelled `admin/manange-menu-items` — preserve exact names when editing.
- Shared backend-shaped types live in `src/lib/types/all-types.ts` (`IUser`, `IMenuItem`, `IOrders`, `ITransactions`).

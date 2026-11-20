# PizzaHub — Pizza Ordering & Delivery Platform

PizzaHub is a role-based pizza ordering platform. Customers discover local pizzerias, browse and filter menus, place delivery orders and track them. Vendors manage their restaurant profile, menu items and incoming orders. Admins review submitted items, manage users and monitor subscription transactions.

This repository contains the **Next.js client**. The Express API lives in a separate repository.

## Links

- **Live site:** `[ADD AFTER DEPLOYMENT]`
- **Client repository:** https://github.com/emon-mehedi/pizza-plaza-client
- **Server repository:** https://github.com/emon-mehedi/pizza-plaza-server

> The live link and working admin credentials are intentionally left as TODO placeholders. Fill them in after deployment; do not put secret keys or `.env` files in the repository.

## Features

### Public

- Animated home page with featured approved items and category links.
- Browse menu with search, category and location filters, price range, sorting, loading and empty states.
- Item detail page with vendor information and a guarded order form.
- Email/password and Google authentication through Better Auth.

### Customer

- Dashboard overview with order totals.
- My orders with details and cancellation of pending orders only.
- Profile settings for name and profile image.

### Vendor

- Dashboard overview with menu and order statistics.
- Add, edit, delete and manage availability of menu items.
- Free plan limit of 3 active items; Premium unlocks unlimited items, a badge and featured placement.
- Accept or reject incoming orders and manage subscription upgrades.
- Customer orders are scoped to the logged-in vendor.

### Admin

- Dashboard overview with users, vendors, customers, menu items and transactions.
- User search/filter, block/unblock and user details.
- Menu item review (approve/reject/change status/delete).
- Read-only transaction monitoring.

## Technology stack

Main npm packages used in this client:

| Package | Purpose |
| --- | --- |
| `next@16.4.6` | App Router, Server Components and Cache Components |
| `react@19.3.0` / `react-dom@19.3.0` | UI runtime |
| `typescript` | Static typing |
| `tailwindcss@4.3.3` / `@tailwindcss/turbopack` | Styling |
| `shadcn@4.23.0` / `@base-ui/react` | Reusable UI primitives |
| `better-auth` / `@better-auth/mongo-adapter` / `mongodb` | Sessions, JWT plugin and Mongo persistence |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `tw-animate-css` | Home-page entrance animations |
| `cn` | Class-name utility |

## Local setup

You need Node.js 20+, npm, a MongoDB database and the Express API running.

```bash
git clone https://github.com/emon-mehedi/pizza-plaza-client.git
cd pizza-plaza-client
npm install
cp .env.example .env
# Fill in the values in .env
npm run dev
```

Open http://localhost:3000. Start the server repository separately and point `BASE_API_URL` at it (for example `http://localhost:5000`).

### Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # ESLint
npx tsc --noEmit # TypeScript check
```

## Environment variables

Create a local `.env` file from `.env.example`. Only the names are committed; never commit real values.

| Variable | Purpose |
| --- | --- |
| `DB_URI` | MongoDB connection string used by Better Auth |
| `BETTER_AUTH_DB_URL` | Optional override for the MongoDB connection string |
| `BETTER_AUTH_URL` | Public app origin; also the JWT issuer/audience |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `BASE_API_URL` | Base URL of the Express API |
| `IMGBB_SECRET` | ImgBB key used by `/api/upload-image` |

## Test accounts and payments

- **Admin email:** `[ADD WORKING ADMIN EMAIL AFTER DEPLOYMENT]`
- **Admin password:** `[ADD WORKING ADMIN PASSWORD AFTER DEPLOYMENT]`
- **Stripe test card:** `4242 4242 4242 4242`
- Use any future expiry date and any CVC.

Admin accounts are **not** created through public sign-up. The role is assigned securely in the database. Stripe is only used for the vendor Premium subscription; placing a pizza order does not require Stripe.

## How authentication and protected requests work

1. Better Auth stores the session in MongoDB and issues a JWT through its `jwt()` plugin.
2. `src/lib/api-server.ts` reads the token and sends it as `Authorization: Bearer <token>` to the Express API.
3. The Express API verifies the token against `${BETTER_AUTH_URL}/api/auth/jwks`, then re-reads role, blocked state and ownership from the database.
4. Client role checks are only for UI. Every protected API call is checked again on the server.

Because Cache Components are enabled, session reads are wrapped in `<Suspense>` and routes that read the URL/session at request time export `instant = false`. This avoids reload errors in production.

## Challenge notes

### 1. Advanced search and sorting

The menu browser filters items by name, category, location and minimum/maximum price, then sorts by newest, price ascending or price descending. Home-page category cards deep-link with `?category=...`, which the browser uses as its initial category. The featured section calls `GET /items?featured=1&limit=6`, so the API controls which approved items are promoted.

### 2. JWT / token verification

The client obtains a short-lived JWT from Better Auth and attaches it to protected API requests. The Express middleware verifies the signature, issuer, audience and expiry using the JWKS endpoint, then applies role and ownership checks before any write. Invalid or expired tokens receive `401`; wrong roles receive `403`.

### 3. Professional UI polish

The app uses a warm orange/red/cream theme, responsive grids, equal-height cards, shared dashboard components, skeletons, empty/error states, toast feedback and subtle staggered entrance animations. The global navbar and footer include role-aware links, contact information and current social icons (including the new X logo).

## Security notes

- Secrets and credentials live only in `.env`, which is gitignored.
- The client never sends roles or user IDs as authoritative data; the server derives them from the verified session.
- Profile updates cannot change `role`, `isBlocked`, `subscriptionPlan` or `subscriptionExpiresAt`.

# Estate Analytics

Property Management & Real-Time Performance Portal.

## Run locally

**Prerequisites:** Node.js, a Neon project with Managed Better Auth enabled, and a PostgreSQL database.

1. Install dependencies with `npm install`.
2. Run [`schema.sql`](./schema.sql) in a new, empty Neon database. For an existing database created from the former Clerk schema, run [`migrations/002_neon_auth_user_id.sql`](./migrations/002_neon_auth_user_id.sql) after the existing schema and dashboard-state migration, then run [`migrations/003_normalized_dashboard_data.sql`](./migrations/003_normalized_dashboard_data.sql).
3. Set `VITE_NEON_AUTH_URL` to the Neon Auth URL for the selected branch in `.env`.
4. Configure the API environment with the pooled `DATABASE_URL` (or `DATABASE_URL_POOLED`), `NEON_AUTH_BASE_URL`, and `NEON_AUTH_JWKS_URL`. Keep the database and JWKS values server-side; only the Neon Auth URL uses the public `VITE_` prefix.
5. Start the app with `npm run dev`.

The `/sign-up` and `/sign-in` pages use Neon Managed Better Auth with email and password. The dashboard is shown only after Neon Auth restores a valid session. Sign-up requires a name, email address, and password of at least eight characters.

The app has dedicated 404, 500, and maintenance screens. Unknown browser paths show 404, dashboard/API failures with server status codes show 500, and uncaught React rendering errors are caught by an error boundary. To enable maintenance mode, set `VITE_MAINTENANCE_MODE=true` for the frontend build and `MAINTENANCE_MODE=true` for the API runtime; the API then returns 503 with `Retry-After`. Disable both variables and redeploy to restore service.

`npm run dev` starts Vite with a development-only middleware that dispatches the `/api` routes to the same handlers used by the deployment. The production build does not include this middleware; the deployed Vercel app serves those handlers through its normal API runtime.

The dashboard loads and saves properties, units, tenants, payments, expenses, and M-Pesa logs in their individual PostgreSQL tables through `/api/dashboard`. The selected month is stored on the user's profile. Existing dashboard JSON snapshots are imported into the tables on the first load after this update. API routes verify Neon Auth JWTs against the configured JWKS and issuer, derive ownership from the signed token's `sub`, and apply that identity transaction-locally through PostgreSQL RLS. The database connection uses `@neondatabase/serverless` over WebSockets so these transactions also work from local development networks that block direct PostgreSQL TCP connections. The browser never supplies an authoritative owner ID.

For an existing database, run [`migrations/003_normalized_dashboard_data.sql`](./migrations/003_normalized_dashboard_data.sql) and [`migrations/004_api_rate_limits.sql`](./migrations/004_api_rate_limits.sql) after the existing migrations. The API imports and removes each user's legacy JSON snapshot transactionally after successfully writing its records to the normalized tables.

Authenticated API requests are rate-limited per user and route in a database-backed one-minute window. Dashboard writes are capped at 20/minute, reads at 120/minute, and property/payment writes at 30/minute. Dashboard payloads are capped at 1 MB; property and payment payloads at 32 KB.

Existing Clerk IDs and records are intentionally not remapped to new Neon Auth accounts. After applying the migration, prior rows remain intact under their legacy IDs and are inaccessible to newly created Neon Auth users unless an explicit ownership migration is designed later.

The API database role must not have `BYPASSRLS` privileges; the `neondb_owner` role bypasses RLS and is not appropriate for the application connection. Neon Auth user records are managed in the `neon_auth` schema; do not create a second application-owned auth table.

## Neon CLI setup

The project includes a [`neon.ts`](./neon.ts) configuration declaring Postgres and Managed Auth. From an authenticated Neon CLI session, link the intended project and branch with `neon login` and `neon link`, then use `neon deploy` to apply the declared services. Check the branch configuration with `neon neon-auth status`.

For local development, use the branch Auth URL for `VITE_NEON_AUTH_URL` and the matching `NEON_AUTH_BASE_URL` / `NEON_AUTH_JWKS_URL` values for the API. Email verification and custom SMTP, trusted production domains, and production hardening must be configured in Neon before launch.

## M-Pesa (Safaricom Daraja)

Rent collection uses Safaricom's Daraja API (Lipa na M-Pesa Online / STK Push). The dashboard no longer simulates M-Pesa: an STK Push is sent from the server, and the payment is recorded only when Safaricom's callback confirms it.

Server-only variables (never use a `VITE_` prefix, and never commit real values):

| Variable | Purpose |
| --- | --- |
| `DARAJA_CONSUMER_KEY` | Consumer key from the Daraja app |
| `DARAJA_CONSUMER_SECRET` | Consumer secret from the Daraja app |
| `DARAJA_PASSKEY` | Lipa na M-Pesa Online passkey for the shortcode |
| `DARAJA_SHORTCODE` | Paybill / shortcode used for STK Push (sandbox shared code is `174379`) |
| `DARAJA_ENV` | `sandbox` (default) or `production` |
| `DARAJA_CALLBACK_URL` | Absolute public HTTPS URL of the callback, e.g. `https://your-app.vercel.app/api/mpesa/callback` |

Setup:

1. Create an app on [developer.safaricom.co.ke](https://developer.safaricom.co.ke) with Lipa na M-Pesa Online (M-Pesa Express) enabled, then copy its consumer key, consumer secret, passkey and shortcode into `.env`.
2. Set `DARAJA_CALLBACK_URL` to a publicly reachable HTTPS endpoint. Safaricom cannot reach `localhost`; use an HTTPS tunnel while developing locally, or the deployed Vercel URL.
3. Apply [`archive/migrations/005_daraja_stk_requests.sql`](./archive/migrations/005_daraja_stk_requests.sql) to record pending STK Push requests.
4. Restart the app. `GET /api/mpesa/config` reports whether the credentials were loaded.

Routes: `POST /api/mpesa/stkpush` (authenticated), `GET /api/mpesa/status` (authenticated, reconciles with Safaricom's STK query when a callback is slow), `GET /api/mpesa/config` (authenticated, non-sensitive display values), and `POST /api/mpesa/callback` (called by Safaricom without a Neon Auth session; a callback is trusted only when its `CheckoutRequestID` matches a request this server created, and repeated callbacks are idempotent).

In production set the same values as Vercel project environment variables. Until the four Daraja credentials and the callback URL are set, the STK Push routes answer `503` with a message naming the missing variables.

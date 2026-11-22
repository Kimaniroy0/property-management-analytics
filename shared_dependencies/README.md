# Shared frontend dependencies

These canonical frontend modules are used across multiple screens:

- `auth.ts` provides the shared Neon Auth client/session token helper.
- `dashboardApi.ts` provides the dashboard API client.
- `PropertyContext.tsx` provides shared entity state and actions to the feature views.

Each original module is present once here; no duplicate source copies were created.
# Shared dependencies

Mark's dashboard/API code relies on Ved's `database/db.ts` and `database/authenticatedDb.ts`, and uses the shared contracts owned by Nathan at `apis/types/index.ts`. The canonical files remain with those owners; this folder contains no duplicated implementation.

The API handlers in this folder use Ved's canonical database connection and authenticated transaction helper. Frontend and backend code share the contracts in `../apis/types/`; the types file is owned here and was not duplicated elsewhere.

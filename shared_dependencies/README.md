# Shared dependencies

Mark's dashboard/API code relies on Ved's `database/db.ts` and `database/authenticatedDb.ts`, and uses the shared contracts owned by Nathan at `apis/types/index.ts`. The canonical files remain with those owners; this folder contains no duplicated implementation.

The API handlers in this folder use Ved's canonical database connection and authenticated transaction helper. Frontend and backend code share the contracts in `../apis/types/`; the types file is owned here and was not duplicated elsewhere.

BEGIN;

CREATE TABLE IF NOT EXISTS mpesa_stk_requests (
  id UUID PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  checkout_request_id VARCHAR(64) NOT NULL UNIQUE,
  merchant_request_id VARCHAR(64),
  tenant_id UUID NOT NULL,
  tenant_name TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  phone VARCHAR(20) NOT NULL,
  month VARCHAR(7) NOT NULL CHECK (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Processed', 'Failed')),
  result_code INTEGER,
  result_desc TEXT,
  mpesa_receipt VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Deliberately no row-level security: the Safaricom callback arrives without a user identity and
-- must resolve the owning account from the CheckoutRequestID. This table is never exposed directly
-- to the browser; every authenticated handler filters by owner_id, and it holds no secrets.
CREATE INDEX IF NOT EXISTS mpesa_stk_requests_owner_created_idx
  ON mpesa_stk_requests (owner_id, created_at DESC);

COMMIT;

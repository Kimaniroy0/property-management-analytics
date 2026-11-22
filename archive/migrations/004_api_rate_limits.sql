BEGIN;

CREATE TABLE IF NOT EXISTS api_rate_limits (
  owner_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  route VARCHAR(100) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  PRIMARY KEY (owner_id, route)
);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS api_rate_limits_isolation ON api_rate_limits;
CREATE POLICY api_rate_limits_isolation ON api_rate_limits
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

COMMIT;

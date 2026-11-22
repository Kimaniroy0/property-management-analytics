BEGIN;

CREATE TABLE IF NOT EXISTS user_dashboard_state (
  clerk_user_id TEXT PRIMARY KEY
    REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT jsonb_build_object(
    'properties', '[]'::jsonb,
    'units', '[]'::jsonb,
    'tenants', '[]'::jsonb,
    'payments', '[]'::jsonb,
    'maintenanceExpenses', '[]'::jsonb,
    'generalExpenses', '[]'::jsonb,
    'mpesaLogs', '[]'::jsonb,
    'selectedMonth', to_char(CURRENT_DATE, 'YYYY-MM')
  ),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_dashboard_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_state FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_dashboard_state'
      AND policyname = 'user_dashboard_state_isolation'
  ) THEN
    CREATE POLICY user_dashboard_state_isolation ON user_dashboard_state
      USING (clerk_user_id = NULLIF(current_setting('app.clerk_user_id', TRUE), ''))
      WITH CHECK (clerk_user_id = NULLIF(current_setting('app.clerk_user_id', TRUE), ''));
  END IF;
END;
$$;

COMMIT;

SELECT
  tablename,
  rowsecurity AS row_level_security_enabled,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename = 'user_dashboard_state'
     AND policyname = 'user_dashboard_state_isolation') = 1 AS user_isolation_policy_exists
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_dashboard_state';

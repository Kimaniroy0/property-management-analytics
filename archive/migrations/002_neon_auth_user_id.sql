BEGIN;

ALTER TABLE user_profiles RENAME COLUMN clerk_user_id TO user_id;
ALTER TABLE user_dashboard_state RENAME COLUMN clerk_user_id TO user_id;

DROP POLICY IF EXISTS user_profiles_isolation ON user_profiles;
DROP POLICY IF EXISTS user_dashboard_state_isolation ON user_dashboard_state;
DROP POLICY IF EXISTS properties_isolation ON properties;
DROP POLICY IF EXISTS units_isolation ON units;
DROP POLICY IF EXISTS tenants_isolation ON tenants;
DROP POLICY IF EXISTS payments_isolation ON payments;
DROP POLICY IF EXISTS maintenance_expenses_isolation ON maintenance_expenses;
DROP POLICY IF EXISTS general_expenses_isolation ON general_expenses;
DROP POLICY IF EXISTS mpesa_callback_logs_isolation ON mpesa_callback_logs;

CREATE POLICY user_profiles_isolation ON user_profiles
  USING (user_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY user_dashboard_state_isolation ON user_dashboard_state
  USING (user_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY properties_isolation ON properties
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY units_isolation ON units
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY tenants_isolation ON tenants
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY payments_isolation ON payments
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY maintenance_expenses_isolation ON maintenance_expenses
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY general_expenses_isolation ON general_expenses
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

CREATE POLICY mpesa_callback_logs_isolation ON mpesa_callback_logs
  USING (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''))
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', TRUE), ''));

COMMIT;

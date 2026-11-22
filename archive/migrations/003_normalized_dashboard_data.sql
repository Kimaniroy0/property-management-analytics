BEGIN;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS selected_month VARCHAR(7)
  NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')
  CHECK (selected_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');

COMMIT;

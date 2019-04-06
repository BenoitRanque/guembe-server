BEGIN;

WITH administrator_account AS (
    SELECT account_id FROM auth.account
    WHERE username = 'admin'
)
DELETE FROM auth.account_role
WHERE account_id = (SELECT account_id FROM administrator_account);
AND role_name LIKE 'admittance-%';

DELETE FROM auth.role
WHERE role_name LIKE 'admittance-%';

COMMIT;
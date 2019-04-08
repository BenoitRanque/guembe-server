BEGIN;

WITH administrator_account AS (
    SELECT account_id FROM auth.account
    WHERE username = 'admin'
), auth_roles AS (
    INSERT INTO auth.role
        (role_name, description)
    VALUES
        ('admittance-create-bracelet', 'Crear Manillas'),
        ('admittance-create-series', 'Crear Series')
    RETURNING role_name
)
INSERT INTO auth.account_role
    (account_id, role_name)
SELECT
    account_id, role_name
FROM administrator_account CROSS JOIN auth_roles;

COMMIT;
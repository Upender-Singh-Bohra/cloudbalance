-- Insert roles
INSERT INTO roles (name, description, created_at) VALUES
('ROLE_ADMIN', 'Administrator with full access to all features', NOW()),
('ROLE_READ_ONLY', 'Read-only access to all dashboards', NOW()),
('ROLE_CUSTOMER', 'Customer with access to assigned accounts', NOW());

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, first_name, last_name, email, role_id, created_at)
VALUES ('admin', '$2a$10$DlsnbFEs8Hh9abd.xALyLO33EcWpiqyMZMtHY8I/Br9Pw2c4AOjDe', 'Admin', 'User', 'admin@cloudbalance.com',
        (SELECT id FROM roles WHERE name = 'ROLE_ADMIN'), NOW());

---- Insert read-only user (password: readonly123)
--INSERT INTO users (username, password, first_name, last_name, email, role_id, created_at)
--VALUES ('readonly', '$2a$10$1zYtvjrDLGPtSaDqMMiZ.u3uw2onRYP3LVm0bR0QqP7kpQ.pBDK6O', 'Read', 'Only', 'readonly@cloudbalance.com',
--        (SELECT id FROM roles WHERE name = 'ROLE_READ_ONLY'), NOW());
--
---- Insert customer user (password: customer123)
--INSERT INTO users (username, password, first_name, last_name, email, role_id, created_at)
--VALUES ('customer', '$2a$10$bfIRm3UTr1YR0/p.oWfkueKXWEwWwKWvNZuBh5Gxg4.XvKdoKtOFi', 'Sample', 'Customer', 'customer@cloudbalance.com',
--        (SELECT id FROM roles WHERE name = 'ROLE_CUSTOMER'), NOW());
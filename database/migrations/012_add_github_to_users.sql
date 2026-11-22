-- 012_add_github_to_users.sql
-- Добавление поля для ссылки на GitHub в таблицу users

ALTER TABLE users 
ADD COLUMN github_url VARCHAR(255);
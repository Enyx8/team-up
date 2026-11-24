-- Ссылка на репозиторий проекта (для анкеты команды / опенсорса).
-- Личный GitHub человека лежит в users.github_url.

ALTER TABLE listings
ADD COLUMN github_url VARCHAR(255);

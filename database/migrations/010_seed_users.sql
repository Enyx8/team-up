-- Заполнение базы тестовыми данными (справочники + 5 пользователей со связями)

-- 1. Справочник вузов
INSERT INTO universities (name, city) VALUES 
('ИТМО', 'Санкт-Петербург'), 
('СПбГУ', 'Санкт-Петербург'),
('МГТУ им. Баумана', 'Москва')
ON CONFLICT DO NOTHING;

-- 2. Справочник навыков
INSERT INTO skills (name, category) VALUES 
('Python', 'язык'),
('Go', 'язык'),
('Figma', 'дизайн'),
('PostgreSQL', 'инструмент'),
('React', 'фреймворк')
ON CONFLICT DO NOTHING;

-- 3. Пользователи (5 человек)
-- Используем CTE, чтобы получить id вузов и подставить их
WITH uni AS (
    SELECT id, name FROM universities WHERE name IN ('ИТМО', 'СПбГУ', 'МГТУ им. Баумана')
)
INSERT INTO users (email, password_hash, full_name, university_id, course, telegram, avatar_color)
VALUES
('alex@example.com',    '$2b$12$dummyhash123', 'Алексей Смирнов',  (SELECT id FROM uni WHERE name = 'ИТМО'), 3, '@alex_s',  '#FF5733'),
('maria@example.com',   '$2b$12$dummyhash123', 'Мария Иванова',    (SELECT id FROM uni WHERE name = 'СПбГУ'), 2, '@maria_i', '#33FF57'),
('ivan@example.com',    '$2b$12$dummyhash123', 'Иван Петров',      (SELECT id FROM uni WHERE name = 'МГТУ им. Баумана'), 4, '@ivan_p',  '#3357FF'),
('elena@example.com',   '$2b$12$dummyhash123', 'Елена Соколова',   (SELECT id FROM uni WHERE name = 'ИТМО'), 1, '@elena_s', '#FF33F1'),
('dmitry@example.com',  '$2b$12$dummyhash123', 'Дмитрий Козлов',   (SELECT id FROM uni WHERE name = 'СПбГУ'), 5, '@dmitry_k','#33FFF5');

-- 4. Навыки пользователей (user_skills)
-- Связываем пользователей с навыками по email и названию навыка
INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN skills s
WHERE 
    (u.email = 'alex@example.com' AND s.name IN ('Python', 'PostgreSQL', 'React')) OR
    (u.email = 'maria@example.com' AND s.name IN ('Figma')) OR
    (u.email = 'ivan@example.com' AND s.name IN ('Go', 'PostgreSQL')) OR
    (u.email = 'elena@example.com' AND s.name IN ('Python', 'React')) OR
    (u.email = 'dmitry@example.com' AND s.name IN ('Figma', 'Python'))
ON CONFLICT DO NOTHING;
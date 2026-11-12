-- 011_seed_frontend_data.sql
-- 8 студентов + 2 команды

-- 1. Вузы
INSERT INTO universities (name, city) VALUES 
('ВШЭ', 'Москва'), 
('МГУ', 'Москва'), 
('ИТМО', 'Санкт-Петербург'), 
('МФТИ', 'Москва'), 
('СПбГУ', 'Санкт-Петербург'), 
('РТУ МИРЭА', 'Москва')
ON CONFLICT DO NOTHING;

-- 2. Навыки
INSERT INTO skills (name, category) VALUES 
('React', 'Фронтенд'),
('TypeScript', 'Фронтенд'),
('Flutter', 'Фронтенд'),
('Python', 'Бэкенд'),
('Node.js', 'Бэкенд'),
('Machine Learning', 'Аналитика'),
('Figma', 'Дизайн'),
('Product', 'Дизайн')
ON CONFLICT DO NOTHING;

-- 3. Пользователи (telegram и avatar_color оставляем NULL)
-- 10 человек: 8 студентов и 2 автора команд
INSERT INTO users (email, password_hash, full_name, university_id, course) VALUES
-- Студенты
('masha@example.com',   '$2b$12$dummyhash', 'Маша Ким',        (SELECT id FROM universities WHERE name = 'ВШЭ' LIMIT 1),  2),
('oleg@example.com',    '$2b$12$dummyhash', 'Олег Иванов',     (SELECT id FROM universities WHERE name = 'МГУ' LIMIT 1),  4),
('ivan@example.com',    '$2b$12$dummyhash', 'Иван Петров',     (SELECT id FROM universities WHERE name = 'ИТМО' LIMIT 1), 1),
('anna@example.com',    '$2b$12$dummyhash', 'Анна Смирнова',   (SELECT id FROM universities WHERE name = 'СПбГУ' LIMIT 1), 3),
('pavel@example.com',   '$2b$12$dummyhash', 'Павел Волков',    (SELECT id FROM universities WHERE name = 'РТУ МИРЭА' LIMIT 1), 2),
('elena@example.com',   '$2b$12$dummyhash', 'Елена Соколова',  (SELECT id FROM universities WHERE name = 'ВШЭ' LIMIT 1),  1),
('maxim@example.com',   '$2b$12$dummyhash', 'Максим Орлов',    (SELECT id FROM universities WHERE name = 'МГУ' LIMIT 1),  5),
('kate@example.com',    '$2b$12$dummyhash', 'Екатерина Лебедева', (SELECT id FROM universities WHERE name = 'ИТМО' LIMIT 1), 4),
-- Авторы команд
('alex@example.com',    '$2b$12$dummyhash', 'Алексей Воронов', (SELECT id FROM universities WHERE name = 'МФТИ' LIMIT 1), 3),
('dmitry@example.com',  '$2b$12$dummyhash', 'Дмитрий Козлов',  (SELECT id FROM universities WHERE name = 'СПбГУ' LIMIT 1), 4)
ON CONFLICT (email) DO NOTHING;

-- 4. Анкеты (listings)
INSERT INTO listings (author_id, type, role_focus, bio, format, status, hackathons_count)
VALUES
-- 8 Студентов ищут команду (seeking_team)
((SELECT id FROM users WHERE email = 'masha@example.com'),  'seeking_team', 'frontend', 'Frontend-разработчик, хочу в команду.', 'online', 'active', 1),
((SELECT id FROM users WHERE email = 'oleg@example.com'),   'seeking_team', 'backend',  'Пишу на Node.js, ищу команду.', 'offline', 'active', 2),
((SELECT id FROM users WHERE email = 'ivan@example.com'),   'seeking_team', 'ml',       'Студент, занимаюсь ML.', 'online', 'active', 0),
((SELECT id FROM users WHERE email = 'anna@example.com'),   'seeking_team', 'design',   'Дизайнер интерфейсов.', 'online', 'active', 1),
((SELECT id FROM users WHERE email = 'pavel@example.com'),  'seeking_team', 'backend',  'Бэкенд на Python, хочу на хакатон.', 'offline', 'active', 3),
((SELECT id FROM users WHERE email = 'elena@example.com'),  'seeking_team', 'fullstack','Фуллстек, ищу интересный проект.', 'online', 'active', 2),
((SELECT id FROM users WHERE email = 'maxim@example.com'),  'seeking_team', 'mobile',   'Пишу на Flutter, ищу команду.', 'offline', 'active', 1),
((SELECT id FROM users WHERE email = 'kate@example.com'),   'seeking_team', 'qa',       'Тестировщик, хочу помочь с проектом.', 'online', 'active', 0),
-- 2 Команды ищут людей (seeking_members)
((SELECT id FROM users WHERE email = 'alex@example.com'),   'seeking_members', 'ml',       'Ищем в команду ML-инженера и фронтендера.', 'online', 'active', 3),
((SELECT id FROM users WHERE email = 'dmitry@example.com'), 'seeking_members', 'design',   'Собираем команду на хакатон, нужны дизайнеры.', 'offline', 'active', 1);

-- 5. Навыки на анкетах (listing_skills)
INSERT INTO listing_skills (listing_id, skill_id)
SELECT l.id, s.id
FROM listings l
JOIN users u ON l.author_id = u.id
CROSS JOIN skills s
WHERE 
    -- Студенты
    (u.email = 'masha@example.com' AND s.name IN ('React', 'TypeScript', 'Flutter')) OR
    (u.email = 'oleg@example.com' AND s.name IN ('Node.js', 'Python')) OR
    (u.email = 'ivan@example.com' AND s.name IN ('Python', 'Machine Learning')) OR
    (u.email = 'anna@example.com' AND s.name IN ('Figma', 'Product')) OR
    (u.email = 'pavel@example.com' AND s.name IN ('Python')) OR
    (u.email = 'elena@example.com' AND s.name IN ('React', 'Node.js', 'TypeScript')) OR
    (u.email = 'maxim@example.com' AND s.name IN ('Flutter')) OR
    (u.email = 'kate@example.com' AND s.name IN ('Python', 'Node.js')) OR
    -- Команды
    (u.email = 'alex@example.com' AND s.name IN ('Python', 'Machine Learning')) OR
    (u.email = 'dmitry@example.com' AND s.name IN ('Figma', 'Product'))
ON CONFLICT DO NOTHING;

-- 6. Кого ищут команды (listing_roles) — только для seeking_members
INSERT INTO listing_roles (listing_id, role_focus, slots_needed)
SELECT l.id, 'frontend'::role_focus, 1
FROM listings l JOIN users u ON l.author_id = u.id
WHERE u.email = 'alex@example.com'
UNION ALL
SELECT l.id, 'design'::role_focus, 2
FROM listings l JOIN users u ON l.author_id = u.id
WHERE u.email = 'dmitry@example.com';
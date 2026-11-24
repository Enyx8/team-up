-- Демо-ссылки: личный GitHub у студентов, репозиторий проекта у команд.

UPDATE users SET github_url = 'https://github.com/masha-kim'
WHERE email = 'masha@example.com' AND github_url IS NULL;

UPDATE users SET github_url = 'https://github.com/oleg-ivanov'
WHERE email = 'oleg@example.com' AND github_url IS NULL;

UPDATE users SET github_url = 'https://github.com/ivan-petrov'
WHERE email = 'ivan@example.com' AND github_url IS NULL;

UPDATE users SET github_url = 'https://github.com/anna-smirnova'
WHERE email = 'anna@example.com' AND github_url IS NULL;

UPDATE listings SET github_url = 'https://github.com/campusmind/app'
WHERE type = 'seeking_members'
  AND author_id IN (SELECT id FROM users WHERE email IN ('alex@example.com', 'alexey@example.com'))
  AND github_url IS NULL;

UPDATE listings SET github_url = 'https://github.com/greenroute/hack'
WHERE type = 'seeking_members'
  AND author_id IN (SELECT id FROM users WHERE email IN ('dmitry@example.com', 'dmitriy@example.com'))
  AND github_url IS NULL;

-- Если авторов команд зовут иначе (другие сиды) — проставь репозиторий всем командам без ссылки.
UPDATE listings SET github_url = 'https://github.com/dream-team/hackathon'
WHERE type = 'seeking_members' AND github_url IS NULL;

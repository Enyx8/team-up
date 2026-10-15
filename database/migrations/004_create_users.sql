CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    university_id INT REFERENCES universities(id),
    course SMALLINT CHECK (course BETWEEN 1 AND 6),
    telegram VARCHAR(150),
    avatar_color VARCHAR(7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TYPE listing_type AS ENUM ('seeking_team', 'seeking_members');
CREATE TYPE listing_format AS ENUM ('online', 'offline');
CREATE TYPE listing_status AS ENUM ('active', 'closed');
CREATE TYPE role_focus AS ENUM (
    'backend',
    'frontend',
    'fullstack',
    'mobile',
    'ml',
    'data',
    'devops',
    'qa',
    'design',
    'pm'
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type listing_type NOT NULL,
    role_focus role_focus,
    bio TEXT,
    format listing_format NOT NULL DEFAULT 'online',
    status listing_status NOT NULL DEFAULT 'active',
    hackathons_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE listing_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    role_focus role_focus NOT NULL,
    slots_needed SMALLINT NOT NULL DEFAULT 1
);
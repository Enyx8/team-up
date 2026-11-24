CREATE TABLE listing_skills (
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, skill_id)
);
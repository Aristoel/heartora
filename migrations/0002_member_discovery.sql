CREATE TABLE IF NOT EXISTS member_profiles (
    user_id TEXT PRIMARY KEY,
    bio TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    profile_photo_url TEXT NOT NULL DEFAULT '',
    interests TEXT NOT NULL DEFAULT '',
    show_in_discovery INTEGER NOT NULL DEFAULT 1
        CHECK (show_in_discovery IN (0, 1)),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_discovery
ON member_profiles (show_in_discovery, updated_at);

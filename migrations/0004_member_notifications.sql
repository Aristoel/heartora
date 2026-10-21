-- HEARTORA: MEMBER NOTIFICATIONS
-- Supports notifications for messages, matches, likes,
-- and other member activity.

CREATE TABLE IF NOT EXISTS member_notifications (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL,

    actor_id TEXT,

    type TEXT NOT NULL
        CHECK (
            type IN (
                'message',
                'like',
                'match',
                'profile_view',
                'system'
            )
        ),

    title TEXT NOT NULL,

    body TEXT NOT NULL DEFAULT '',

    related_id TEXT,

    is_read INTEGER NOT NULL DEFAULT 0
        CHECK (is_read IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    read_at TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Quickly retrieve a member's newest notifications.
CREATE INDEX IF NOT EXISTS idx_member_notifications_user_created
ON member_notifications (user_id, created_at DESC);

-- Quickly retrieve unread notifications.
CREATE INDEX IF NOT EXISTS idx_member_notifications_user_unread
ON member_notifications (user_id, is_read, created_at DESC);

-- Help find notifications associated with a member activity.
CREATE INDEX IF NOT EXISTS idx_member_notifications_related
ON member_notifications (related_id);

-- HEARTORA: PRIVATE MEMBER MESSAGING

CREATE TABLE IF NOT EXISTS member_conversations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS member_conversation_participants (
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (conversation_id, user_id),

  FOREIGN KEY (conversation_id)
    REFERENCES member_conversations(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON member_conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS member_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,

  FOREIGN KEY (conversation_id)
    REFERENCES member_conversations(id)
    ON DELETE CASCADE,

  FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_messages_conversation
  ON member_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS member_blocks (
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (blocker_id, blocked_id),

  FOREIGN KEY (blocker_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (blocked_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_member_blocks_blocked
  ON member_blocks(blocked_id);

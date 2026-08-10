CREATE TABLE IF NOT EXISTS likes (
  page_id TEXT PRIMARY KEY,
  count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id   TEXT NOT NULL,
  openid     TEXT NOT NULL,
  nickname   TEXT NOT NULL DEFAULT '舞友',
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_comments_video_time
  ON comments(video_id, created_at DESC);

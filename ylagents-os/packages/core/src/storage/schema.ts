/**
 * AgentFS Schema Definitions
 * Adapted from AionCore Rust repositories.
 */

export const AGENT_FS_SCHEMA = `
-- Provider configuration (LLM, Sync, MCP)
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'openai', 'anthropic', 'ollama', etc.
  name TEXT NOT NULL,
  base_url TEXT,
  api_key_ref TEXT, -- Reference to native secure storage
  models TEXT, -- JSON array of supported models
  capabilities TEXT, -- JSON metadata
  enabled INTEGER DEFAULT 1,
  created_at INTEGER,
  updated_at INTEGER
);

-- Conversation state
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'native',
  name TEXT,
  status TEXT DEFAULT 'active',
  workspace TEXT,
  model TEXT,
  assistant_id TEXT,
  extra TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Message history
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'text', 'tool_call', 'tool_result'
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT,
  position REAL,
  status TEXT DEFAULT 'sent',
  hidden INTEGER DEFAULT 0,
  created_at INTEGER,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- MCP Server configuration
CREATE TABLE IF NOT EXISTS mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled INTEGER DEFAULT 1,
  transport TEXT NOT NULL, -- 'http-sse', 'stdio' (desktop only)
  tools TEXT, -- Cached JSON tools list
  last_test_status TEXT,
  last_connected INTEGER,
  original_json TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Assistant (Agent) profiles
CREATE TABLE IF NOT EXISTS assistants (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'builtin', 'user'
  name TEXT NOT NULL,
  name_i18n TEXT,
  description TEXT,
  avatar TEXT,
  enabled INTEGER DEFAULT 1,
  sort_order INTEGER,
  preset_agent_type TEXT DEFAULT 'native',
  enabled_skills TEXT, -- JSON array
  disabled_builtin_skills TEXT, -- JSON array
  context TEXT,
  prompts TEXT,
  models TEXT,
  last_used_at INTEGER,
  created_at INTEGER,
  updated_at INTEGER
);

-- Assistant per-conversation overrides
CREATE TABLE IF NOT EXISTS assistant_overrides (
  assistant_id TEXT PRIMARY KEY,
  enabled INTEGER,
  sort_order INTEGER,
  last_used_at INTEGER,
  last_model_id TEXT,
  last_permission_value TEXT,
  last_skill_ids TEXT,
  last_mcp_ids TEXT,
  last_disabled_builtin_skill_ids TEXT
);

-- Runtime-installable Skills
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  source TEXT NOT NULL, -- 'builtin', 'user', 'extension'
  version TEXT,
  tags TEXT, -- Comma-separated or JSON
  enabled INTEGER DEFAULT 1,
  is_auto_inject INTEGER DEFAULT 0,
  content TEXT NOT NULL, -- The full SKILL.md body
  raw_frontmatter TEXT,
  file_size INTEGER,
  installed_at INTEGER,
  updated_at INTEGER
);

-- Full-text search for skills and messages
CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(name, description, tags, content, content=skills);
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(content, content=messages);

-- Multi-agent Team System
CREATE TABLE IF NOT EXISTS mailbox (
  id TEXT PRIMARY KEY,
  sender_id TEXT,
  recipient_id TEXT,
  content TEXT,
  status TEXT DEFAULT 'unread',
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS team_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  created_at INTEGER,
  updated_at INTEGER
);

-- System state and preferences
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS client_preferences (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS sync_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  last_sync_at INTEGER,
  sync_provider_id TEXT,
  remote_db_url TEXT,
  sync_enabled INTEGER DEFAULT 0
);

-- Audit trail for state changes
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT
);
`;

CREATE TABLE IF NOT EXISTS relay_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(32) UNIQUE NOT NULL,
    pin VARCHAR(6) NOT NULL,
    created_at BIGINT NOT NULL,
    last_ping BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    pending_commands TEXT NOT NULL DEFAULT '[]',
    pc_info TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_relay_pin ON relay_sessions(pin);
CREATE INDEX IF NOT EXISTS idx_relay_session_id ON relay_sessions(session_id);

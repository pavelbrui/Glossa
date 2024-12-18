-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Service languages junction table
CREATE TABLE IF NOT EXISTS service_languages (
  service_id INTEGER,
  language_id INTEGER,
  PRIMARY KEY (service_id, language_id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

-- Service attendees
CREATE TABLE IF NOT EXISTS service_attendees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  session_id TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Insert default admin user (password: 123)
INSERT OR IGNORE INTO users (username, password_hash, is_admin) 
VALUES ('admin', '$2b$10$8KbJ/UFxG.YeVHzQn8RPkuuq.MV3nYjdVXzMJveWZxhqZFS6WBWPy', TRUE);

-- Insert default languages
INSERT OR IGNORE INTO languages (name) VALUES 
('English'),
('Spanish'),
('French'),
('Korean');
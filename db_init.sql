CREATE DATABASE IF NOT EXISTS file_storage;

USE file_storage;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sessions_user_id (user_id),
  INDEX idx_user_sessions_session_id (session_id),
  INDEX idx_user_sessions_refresh_token (refresh_token)
);

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  extension VARCHAR(10) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  upload_date DATETIME NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_files_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS blocked_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  token_type ENUM('access', 'refresh') DEFAULT 'access',
  user_id VARCHAR(255),
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX idx_blocked_tokens_token (token),
  INDEX idx_blocked_tokens_user_id (user_id),
  INDEX idx_blocked_tokens_expires_at (expires_at)
);
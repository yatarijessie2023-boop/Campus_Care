CREATE DATABASE IF NOT EXISTS fcu_campus_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fcu_campus_report;

CREATE TABLE admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buildings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('repair','cleaning') NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_no VARCHAR(30) NOT NULL UNIQUE,
  reporter_identifier VARCHAR(50),
  reporter_name VARCHAR(100) NOT NULL,
  reporter_email VARCHAR(150) NOT NULL,
  building_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  floor VARCHAR(30),
  location_detail VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  status ENUM('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
  admin_reply TEXT,
  updated_by BIGINT UNSIGNED,
  archived_at TIMESTAMP NULL,
  archived_by BIGINT UNSIGNED,
  archive_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_reports_building FOREIGN KEY (building_id) REFERENCES buildings(id),
  CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_reports_admin FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_reports_status_created (status, created_at),
  INDEX idx_reports_building (building_id),
  INDEX idx_reports_category (category_id)
);

CREATE TABLE report_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE TABLE report_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','processing','completed','rejected') NOT NULL,
  note TEXT,
  changed_by BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_admin FOREIGN KEY (changed_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_history_report_created (report_id, created_at)
);

INSERT INTO buildings (code, name, latitude, longitude) VALUES
('ENG', '資訊電機館', 24.1799300, 120.6481300),
('BUS', '商學館', 24.1793000, 120.6468000),
('LIB', '圖書館', 24.1803000, 120.6473000),
('LANG', '人言大樓', 24.1801100, 120.6477900),
('ADM1', '行政一館', 24.1797000, 120.6474500),
('ADM2', '行政二館', 24.1796300, 120.6472200),
('CORE', '忠勤樓', 24.1794200, 120.6479700),
('ENG2', '科學與航太館', 24.1807600, 120.6485200),
('CIVIL', '土木水利館', 24.1802800, 120.6487200),
('GYM', '體育館', 24.1810000, 120.6480000),
('COGS', '共善樓', 24.1778000, 120.6459000),
('MUSE', '丘逢甲紀念館', 24.1800200, 120.6480200),
('FUXING', '福星校區', 24.1755000, 120.6455000),
('OTHER', '其他地點', NULL, NULL);

INSERT INTO categories (name, type, sort_order) VALUES
('修繕', 'repair', 1), ('清潔', 'cleaning', 2), ('其他問題', 'repair', 3),
('電燈不亮', 'repair', 4), ('冷氣不冷', 'repair', 5), ('漏水', 'repair', 6),
('磁磚隆起', 'repair', 7), ('廁所清潔', 'cleaning', 8), ('教室清潔', 'cleaning', 9), ('用餐區清潔', 'cleaning', 10);

-- 建立管理員前，請先用 bcrypt 產生密碼雜湊，再執行：
-- INSERT INTO admins (username, password_hash, display_name, role) VALUES ('admin', '<bcrypt hash>', '系統管理員', 'admin');

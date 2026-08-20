import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true
  }
};

async function ensureDatabase() {
  const adminConnection = await mysql.createConnection(baseConfig);
  try {
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await adminConnection.end();
  }
}

async function ensureSchema() {
  const connection = await mysql.createConnection({
    ...baseConfig,
    database: process.env.DB_NAME,
  });
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'reports'`,
      [process.env.DB_NAME]
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(30) UNIQUE,
        name VARCHAR(100) NOT NULL,
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('repair','cleaning') NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reports (
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
      )
    `);
    const [identifierColumns] = await connection.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = 'reports' AND column_name = 'reporter_identifier'
    `, [process.env.DB_NAME]);
    if (Number(identifierColumns[0].count) === 0) {
      await connection.query(`ALTER TABLE reports ADD COLUMN reporter_identifier VARCHAR(50) AFTER report_no`);
    }
    const [archiveColumns] = await connection.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = ? AND table_name = 'reports'
        AND column_name IN ('archived_at', 'archived_by', 'archive_reason')
    `, [process.env.DB_NAME]);
    const existingArchiveColumns = new Set(archiveColumns.map((column) => column.COLUMN_NAME || column.column_name));
    if (!existingArchiveColumns.has('archived_at')) await connection.query(`ALTER TABLE reports ADD COLUMN archived_at TIMESTAMP NULL AFTER updated_by`);
    if (!existingArchiveColumns.has('archived_by')) await connection.query(`ALTER TABLE reports ADD COLUMN archived_by BIGINT UNSIGNED NULL AFTER archived_at`);
    if (!existingArchiveColumns.has('archive_reason')) await connection.query(`ALTER TABLE reports ADD COLUMN archive_reason VARCHAR(255) NULL AFTER archived_by`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS report_images (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        report_id BIGINT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_images_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS report_status_history (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        report_id BIGINT UNSIGNED NOT NULL,
        status ENUM('pending','processing','completed','rejected') NOT NULL,
        note TEXT,
        changed_by BIGINT UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_history_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        CONSTRAINT fk_history_admin FOREIGN KEY (changed_by) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_history_report_created (report_id, created_at)
      )
    `);
  } finally {
    await connection.end();
  }
}

async function ensureSeedData() {
  const connection = await mysql.createConnection({
    ...baseConfig,
    database: process.env.DB_NAME,
  });
  try {
    await connection.query(`
      INSERT INTO buildings (id, code, name, latitude, longitude, is_active) VALUES
      (1, 'ENG', '資訊電機館', 24.1799300, 120.6481300, TRUE),
      (2, 'BUS', '商學館', 24.1793000, 120.6468000, TRUE),
      (3, 'LIB', '圖書館', 24.1803000, 120.6473000, TRUE),
      (4, 'LANG', '人言大樓', 24.1801100, 120.6477900, TRUE),
      (5, 'ADM1', '行政一館', 24.1797000, 120.6474500, TRUE),
      (6, 'ADM2', '行政二館', 24.1796300, 120.6472200, TRUE),
      (7, 'CORE', '忠勤樓', 24.1794200, 120.6479700, TRUE),
      (8, 'ENG2', '科學與航太館', 24.1807600, 120.6485200, TRUE),
      (9, 'CIVIL', '土木水利館', 24.1802800, 120.6487200, TRUE),
      (10, 'GYM', '體育館', 24.1810000, 120.6480000, TRUE),
      (11, 'COGS', '共善樓', 24.1778000, 120.6459000, TRUE),
      (12, 'MUSE', '丘逢甲紀念館', 24.1800200, 120.6480200, TRUE),
      (13, 'FUXING', '福星校區', 24.1755000, 120.6455000, TRUE),
      (14, 'OTHER', '其他地點', NULL, NULL, TRUE)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        is_active = VALUES(is_active)
    `);
    await connection.query(`
      INSERT INTO categories (id, name, type, sort_order) VALUES
      (1, '修繕', 'repair', 1),
      (2, '清潔', 'cleaning', 2),
      (3, '其他問題', 'repair', 3),
      (4, '電燈不亮', 'repair', 4),
      (5, '冷氣不冷', 'repair', 5),
      (6, '漏水', 'repair', 6),
      (7, '磁磚隆起', 'repair', 7),
      (8, '廁所清潔', 'cleaning', 8),
      (9, '教室清潔', 'cleaning', 9),
      (10, '用餐區清潔', 'cleaning', 10)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        type = VALUES(type),
        sort_order = VALUES(sort_order),
        is_active = TRUE
    `);
  } finally {
    await connection.end();
  }
}

await ensureDatabase();
await ensureSchema();
await ensureSeedData();

export const pool = mysql.createPool({
  ...baseConfig,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

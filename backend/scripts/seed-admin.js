import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

const username = process.argv[2] || 'admin';
const password = process.argv[3] || '1234';
const displayName = process.argv[4] || '系統管理員';
const role = process.argv[5] || 'admin';

const connectionConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  socketPath: process.env.DB_SOCKET || undefined
};

async function main() {
  const adminConnection = await mysql.createConnection(connectionConfig);
  try {
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await adminConnection.end();

    const appConnection = await mysql.createConnection({
      ...connectionConfig,
      database: process.env.DB_NAME
    });

    const passwordHash = await bcrypt.hash(password, 10);
    await appConnection.query(
      `INSERT INTO admins (username, password_hash, display_name, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         display_name = VALUES(display_name),
         role = VALUES(role),
         is_active = TRUE`,
      [username, passwordHash, displayName, role]
    );

    console.log(`Admin ready: ${username} / ${password}`);
    await appConnection.end();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();

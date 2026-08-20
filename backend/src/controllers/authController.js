import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號與密碼' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, display_name FROM admins WHERE username = ? AND is_active = 1 LIMIT 1',
      [username]
    );
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      data: { token, user: { id: admin.id, username: admin.username, role: admin.role, displayName: admin.display_name } }
    });
  } catch (error) {
    next(error);
  }
}

export async function checkAdmin(req, res, next) {
  try {
    const { username = 'admin' } = req.query;
    const [rows] = await pool.query(
      'SELECT id, username, display_name, role, is_active, created_at FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (!rows[0]) {
      return res.json({ success: true, data: { exists: false, username } });
    }

    const admin = rows[0];
    res.json({
      success: true,
      data: {
        exists: true,
        username: admin.username,
        displayName: admin.display_name,
        role: admin.role,
        isActive: Boolean(admin.is_active),
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

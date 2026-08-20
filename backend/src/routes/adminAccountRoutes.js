import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, username, display_name, role, is_active, created_at
      FROM admins
      ORDER BY is_active DESC, role ASC, id ASC
    `);
    res.json({ success: true, data: rows.map((row) => ({ ...row, is_active: Boolean(row.is_active) })) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password, displayName, role = 'staff' } = req.body;
    const cleanUsername = String(username || '').trim();
    const cleanDisplayName = String(displayName || '').trim();
    if (!cleanUsername || !cleanDisplayName || !password) {
      return res.status(400).json({ success: false, message: '帳號、姓名與密碼皆為必填' });
    }
    if (!/^[A-Za-z0-9._-]{3,50}$/.test(cleanUsername)) {
      return res.status(400).json({ success: false, message: '帳號需為 3–50 字元，可使用英文、數字、點、底線與連字號' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: '密碼至少需要 8 個字元' });
    }
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: '角色設定不正確' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const [result] = await pool.query(
      `INSERT INTO admins (username, password_hash, display_name, role, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [cleanUsername, passwordHash, cleanDisplayName, role]
    );
    res.status(201).json({ success: true, message: '後台帳號已新增', data: { id: result.insertId } });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: '此帳號已存在' });
    }
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { displayName, role, isActive } = req.body;
    const cleanDisplayName = String(displayName || '').trim();
    if (!cleanDisplayName) {
      return res.status(400).json({ success: false, message: '姓名不可空白' });
    }
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: '角色設定不正確' });
    }
    if (id === Number(req.user.id) && isActive === false) {
      return res.status(400).json({ success: false, message: '不能停用目前登入中的自己' });
    }
    if (id === Number(req.user.id) && role !== 'admin') {
      return res.status(400).json({ success: false, message: '不能把目前登入中的自己降為一般人員' });
    }

    const [result] = await pool.query(
      `UPDATE admins SET display_name = ?, role = ?, is_active = ? WHERE id = ?`,
      [cleanDisplayName, role, Boolean(isActive), id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '查無此後台帳號' });
    res.json({ success: true, message: '帳號資料已更新' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/password', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const password = String(req.body.password || '');
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: '新密碼至少需要 8 個字元' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '查無此後台帳號' });
    res.json({ success: true, message: '密碼已重設' });
  } catch (error) {
    next(error);
  }
});

export default router;

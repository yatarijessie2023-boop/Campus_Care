import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
// 建築物與問題分類會直接影響通報表單，只有系統管理員可以查看或修改。
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const [buildings] = await pool.query(`
      SELECT id, code, name, latitude, longitude, is_active
      FROM buildings
      ORDER BY is_active DESC, name
    `);
    const [categories] = await pool.query(`
      SELECT id, name, type, sort_order, is_active
      FROM categories
      ORDER BY is_active DESC, sort_order, name
    `);
    res.json({ success: true, data: { buildings, categories } });
  } catch (error) {
    next(error);
  }
});

router.post('/buildings', async (req, res, next) => {
  try {
    const { code, name, latitude, longitude } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: '請輸入建築名稱' });
    const cleanCode = code?.trim() || null;
    const [result] = await pool.query(
      `INSERT INTO buildings (code, name, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [cleanCode, name.trim(), latitude || null, longitude || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId }, message: '建築已新增' });
  } catch (error) {
    next(error);
  }
});

router.patch('/buildings/:id', async (req, res, next) => {
  try {
    const { code, name, latitude, longitude, is_active } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: '請輸入建築名稱' });
    await pool.query(
      `UPDATE buildings
       SET code = ?, name = ?, latitude = ?, longitude = ?, is_active = ?
       WHERE id = ?`,
      [code?.trim() || null, name.trim(), latitude || null, longitude || null, Boolean(is_active), req.params.id]
    );
    res.json({ success: true, message: '建築資料已更新' });
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, type = 'repair', sort_order = 0 } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: '請輸入分類名稱' });
    if (!['repair', 'cleaning'].includes(type)) return res.status(400).json({ success: false, message: '分類類型不正確' });
    const [result] = await pool.query(
      `INSERT INTO categories (name, type, sort_order, is_active)
       VALUES (?, ?, ?, TRUE)`,
      [name.trim(), type, Number(sort_order) || 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId }, message: '分類已新增' });
  } catch (error) {
    next(error);
  }
});

router.patch('/categories/:id', async (req, res, next) => {
  try {
    const { name, type = 'repair', sort_order = 0, is_active } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: '請輸入分類名稱' });
    if (!['repair', 'cleaning'].includes(type)) return res.status(400).json({ success: false, message: '分類類型不正確' });
    await pool.query(
      `UPDATE categories
       SET name = ?, type = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), type, Number(sort_order) || 0, Boolean(is_active), req.params.id]
    );
    res.json({ success: true, message: '分類資料已更新' });
  } catch (error) {
    next(error);
  }
});

export default router;

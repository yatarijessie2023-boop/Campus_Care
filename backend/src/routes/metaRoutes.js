import { Router } from 'express';
import { pool } from '../config/db.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const [buildings] = await pool.query(`
      SELECT
        id,
        name,
        code,
        latitude,
        longitude,
        CASE
          WHEN code = 'FUXING' THEN '福星校區'
          WHEN code = 'OTHER' THEN '其他地點'
          ELSE '主校區'
        END AS area
      FROM buildings
      WHERE is_active=1
      ORDER BY
        CASE
          WHEN code = 'OTHER' THEN 2
          WHEN code = 'FUXING' THEN 1
          ELSE 0
        END,
        name
    `);
    const [categories] = await pool.query('SELECT id, name, type FROM categories WHERE is_active=1 ORDER BY sort_order, name');
    res.json({ success: true, data: { buildings, categories } });
  } catch (e) { next(e); }
});
export default router;

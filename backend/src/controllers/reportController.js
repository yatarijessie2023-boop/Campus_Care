import { pool } from '../config/db.js';
import { createReportNumber } from '../utils/reportNumber.js';
import { sendStatusEmail } from '../services/mailService.js';

const allowedStatus = new Set(['pending', 'processing', 'completed', 'rejected']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listReports(req, res, next) {
  try {
    const { keyword = '', buildingId, categoryId, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const where = [];
    const params = [];

    if (!(req.query.includeArchived === '1' && req.user?.role === 'admin')) where.push('r.archived_at IS NULL');

    if (keyword) {
      where.push('(r.report_no LIKE ? OR r.location_detail LIKE ? OR r.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (buildingId) { where.push('r.building_id = ?'); params.push(buildingId); }
    if (categoryId) { where.push('r.category_id = ?'); params.push(categoryId); }
    if (status) { where.push('r.status = ?'); params.push(status); }
    if (startDate) { where.push('DATE(r.created_at) >= ?'); params.push(startDate); }
    if (endDate) { where.push('DATE(r.created_at) <= ?'); params.push(endDate); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [countRows] = await pool.query(`SELECT COUNT(*) total FROM reports r ${whereSql}`, params);
    const [rows] = await pool.query(
      `SELECT r.*, b.name building_name, c.name category_name,
       (SELECT image_url FROM report_images ri WHERE ri.report_id = r.id ORDER BY ri.id LIMIT 1) cover_image
       FROM reports r
       JOIN buildings b ON b.id = r.building_id
       JOIN categories c ON c.id = r.category_id
       ${whereSql}
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    res.json({ success: true, data: rows, pagination: { page: safePage, limit: safeLimit, total: countRows[0].total } });
  } catch (error) { next(error); }
}

export async function getReport(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, b.name building_name, c.name category_name
       FROM reports r JOIN buildings b ON b.id=r.building_id JOIN categories c ON c.id=r.category_id
       WHERE (r.id = ? OR r.report_no = ?)
         AND (r.archived_at IS NULL OR ? = 1) LIMIT 1`,
      [req.params.id, req.params.id, req.user?.role === 'admin' ? 1 : 0]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: '查無案件' });
    const [images] = await pool.query('SELECT id, image_url FROM report_images WHERE report_id = ?', [rows[0].id]);
    const [history] = await pool.query(
      `SELECT h.id, h.status, h.note, h.created_at, a.display_name changed_by_name
       FROM report_status_history h LEFT JOIN admins a ON a.id=h.changed_by
       WHERE h.report_id = ? ORDER BY h.created_at ASC, h.id ASC`, [rows[0].id]
    );
    res.json({ success: true, data: { ...rows[0], images, history } });
  } catch (error) { next(error); }
}

export async function trackReport(req, res, next) {
  try {
    const reportNo = String(req.params.reportNo || '').trim().toUpperCase();
    if (!reportNo) return res.status(400).json({ success: false, message: '請輸入案件編號' });

    const [rows] = await pool.query(
      `SELECT r.id, r.report_no, r.floor, r.location_detail, r.status, r.admin_reply,
              r.created_at, r.completed_at, b.name building_name, c.name category_name
       FROM reports r
       JOIN buildings b ON b.id = r.building_id
       JOIN categories c ON c.id = r.category_id
       WHERE CASE WHEN r.report_no LIKE 'FCU%' THEN CONCAT('R', REPLACE(SUBSTRING(r.report_no, 4), '-', '')) ELSE REPLACE(r.report_no, '-', '') END = REPLACE(?, '-', '')
         AND r.archived_at IS NULL
       LIMIT 1`,
      [reportNo]
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: '查無此案件編號，請確認後再試' });

    const [history] = await pool.query(
      `SELECT id, status, note, created_at
       FROM report_status_history
       WHERE report_id = ?
       ORDER BY created_at ASC, id ASC`,
      [rows[0].id]
    );

    res.json({ success: true, data: { ...rows[0], history } });
  } catch (error) { next(error); }
}

export async function createReport(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { reporterIdentifier, reporterName, reporterEmail, buildingId, categoryId, floor, locationDetail, description, latitude, longitude } = req.body;
    const cleanEmail = String(reporterEmail || '').trim();
    if (!reporterIdentifier || !String(reporterName || '').trim() || !cleanEmail || !buildingId || !categoryId || !locationDetail || !description) {
      return res.status(400).json({ success: false, message: '學號／員工編號、姓名、Email、地點、分類、詳細位置與問題說明為必填' });
    }
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: '請輸入有效的 Email' });
    }

    await connection.beginTransaction();
    const reportNo = createReportNumber();
    const [result] = await connection.query(
      `INSERT INTO reports
       (report_no, reporter_identifier, reporter_name, reporter_email, building_id, category_id, floor, location_detail, description, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportNo, String(reporterIdentifier).trim(), String(reporterName).trim(), cleanEmail, buildingId, categoryId, floor || null, locationDetail, description, latitude || null, longitude || null]
    );

    for (const file of req.files || []) {
      await connection.query('INSERT INTO report_images (report_id, image_url) VALUES (?, ?)', [result.insertId, `/uploads/${file.filename}`]);
    }
    await connection.query('INSERT INTO report_status_history (report_id, status, note) VALUES (?, ?, ?)', [result.insertId, 'pending', '案件建立']);
    await connection.commit();
    res.status(201).json({ success: true, message: '通報成功', data: { id: result.insertId, reportNo } });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally { connection.release(); }
}

export async function updateReport(req, res, next) {
  try {
    const { status, adminReply } = req.body;
    if (!allowedStatus.has(status)) return res.status(400).json({ success: false, message: '案件狀態不正確' });

    const [result] = await pool.query(
      `UPDATE reports SET status = ?, admin_reply = ?, updated_by = ?,
       completed_at = CASE WHEN ?='completed' THEN NOW() ELSE NULL END
       WHERE id = ?`,
      [status, adminReply || null, req.user.id, status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '查無案件' });

    await pool.query('INSERT INTO report_status_history (report_id, status, note, changed_by) VALUES (?, ?, ?, ?)', [req.params.id, status, adminReply || null, req.user.id]);
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    let notification;
    try {
      notification = await sendStatusEmail({ to: rows[0].reporter_email, reportNo: rows[0].report_no, status, reply: adminReply });
    } catch (mailError) {
      console.error('Status email failed:', mailError);
      notification = { sent: false, reason: 'send_failed' };
    }
    const message = notification.sent
      ? '案件已更新，通知 Email 已寄出'
      : '案件已更新，但通知 Email 尚未寄出，請確認 SMTP 設定';
    res.json({ success: true, message, data: rows[0], notification });
  } catch (error) { next(error); }
}

export async function archiveReport(req, res, next) {
  try {
    const reason = String(req.body?.reason || '管理員封存').trim().slice(0, 255);
    const [result] = await pool.query(
      'UPDATE reports SET archived_at = NOW(), archived_by = ?, archive_reason = ? WHERE id = ? AND archived_at IS NULL',
      [req.user.id, reason || '管理員封存', req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '查無案件' });

    res.json({ success: true, message: '案件已封存' });
  } catch (error) { next(error); }
}

export async function restoreReport(req, res, next) {
  try {
    const [result] = await pool.query(
      'UPDATE reports SET archived_at = NULL, archived_by = NULL, archive_reason = NULL WHERE id = ? AND archived_at IS NOT NULL',
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '查無已封存案件' });
    res.json({ success: true, message: '案件已解除封存' });
  } catch (error) { next(error); }
}

export async function dashboard(req, res, next) {
  try {
    const [[summary]] = await pool.query(`SELECT COUNT(*) total,
      SUM(status='pending') pending, SUM(status='processing') processing,
      SUM(status='completed') completed, SUM(DATE(created_at)=CURDATE()) today,
      ROUND(AVG(CASE
        WHEN status='completed' AND completed_at IS NOT NULL
        THEN TIMESTAMPDIFF(MINUTE, created_at, completed_at) / 60
      END), 1) average_processing_hours
      FROM reports WHERE archived_at IS NULL`);
    const [byCategory] = await pool.query(`SELECT c.name label, COUNT(*) value FROM reports r JOIN categories c ON c.id=r.category_id WHERE r.archived_at IS NULL GROUP BY c.id ORDER BY value DESC`);
    const [byBuilding] = await pool.query(`SELECT b.name label, COUNT(*) value FROM reports r JOIN buildings b ON b.id=r.building_id WHERE r.archived_at IS NULL GROUP BY b.id ORDER BY value DESC LIMIT 10`);
    res.json({ success: true, data: { summary, byCategory, byBuilding } });
  } catch (error) { next(error); }
}

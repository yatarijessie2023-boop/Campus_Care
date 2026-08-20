import { Router } from 'express';
import { archiveReport, createReport, dashboard, getReport, listReports, restoreReport, trackReport, updateReport } from '../controllers/reportController.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadImages, validateUploadedImages } from '../middleware/upload.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
const router = Router();
const reportSubmitLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 1000,
  scope: 'report-submit-minute',
  message: '送出過於頻繁，請稍後再試'
});
const reportSubmitHourlyLimiter = createRateLimiter({
  limit: 20,
  windowMs: 60 * 60 * 1000,
  scope: 'report-submit-hour',
  message: '送出次數已達上限，請稍後再試'
});
router.get('/', optionalAuth, listReports);
router.get('/dashboard', requireAuth, dashboard);
router.get('/track/:reportNo', trackReport);
router.get('/:id', optionalAuth, getReport);
router.post('/', reportSubmitHourlyLimiter, reportSubmitLimiter, uploadImages, validateUploadedImages, createReport);
router.patch('/:id/archive', requireAuth, requireAdmin, archiveReport);
router.patch('/:id/restore', requireAuth, requireAdmin, restoreReport);
router.patch('/:id', requireAuth, updateReport);
export default router;

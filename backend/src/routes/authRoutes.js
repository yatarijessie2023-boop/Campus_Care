import { Router } from 'express';
import { checkAdmin, login } from '../controllers/authController.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
const router = Router();
const loginLimiter = createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
  scope: 'auth-login',
  message: '登入嘗試過於頻繁，請稍後再試'
});
router.get('/check', checkAdmin);
router.post('/login', loginLimiter, login);
export default router;

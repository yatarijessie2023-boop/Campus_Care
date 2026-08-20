import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import adminMetaRoutes from './routes/adminMetaRoutes.js';
import adminAccountRoutes from './routes/adminAccountRoutes.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();
const app = express();
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
].filter(Boolean));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(backendRoot, 'uploads')));
app.use('/api', createRateLimiter({
  limit: 120,
  windowMs: 60 * 1000,
  scope: 'api-global',
  message: '請求過於頻繁，請稍後再試'
}));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/admin/meta', adminMetaRoutes);
app.use('/api/admin/accounts', adminAccountRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));

export function notFound(req, res) {
  res.status(404).json({ success: false, message: '找不到此 API' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const isDbError = err.code && ['ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ECONNREFUSED', 'ETIMEDOUT'].includes(err.code);
  res.status(status).json({
    success: false,
    message: status === 500
      ? (isDbError ? `資料庫連線失敗：${err.code}` : `伺服器發生錯誤：${err.message || '未知錯誤'}`)
      : err.message
  });
}

// src/middleware/errorHandler.js
// Centralised error handler — catches anything passed to next(err)

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log only unexpected errors
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;

// src/middleware/validate.js
// Lightweight validation helper used by controllers

function requireFields(fields, body) {
  const missing = fields.filter(f => !body[f] && body[f] !== 0);
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    return err;
  }
  return null;
}

module.exports = { requireFields };

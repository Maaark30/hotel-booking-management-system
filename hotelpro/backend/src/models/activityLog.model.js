const pool = require('../config/db');

async function logActivity({ userId, action, entityType, entityId, details, ipAddress }) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (err) {
    // Logging should never break the main request flow — just report it
    console.error('Failed to write activity log:', err.message);
  }
}

async function getAllLogs({ userId, action, entityType, limit = 100 } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (userId) {
    conditions.push(`l.user_id = $${idx++}`);
    values.push(userId);
  }
  if (action) {
    conditions.push(`l.action = $${idx++}`);
    values.push(action);
  }
  if (entityType) {
    conditions.push(`l.entity_type = $${idx++}`);
    values.push(entityType);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit);

  const result = await pool.query(
    `SELECT l.*, u.full_name AS user_name, u.email AS user_email
     FROM activity_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT $${idx}`,
    values
  );
  return result.rows;
}

module.exports = { logActivity, getAllLogs };
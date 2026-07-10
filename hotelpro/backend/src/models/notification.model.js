const pool = require('../config/db');

async function createNotification({ userId, type, title, message, relatedBookingId = null }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, related_booking_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, message, relatedBookingId]
  );
  return result.rows[0];
}

async function getNotificationsForUser(userId, { unreadOnly = false, limit = 20 } = {}) {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (unreadOnly) {
    conditions.push('is_read = false');
  }
  values.push(limit);

  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${idx}`,
    values
  );
  return result.rows;
}

async function getUnreadCount(userId) {
  const result = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function markAsRead(notificationId, userId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0];
}

async function markAllAsRead(userId) {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
}

// Notify every staff member (admin + receptionist) of a system event,
// e.g. a new booking coming in from the public website
async function notifyAllStaff({ type, title, message, relatedBookingId = null }) {
  const staffResult = await pool.query(
    `SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('admin', 'receptionist')`
  );
  for (const staff of staffResult.rows) {
    await createNotification({ userId: staff.id, type, title, message, relatedBookingId });
  }
}

module.exports = {
  createNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notifyAllStaff,
};
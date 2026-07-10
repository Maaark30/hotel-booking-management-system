const pool = require('../config/db');

async function getAllPayments({ status, bookingId } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`p.status = $${idx++}`);
    values.push(status);
  }
  if (bookingId) {
    conditions.push(`p.booking_id = $${idx++}`);
    values.push(bookingId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT p.*, b.check_in_date, b.check_out_date, g.full_name AS guest_name, r.room_number
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     ${whereClause}
     ORDER BY p.created_at DESC`,
    values
  );
  return result.rows;
}

async function getPaymentById(id) {
  const result = await pool.query(
    `SELECT p.*, b.check_in_date, b.check_out_date, g.full_name AS guest_name, r.room_number
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function getPaymentsByBookingId(bookingId) {
  const result = await pool.query(
    `SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at ASC`,
    [bookingId]
  );
  return result.rows;
}

async function getTotalPaidForBooking(bookingId) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_paid
     FROM payments
     WHERE booking_id = $1 AND status = 'paid'`,
    [bookingId]
  );
  return parseFloat(result.rows[0].total_paid);
}

async function createPayment({ bookingId, amount, method, recordedBy, transactionReference }) {
  const result = await pool.query(
    `INSERT INTO payments (booking_id, amount, method, status, transaction_reference, recorded_by)
     VALUES ($1, $2, $3, 'pending', $4, $5)
     RETURNING *`,
    [bookingId, amount, method, transactionReference, recordedBy]
  );
  return result.rows[0];
}

async function updatePaymentStatus(id, status) {
  const setClauses = ['status = $1'];
  const values = [status];

  if (status === 'paid') {
    setClauses.push('paid_at = now()');
  }
  if (status === 'refunded') {
    setClauses.push('refunded_at = now()');
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE payments SET ${setClauses.join(', ')} WHERE id = $2 RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deletePayment(id) {
  const result = await pool.query(`DELETE FROM payments WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
}

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByBookingId,
  getTotalPaidForBooking,
  createPayment,
  updatePaymentStatus,
  deletePayment,
};
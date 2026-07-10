const pool = require('../config/db');

// Core overlap check: two date ranges overlap if
// existing.check_in < new.check_out AND existing.check_out > new.check_in
async function findOverlappingBookings(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
  const values = [roomId, checkInDate, checkOutDate];
  let query = `
    SELECT * FROM bookings
    WHERE room_id = $1
      AND status IN ('pending', 'confirmed', 'checked_in')
      AND check_in_date < $3
      AND check_out_date > $2
  `;
  if (excludeBookingId) {
    values.push(excludeBookingId);
    query += ` AND id != $4`;
  }
  const result = await pool.query(query, values);
  return result.rows;
}

async function isRoomAvailable(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
  const overlaps = await findOverlappingBookings(roomId, checkInDate, checkOutDate, excludeBookingId);
  return overlaps.length === 0;
}

async function getAllBookings({ status, roomId, guestId } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`b.status = $${idx++}`);
    values.push(status);
  }
  if (roomId) {
    conditions.push(`b.room_id = $${idx++}`);
    values.push(roomId);
  }
  if (guestId) {
    conditions.push(`b.guest_id = $${idx++}`);
    values.push(guestId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT b.*, g.full_name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
            r.room_number, r.room_name, rc.name AS category_name,
            EXISTS (SELECT 1 FROM payments p WHERE p.booking_id = b.id) AS has_payment
     FROM bookings b
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     ${whereClause}
     ORDER BY b.check_in_date ASC`,
    values
  );
  return result.rows;
}

async function getBookingById(id) {
  const result = await pool.query(
    `SELECT b.*, g.full_name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
            r.room_number, r.room_name, r.price_per_night, rc.name AS category_name
     FROM bookings b
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function createBooking({
  guestId, roomId, createdBy, checkInDate, checkOutDate,
  guestCount, specialRequests, totalAmount,
}) {
  const result = await pool.query(
    `INSERT INTO bookings
       (guest_id, room_id, created_by, check_in_date, check_out_date, guest_count, special_requests, total_amount, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [guestId, roomId, createdBy, checkInDate, checkOutDate, guestCount, specialRequests, totalAmount]
  );
  return result.rows[0];
}

async function updateBooking(id, { checkInDate, checkOutDate, guestCount, specialRequests, totalAmount }) {
  const result = await pool.query(
    `UPDATE bookings
     SET check_in_date = $1, check_out_date = $2, guest_count = $3, special_requests = $4, total_amount = $5
     WHERE id = $6
     RETURNING *`,
    [checkInDate, checkOutDate, guestCount, specialRequests, totalAmount, id]
  );
  return result.rows[0];
}

async function updateBookingStatus(id, status, extraFields = {}) {
  const setClauses = ['status = $1'];
  const values = [status];
  let idx = 2;

  if (status === 'checked_in') {
    setClauses.push(`checked_in_at = now()`);
  }
  if (status === 'checked_out') {
    setClauses.push(`checked_out_at = now()`);
  }
  if (status === 'cancelled') {
    setClauses.push(`cancelled_at = now()`);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE bookings SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deleteBooking(id) {
  const result = await pool.query(`DELETE FROM bookings WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
}

module.exports = {
  findOverlappingBookings,
  isRoomAvailable,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
};
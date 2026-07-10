const pool = require('../config/db');

async function getAllGuests({ search } = {}) {
  let query = `SELECT * FROM guests`;
  const values = [];

  if (search) {
    query += ` WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getGuestById(id) {
  const result = await pool.query(`SELECT * FROM guests WHERE id = $1`, [id]);
  return result.rows[0];
}

async function getGuestByEmail(email) {
  if (!email) return null;
  const result = await pool.query(`SELECT * FROM guests WHERE email = $1`, [email]);
  return result.rows[0];
}

async function getGuestByUserId(userId) {
  const result = await pool.query(`SELECT * FROM guests WHERE user_id = $1`, [userId]);
  return result.rows[0];
}

async function createGuest({
  userId, fullName, email, phone, address,
  governmentIdType, governmentIdNumber, governmentIdImageUrl, notes,
}) {
  const result = await pool.query(
    `INSERT INTO guests
       (user_id, full_name, email, phone, address, government_id_type, government_id_number, government_id_image_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, fullName, email, phone, address, governmentIdType, governmentIdNumber, governmentIdImageUrl, notes]
  );
  return result.rows[0];
}

async function updateGuest(id, {
  fullName, email, phone, address,
  governmentIdType, governmentIdNumber, governmentIdImageUrl, notes,
}) {
  const result = await pool.query(
    `UPDATE guests
     SET full_name = $1, email = $2, phone = $3, address = $4,
         government_id_type = $5, government_id_number = $6, government_id_image_url = $7, notes = $8
     WHERE id = $9
     RETURNING *`,
    [fullName, email, phone, address, governmentIdType, governmentIdNumber, governmentIdImageUrl, notes, id]
  );
  return result.rows[0];
}

async function deleteGuest(id) {
  const result = await pool.query(`DELETE FROM guests WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
}

// Guest profile with booking history (used for the CRM-style guest profile view)
async function getGuestWithBookingHistory(id) {
  const guestResult = await pool.query(`SELECT * FROM guests WHERE id = $1`, [id]);
  const guest = guestResult.rows[0];
  if (!guest) return null;

  const bookingsResult = await pool.query(
    `SELECT b.*, r.room_number, r.room_name, rc.name AS category_name
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     WHERE b.guest_id = $1
     ORDER BY b.check_in_date DESC`,
    [id]
  );

  const statsResult = await pool.query(
    `SELECT
       COUNT(*) AS total_stays,
       COALESCE(SUM(total_amount), 0) AS total_spending
     FROM bookings
     WHERE guest_id = $1 AND status = 'checked_out'`,
    [id]
  );

  return {
    ...guest,
    bookings: bookingsResult.rows,
    totalStays: parseInt(statsResult.rows[0].total_stays, 10),
    totalSpending: parseFloat(statsResult.rows[0].total_spending),
  };
}

module.exports = {
  getAllGuests,
  getGuestById,
  getGuestByEmail,
  getGuestByUserId,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestWithBookingHistory,
};
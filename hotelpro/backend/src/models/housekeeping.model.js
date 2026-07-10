const pool = require('../config/db');

async function getAllHousekeepingRecords({ status } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`h.status = $${idx++}`);
    values.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT h.*, r.room_number, r.room_name, r.floor_number, u.full_name AS assigned_to_name
     FROM housekeeping h
     JOIN rooms r ON h.room_id = r.id
     LEFT JOIN users u ON h.assigned_to = u.id
     ${whereClause}
     ORDER BY r.room_number ASC`,
    values
  );
  return result.rows;
}

async function getHousekeepingByRoomId(roomId) {
  const result = await pool.query(
    `SELECT h.*, r.room_number, r.room_name, u.full_name AS assigned_to_name
     FROM housekeeping h
     JOIN rooms r ON h.room_id = r.id
     LEFT JOIN users u ON h.assigned_to = u.id
     WHERE h.room_id = $1`,
    [roomId]
  );
  return result.rows[0];
}

async function createHousekeepingRecord(roomId, status = 'dirty') {
  const result = await pool.query(
    `INSERT INTO housekeeping (room_id, status)
     VALUES ($1, $2)
     RETURNING *`,
    [roomId, status]
  );
  return result.rows[0];
}

async function updateHousekeepingStatus(roomId, status, notes) {
  const result = await pool.query(
    `UPDATE housekeeping
     SET status = $1, notes = COALESCE($2, notes)
     WHERE room_id = $3
     RETURNING *`,
    [status, notes, roomId]
  );
  return result.rows[0];
}

async function assignHousekeeping(roomId, assignedTo) {
  const result = await pool.query(
    `UPDATE housekeeping SET assigned_to = $1 WHERE room_id = $2 RETURNING *`,
    [assignedTo, roomId]
  );
  return result.rows[0];
}

module.exports = {
  getAllHousekeepingRecords,
  getHousekeepingByRoomId,
  createHousekeepingRecord,
  updateHousekeepingStatus,
  assignHousekeeping,
};
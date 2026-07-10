const pool = require('../config/db');

async function getAllRooms({ status, categoryId } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`r.status = $${idx++}`);
    values.push(status);
  }
  if (categoryId) {
    conditions.push(`r.category_id = $${idx++}`);
    values.push(categoryId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT r.*, rc.name AS category_name, rc.base_price AS category_base_price,
            COALESCE(
              json_agg(
                json_build_object('id', ri.id, 'image_url', ri.image_url, 'is_primary', ri.is_primary)
                ORDER BY ri.sort_order
              ) FILTER (WHERE ri.id IS NOT NULL), '[]'
            ) AS images
     FROM rooms r
     JOIN room_categories rc ON r.category_id = rc.id
     LEFT JOIN room_images ri ON ri.room_id = r.id
     ${whereClause}
     GROUP BY r.id, rc.name, rc.base_price
     ORDER BY r.room_number ASC`,
    values
  );
  return result.rows;
}

async function getRoomById(id) {
  const result = await pool.query(
    `SELECT r.*, rc.name AS category_name, rc.base_price AS category_base_price,
            COALESCE(
              json_agg(
                json_build_object('id', ri.id, 'image_url', ri.image_url, 'is_primary', ri.is_primary)
                ORDER BY ri.sort_order
              ) FILTER (WHERE ri.id IS NOT NULL), '[]'
            ) AS images
     FROM rooms r
     JOIN room_categories rc ON r.category_id = rc.id
     LEFT JOIN room_images ri ON ri.room_id = r.id
     WHERE r.id = $1
     GROUP BY r.id, rc.name, rc.base_price`,
    [id]
  );
  return result.rows[0];
}

async function getRoomByNumber(roomNumber) {
  const result = await pool.query(
    `SELECT * FROM rooms WHERE room_number = $1`,
    [roomNumber]
  );
  return result.rows[0];
}

async function createRoom({
  categoryId, roomNumber, roomName, floorNumber,
  pricePerNight, capacity, description, amenities,
}) {
  const result = await pool.query(
    `INSERT INTO rooms
       (category_id, room_number, room_name, floor_number, price_per_night, capacity, description, amenities)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [categoryId, roomNumber, roomName, floorNumber, pricePerNight, capacity, description, JSON.stringify(amenities || [])]
  );
  return result.rows[0];
}

async function updateRoom(id, {
  categoryId, roomNumber, roomName, floorNumber,
  pricePerNight, capacity, description, amenities, status,
}) {
  const result = await pool.query(
    `UPDATE rooms
     SET category_id = $1, room_number = $2, room_name = $3, floor_number = $4,
         price_per_night = $5, capacity = $6, description = $7, amenities = $8, status = $9
     WHERE id = $10
     RETURNING *`,
    [categoryId, roomNumber, roomName, floorNumber, pricePerNight, capacity, description, JSON.stringify(amenities || []), status, id]
  );
  return result.rows[0];
}

async function updateRoomStatus(id, status) {
  const result = await pool.query(
    `UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

async function deleteRoom(id) {
  const result = await pool.query(
    `DELETE FROM rooms WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

async function addRoomImage(roomId, imageUrl, isPrimary = false) {
  const result = await pool.query(
    `INSERT INTO room_images (room_id, image_url, is_primary)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [roomId, imageUrl, isPrimary]
  );
  return result.rows[0];
}

async function deleteRoomImage(imageId) {
  const result = await pool.query(
    `DELETE FROM room_images WHERE id = $1 RETURNING id, room_id, image_url`,
    [imageId]
  );
  return result.rows[0];
}

module.exports = {
  getAllRooms,
  getRoomById,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  addRoomImage,
  deleteRoomImage,
};
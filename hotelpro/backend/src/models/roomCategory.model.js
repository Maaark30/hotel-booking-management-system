const pool = require('../config/db');

async function getAllCategories() {
  const result = await pool.query(
    `SELECT * FROM room_categories ORDER BY base_price ASC`
  );
  return result.rows;
}

async function getCategoryById(id) {
  const result = await pool.query(
    `SELECT * FROM room_categories WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function createCategory({ name, description, basePrice, capacity, amenities }) {
  const result = await pool.query(
    `INSERT INTO room_categories (name, description, base_price, capacity, amenities)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, basePrice, capacity, JSON.stringify(amenities || [])]
  );
  return result.rows[0];
}

async function updateCategory(id, { name, description, basePrice, capacity, amenities }) {
  const result = await pool.query(
    `UPDATE room_categories
     SET name = $1, description = $2, base_price = $3, capacity = $4, amenities = $5
     WHERE id = $6
     RETURNING *`,
    [name, description, basePrice, capacity, JSON.stringify(amenities || []), id]
  );
  return result.rows[0];
}

async function deleteCategory(id) {
  const result = await pool.query(
    `DELETE FROM room_categories WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
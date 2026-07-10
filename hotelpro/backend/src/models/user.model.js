const pool = require('../config/db');

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT u.*, r.name AS role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.is_active,
            u.created_at, r.name AS role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function createUser({ fullName, email, phone, passwordHash, roleName = 'customer' }) {
  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  if (roleResult.rows.length === 0) {
    throw new Error(`Role "${roleName}" does not exist`);
  }
  const roleId = roleResult.rows[0].id;

  const result = await pool.query(
    `INSERT INTO users (role_id, full_name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, phone, created_at`,
    [roleId, fullName, email, phone, passwordHash]
  );
  return result.rows[0];
}

async function updateLastLogin(userId) {
  await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
}

async function setResetToken(userId, token, expiresAt) {
  await pool.query(
    'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

async function findUserByResetToken(token) {
  const result = await pool.query(
    `SELECT * FROM users
     WHERE reset_password_token = $1 AND reset_password_expires > now()`,
    [token]
  );
  return result.rows[0];
}

async function updatePassword(userId, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  setResetToken,
  findUserByResetToken,
  updatePassword,
};
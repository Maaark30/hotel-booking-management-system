const { Pool, types } = require('pg');
require('dotenv').config();

// Prevent pg from converting DATE columns into JS Date objects (which
// introduces timezone shifting). Keep them as plain "YYYY-MM-DD" strings.
types.setTypeParser(1082, (value) => value); // 1082 = OID for the DATE type

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

module.exports = pool;
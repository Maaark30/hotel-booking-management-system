const pool = require('../config/db');

// Revenue report — groups paid payments by day/week/month/year
async function getRevenueReport({ period = 'monthly', startDate, endDate } = {}) {
  const truncMap = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year',
  };
  const truncUnit = truncMap[period] || 'month';

  const conditions = [`p.status = 'paid'`];
  const values = [];
  let idx = 1;

  if (startDate) {
    conditions.push(`p.paid_at >= $${idx++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`p.paid_at <= $${idx++}`);
    values.push(endDate);
  }

  const result = await pool.query(
    `SELECT
       date_trunc('${truncUnit}', p.paid_at) AS period,
       COALESCE(SUM(p.amount), 0) AS total_revenue,
       COUNT(*) AS payment_count
     FROM payments p
     WHERE ${conditions.join(' AND ')}
     GROUP BY period
     ORDER BY period ASC`,
    values
  );
  return result.rows;
}

// Booking report — counts by status within an optional date range
async function getBookingReport({ startDate, endDate } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (startDate) {
    conditions.push(`b.created_at >= $${idx++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`b.created_at <= $${idx++}`);
    values.push(endDate);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT b.status, COUNT(*) AS count
     FROM bookings b
     ${whereClause}
     GROUP BY b.status`,
    values
  );

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total FROM bookings b ${whereClause}`,
    values
  );

  return {
    byStatus: result.rows.map((row) => ({ status: row.status, count: parseInt(row.count, 10) })),
    total: parseInt(totalResult.rows[0].total, 10),
  };
}

// Guest report — top guests by spending and stay count
async function getGuestReport({ limit = 20 } = {}) {
  const result = await pool.query(
    `SELECT g.id, g.full_name, g.email, g.phone,
            COUNT(b.id) FILTER (WHERE b.status = 'checked_out') AS total_stays,
            COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'checked_out'), 0) AS total_spending
     FROM guests g
     LEFT JOIN bookings b ON b.guest_id = g.id
     GROUP BY g.id
     ORDER BY total_spending DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// Room utilization report — nights booked per room within a date range
async function getRoomUtilizationReport({ startDate, endDate } = {}) {
  const conditions = [`b.status IN ('checked_out', 'checked_in', 'confirmed')`];
  const values = [];
  let idx = 1;

  if (startDate) {
    conditions.push(`b.check_in_date >= $${idx++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`b.check_out_date <= $${idx++}`);
    values.push(endDate);
  }

  const result = await pool.query(
    `SELECT r.id, r.room_number, r.room_name, rc.name AS category_name,
            COUNT(b.id) AS total_bookings,
            COALESCE(SUM(b.check_out_date - b.check_in_date), 0) AS nights_booked,
            COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'checked_out'), 0) AS revenue_generated
     FROM rooms r
     JOIN room_categories rc ON r.category_id = rc.id
     LEFT JOIN bookings b ON b.room_id = r.id AND ${conditions.join(' AND ')}
     GROUP BY r.id, rc.name
     ORDER BY nights_booked DESC`,
    values
  );
  return result.rows;
}

// Dashboard summary — the key numbers for the hero section / KPI cards
async function getDashboardSummary() {
  const roomStats = await pool.query(
    `SELECT COUNT(*) AS total_rooms,
       COUNT(*) FILTER (WHERE status = 'available') AS available_rooms,
       COUNT(*) FILTER (WHERE status = 'occupied') AS occupied_rooms,
       COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance_rooms,
       COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_rooms
     FROM rooms`
  );

  const housekeepingIssues = await pool.query(
    `SELECT COUNT(*) AS count FROM housekeeping
     WHERE status IN ('dirty', 'maintenance')`
  );

  const guestCount = await pool.query(`SELECT COUNT(*) AS total_guests FROM guests`);

  const bookingCount = await pool.query(`SELECT COUNT(*) AS total_bookings FROM bookings`);

  const monthlyRevenue = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS revenue
     FROM payments
     WHERE status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE)`
  );

  const occupancyRate = roomStats.rows[0].total_rooms > 0
    ? (roomStats.rows[0].occupied_rooms / roomStats.rows[0].total_rooms) * 100
    : 0;

  return {
    totalRooms: parseInt(roomStats.rows[0].total_rooms, 10),
    availableRooms: parseInt(roomStats.rows[0].available_rooms, 10),
    occupiedRooms: parseInt(roomStats.rows[0].occupied_rooms, 10),
    maintenanceRooms: parseInt(roomStats.rows[0].maintenance_rooms, 10),
    reservedRooms: parseInt(roomStats.rows[0].reserved_rooms, 10),
    housekeepingIssues: parseInt(housekeepingIssues.rows[0].count, 10),
    totalGuests: parseInt(guestCount.rows[0].total_guests, 10),
    totalBookings: parseInt(bookingCount.rows[0].total_bookings, 10),
    monthlyRevenue: parseFloat(monthlyRevenue.rows[0].revenue),
    occupancyRate: Math.round(occupancyRate * 10) / 10,
  };
}

async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];

  const bookedToday = await pool.query(
    `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue
     FROM bookings
     WHERE DATE(created_at AT TIME ZONE 'Asia/Manila') = $1`,
    [today]
  );

  const checkInsToday = await pool.query(
    `SELECT b.id, g.full_name AS guest_name, r.room_number, r.room_name,
            rc.name AS category_name, b.check_in_date, b.check_out_date,
            b.status, b.guest_count
     FROM bookings b
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     WHERE b.check_in_date = $1
     AND b.status IN ('confirmed', 'checked_in')
     ORDER BY b.created_at ASC`,
    [today]
  );

  const checkOutsToday = await pool.query(
    `SELECT b.id, g.full_name AS guest_name, r.room_number, r.room_name,
            b.status, b.total_amount
     FROM bookings b
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     WHERE b.check_out_date = $1
     AND b.status IN ('checked_in', 'checked_out')
     ORDER BY b.created_at ASC`,
    [today]
  );

  const weeklyBookings = await pool.query(
    `SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') AS day,
            COUNT(*) AS count
     FROM bookings
     WHERE created_at >= NOW() - INTERVAL '7 days'
     GROUP BY day
     ORDER BY day ASC`
  );

  return {
    bookedToday: parseInt(bookedToday.rows[0].count, 10),
    revenueToday: parseFloat(bookedToday.rows[0].revenue),
    checkInsToday: checkInsToday.rows,
    checkOutsToday: checkOutsToday.rows,
    weeklyBookings: weeklyBookings.rows.map((r) => ({
      day: r.day,
      count: parseInt(r.count, 10),
    })),
  };
}

async function getUpcomingReservations({ days = 7 } = {}) {
  const result = await pool.query(
    `SELECT b.id, g.full_name AS guest_name, r.room_number, r.room_name,
            rc.name AS category_name, b.check_in_date, b.check_out_date,
            b.guest_count, b.status, b.total_amount
     FROM bookings b
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     WHERE b.check_in_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
     AND b.status IN ('confirmed', 'pending')
     ORDER BY b.check_in_date ASC
     LIMIT 8`
  );
  return result.rows;
}

async function getTopRooms({ limit = 5 } = {}) {
  const result = await pool.query(
    `SELECT r.id, r.room_number, r.room_name, rc.name AS category_name,
            COUNT(b.id) AS total_bookings,
            COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'checked_out'), 0) AS revenue
     FROM rooms r
     JOIN room_categories rc ON r.category_id = rc.id
     LEFT JOIN bookings b ON b.room_id = r.id
     GROUP BY r.id, rc.name
     ORDER BY revenue DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = {
  getRevenueReport,
  getBookingReport,
  getGuestReport,
  getRoomUtilizationReport,
  getDashboardSummary,
  getTodayStats,
  getUpcomingReservations,
  getTopRooms,
};
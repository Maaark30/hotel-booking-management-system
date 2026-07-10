const pool = require('../config/db');

async function getInsightsData() {
  // Current occupancy
  const roomStats = await pool.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'occupied') AS occupied
     FROM rooms`
  );
  const totalRooms = parseInt(roomStats.rows[0].total, 10);
  const occupiedRooms = parseInt(roomStats.rows[0].occupied, 10);
  const currentOccupancy = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Upcoming check-ins in the next 7 days (confirmed bookings) — used as a simple
  // proxy signal for projected near-term occupancy pressure
  const upcoming = await pool.query(
    `SELECT COUNT(*) AS count FROM bookings
     WHERE status = 'confirmed' AND check_in_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
  );
  const upcomingCheckIns = parseInt(upcoming.rows[0].count, 10);

  // Most-booked room category (by number of bookings)
  const popularCategory = await pool.query(
    `SELECT rc.name, COUNT(b.id) AS booking_count
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     GROUP BY rc.name
     ORDER BY booking_count DESC
     LIMIT 1`
  );

  // Revenue trend — last 2 full months of paid revenue, to compute simple growth rate
  const revenueTrend = await pool.query(
    `SELECT date_trunc('month', paid_at) AS month, SUM(amount) AS total
     FROM payments
     WHERE status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '2 months'
     GROUP BY month
     ORDER BY month ASC`
  );

  // Current month-to-date revenue (used as the base for the forecast)
  const currentMonthRevenue = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM payments
     WHERE status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE)`
  );

  // Rooms currently under maintenance (used for the "consider opening more rooms" type insight)
  const maintenanceCount = await pool.query(
    `SELECT COUNT(*) AS count FROM rooms WHERE status = 'maintenance'`
  );

  return {
    totalRooms,
    occupiedRooms,
    currentOccupancy,
    upcomingCheckIns,
    popularCategory: popularCategory.rows[0] || null,
    revenueTrendRows: revenueTrend.rows,
    currentMonthRevenue: parseFloat(currentMonthRevenue.rows[0].total),
    maintenanceCount: parseInt(maintenanceCount.rows[0].count, 10),
  };
}

module.exports = { getInsightsData };
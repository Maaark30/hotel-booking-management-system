const {
  getRevenueReport,
  getBookingReport,
  getGuestReport,
  getRoomUtilizationReport,
  getDashboardSummary,
  getTodayStats,
  getUpcomingReservations,
  getTopRooms,
} = require('../models/report.model');

async function revenueReport(req, res, next) {
  try {
    const { period, startDate, endDate } = req.query;
    const data = await getRevenueReport({ period, startDate, endDate });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function bookingReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const data = await getBookingReport({ startDate, endDate });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function guestReport(req, res, next) {
  try {
    const { limit } = req.query;
    const data = await getGuestReport({ limit: limit ? parseInt(limit, 10) : undefined });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function roomUtilizationReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const data = await getRoomUtilizationReport({ startDate, endDate });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function dashboardSummary(req, res, next) {
  try {
    const data = await getDashboardSummary();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function todayStats(req, res, next) {
  try {
    const data = await getTodayStats();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function upcomingReservations(req, res, next) {
  try {
    const data = await getUpcomingReservations();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function topRooms(req, res, next) {
  try {
    const data = await getTopRooms();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { revenueReport, bookingReport, guestReport, roomUtilizationReport, dashboardSummary, todayStats, upcomingReservations, topRooms };
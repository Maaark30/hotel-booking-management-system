const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

const {
  revenueReport,
  bookingReport,
  guestReport,
  roomUtilizationReport,
  dashboardSummary,
  todayStats,
  upcomingReservations,
  topRooms,
} = require('../controllers/report.controller');


router.get('/dashboard-summary', authenticate, authorize('admin', 'receptionist'), dashboardSummary);
router.get('/today-stats', authenticate, authorize('admin', 'receptionist'), todayStats);
router.get('/revenue', authenticate, authorize('admin'), revenueReport);
router.get('/bookings', authenticate, authorize('admin'), bookingReport);
router.get('/guests', authenticate, authorize('admin'), guestReport);
router.get('/room-utilization', authenticate, authorize('admin'), roomUtilizationReport);
router.get('/upcoming-reservations', authenticate, authorize('admin', 'receptionist'), upcomingReservations);
router.get('/top-rooms', authenticate, authorize('admin', 'receptionist'), topRooms);

module.exports = router;
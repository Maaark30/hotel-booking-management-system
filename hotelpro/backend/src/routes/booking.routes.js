const express = require('express');
const router = express.Router();

const {
  listBookings,
  getBooking,
  addBooking,
  addSelfBooking,
  getMyBookings,
  editBooking,
  changeBookingStatus,
  removeBooking,
} = require('../controllers/booking.controller');

const { bookingRules, selfBookingRules, statusUpdateRules, validate } = require('../validations/booking.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Customer self-service booking — any authenticated user (admin/receptionist/customer) can use this
router.post('/self', authenticate, selfBookingRules, validate, addSelfBooking);
router.get('/my-bookings', authenticate, getMyBookings);

// Admin + Receptionist manage bookings
router.get('/', authenticate, authorize('admin', 'receptionist'), listBookings);
router.get('/:id', authenticate, authorize('admin', 'receptionist'), getBooking);
router.post('/', authenticate, authorize('admin', 'receptionist'), bookingRules, validate, addBooking);
router.put('/:id', authenticate, authorize('admin', 'receptionist'), bookingRules, validate, editBooking);
router.patch('/:id/status', authenticate, authorize('admin', 'receptionist'), statusUpdateRules, validate, changeBookingStatus);
router.delete('/:id', authenticate, authorize('admin'), removeBooking);

module.exports = router;
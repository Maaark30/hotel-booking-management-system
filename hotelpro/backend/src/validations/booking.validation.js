const { body, validationResult } = require('express-validator');

const bookingRules = [
  body('guestId').notEmpty().withMessage('Guest is required'),
  body('roomId').notEmpty().withMessage('Room is required'),
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('specialRequests').optional().isString(),
];

const selfBookingRules = [
  body('roomId').notEmpty().withMessage('Room is required'),
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('specialRequests').optional().isString(),
];

const statusUpdateRules = [
  body('status').isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .withMessage('Invalid booking status'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { bookingRules, selfBookingRules, statusUpdateRules, validate };
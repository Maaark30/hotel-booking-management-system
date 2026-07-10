const { body, validationResult } = require('express-validator');

const paymentRules = [
  body('bookingId').notEmpty().withMessage('Booking is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['cash', 'credit_card', 'gcash', 'maya']).withMessage('Invalid payment method'),
  body('transactionReference').optional().isString(),
];

const selfPaymentRules = [
  body('bookingId').notEmpty().withMessage('Booking is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['cash', 'credit_card', 'gcash', 'maya']).withMessage('Invalid payment method'),
];

const statusRules = [
  body('status').isIn(['pending', 'paid', 'refunded']).withMessage('Invalid payment status'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { paymentRules, selfPaymentRules, statusRules, validate };
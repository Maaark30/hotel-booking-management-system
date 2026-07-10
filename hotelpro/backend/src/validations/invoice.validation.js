const { body, validationResult } = require('express-validator');

const generateInvoiceRules = [
  body('bookingId').notEmpty().withMessage('Booking is required'),
  body('additionalCharges').optional().isFloat({ min: 0 }).withMessage('Additional charges must be a positive number'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { generateInvoiceRules, validate };
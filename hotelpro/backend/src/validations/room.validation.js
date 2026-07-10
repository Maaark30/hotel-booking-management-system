const { body, validationResult } = require('express-validator');

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
];

const roomRules = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('pricePerNight').isFloat({ min: 0 }).withMessage('Price per night must be a positive number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
];

const statusRules = [
  body('status').isIn(['available', 'occupied', 'reserved', 'maintenance'])
    .withMessage('Status must be one of: available, occupied, reserved, maintenance'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { categoryRules, roomRules, statusRules, validate };
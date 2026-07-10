const { body, validationResult } = require('express-validator');

const statusRules = [
  body('status').isIn(['clean', 'dirty', 'in_progress', 'maintenance']).withMessage('Invalid housekeeping status'),
  body('notes').optional().isString(),
];

const assignRules = [
  body('assignedTo').notEmpty().withMessage('Staff member to assign is required'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { statusRules, assignRules, validate };
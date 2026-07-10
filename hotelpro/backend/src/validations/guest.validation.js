const { body, validationResult } = require('express-validator');

const guestRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Must be a valid email'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('governmentIdType').optional().isString(),
  body('governmentIdNumber').optional().isString(),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { guestRules, validate };
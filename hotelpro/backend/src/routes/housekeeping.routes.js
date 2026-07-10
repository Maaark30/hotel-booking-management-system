const express = require('express');
const router = express.Router();

const { listHousekeeping, getRoomHousekeeping, changeStatus, assignStaff } = require('../controllers/housekeeping.controller');
const { statusRules, assignRules, validate } = require('../validations/housekeeping.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize('admin', 'receptionist'), listHousekeeping);
router.get('/:roomId', authenticate, authorize('admin', 'receptionist'), getRoomHousekeeping);
router.patch('/:roomId/status', authenticate, authorize('admin', 'receptionist'), statusRules, validate, changeStatus);
router.patch('/:roomId/assign', authenticate, authorize('admin'), assignRules, validate, assignStaff);

module.exports = router;
const express = require('express');
const router = express.Router();

const { listLogs } = require('../controllers/activityLog.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Admin only — this is an audit trail
router.get('/', authenticate, authorize('admin'), listLogs);

module.exports = router;
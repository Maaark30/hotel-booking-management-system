const express = require('express');
const router = express.Router();

const { getInsights } = require('../controllers/insights.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize('admin', 'receptionist'), getInsights);

module.exports = router;
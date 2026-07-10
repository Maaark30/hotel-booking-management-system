const express = require('express');
const router = express.Router();

const { listNotifications, unreadCount, readOne, readAll } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, listNotifications);
router.get('/unread-count', authenticate, unreadCount);
router.patch('/:id/read', authenticate, readOne);
router.patch('/read-all', authenticate, readAll);

module.exports = router;
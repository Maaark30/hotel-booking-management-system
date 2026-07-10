const {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../models/notification.model');

async function listNotifications(req, res, next) {
  try {
    const { unreadOnly, limit } = req.query;
    const notifications = await getNotificationsForUser(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await getUnreadCount(req.user.id);
    return res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

async function readOne(req, res, next) {
  try {
    const notification = await markAsRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

async function readAll(req, res, next) {
  try {
    await markAllAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, unreadCount, readOne, readAll };
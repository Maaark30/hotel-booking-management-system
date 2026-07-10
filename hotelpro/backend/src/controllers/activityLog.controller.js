const { getAllLogs } = require('../models/activityLog.model');

async function listLogs(req, res, next) {
  try {
    const { userId, action, entityType, limit } = req.query;
    const logs = await getAllLogs({ userId, action, entityType, limit: limit ? parseInt(limit, 10) : undefined });
    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLogs };
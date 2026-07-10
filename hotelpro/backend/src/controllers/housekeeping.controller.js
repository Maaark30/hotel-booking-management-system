const {
  getAllHousekeepingRecords,
  getHousekeepingByRoomId,
  updateHousekeepingStatus,
  assignHousekeeping,
} = require('../models/housekeeping.model');

async function listHousekeeping(req, res, next) {
  try {
    const { status } = req.query;
    const records = await getAllHousekeepingRecords({ status });
    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
}

async function getRoomHousekeeping(req, res, next) {
  try {
    const record = await getHousekeepingByRoomId(req.params.roomId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'No housekeeping record found for this room' });
    }
    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/housekeeping/:roomId/status — used by the drag-and-drop board
async function changeStatus(req, res, next) {
  try {
    const { status, notes } = req.body;
    const record = await updateHousekeepingStatus(req.params.roomId, status, notes);
    if (!record) {
      return res.status(404).json({ success: false, message: 'No housekeeping record found for this room' });
    }
    return res.status(200).json({ success: true, message: `Room marked as ${status}`, data: record });
  } catch (err) {
    next(err);
  }
}

async function assignStaff(req, res, next) {
  try {
    const { assignedTo } = req.body;
    const record = await assignHousekeeping(req.params.roomId, assignedTo);
    if (!record) {
      return res.status(404).json({ success: false, message: 'No housekeeping record found for this room' });
    }
    return res.status(200).json({ success: true, message: 'Staff assigned', data: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { listHousekeeping, getRoomHousekeeping, changeStatus, assignStaff };
const express = require('express');
const router = express.Router();

const {
  listRooms,
  getRoom,
  addRoom,
  editRoom,
  changeRoomStatus,
  removeRoom,
  uploadRoomImages,
  removeRoomImage,
} = require('../controllers/room.controller');

const { roomRules, statusRules, validate } = require('../validations/room.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../config/upload.config');

// Public: anyone can browse rooms (customer-facing booking site needs this)
router.get('/', listRooms);
router.get('/:id', getRoom);

// Admin only: create, edit, delete rooms
router.post('/', authenticate, authorize('admin'), roomRules, validate, addRoom);
router.put('/:id', authenticate, authorize('admin'), roomRules, validate, editRoom);
router.delete('/:id', authenticate, authorize('admin'), removeRoom);

// Admin + Receptionist: update room status (e.g. during check-in/out, maintenance)
router.patch('/:id/status', authenticate, authorize('admin', 'receptionist'), statusRules, validate, changeRoomStatus);

// Admin only: manage room images
router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 5), uploadRoomImages);
router.delete('/images/:imageId', authenticate, authorize('admin'), removeRoomImage);

module.exports = router;
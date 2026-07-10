const fs = require('fs');
const path = require('path');
const {
  getAllRooms,
  getRoomById,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  addRoomImage,
  deleteRoomImage,
} = require('../models/room.model');
const { createHousekeepingRecord } = require('../models/housekeeping.model');
const { logActivity } = require('../models/activityLog.model');

async function listRooms(req, res, next) {
  try {
    const { status, categoryId } = req.query;
    const rooms = await getAllRooms({ status, categoryId });
    return res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
}

async function getRoom(req, res, next) {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    return res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}

async function addRoom(req, res, next) {
  try {
    const { categoryId, roomNumber, roomName, floorNumber, pricePerNight, capacity, description, amenities } = req.body;

    const existing = await getRoomByNumber(roomNumber);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Room number already exists' });
    }

    const room = await createRoom({
      categoryId, roomNumber, roomName, floorNumber,
      pricePerNight, capacity, description, amenities,
    });

    // Every new room starts with a housekeeping record, defaulting to "dirty"
    // (must be cleaned/inspected before guests can check in)
    await createHousekeepingRecord(room.id, 'dirty');

    logActivity({
      userId: req.user.id,
      action: 'ROOM_CREATED',
      entityType: 'room',
      entityId: room.id,
      details: { roomNumber: room.room_number, pricePerNight: room.price_per_night },
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Room created', data: room });
  } catch (err) {
    next(err);
  }
}

async function editRoom(req, res, next) {
  try {
    const existing = await getRoomById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const { categoryId, roomNumber, roomName, floorNumber, pricePerNight, capacity, description, amenities, status } = req.body;

    // If changing room number, make sure the new one isn't taken by a different room
    if (roomNumber && roomNumber !== existing.room_number) {
      const conflict = await getRoomByNumber(roomNumber);
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Room number already exists' });
      }
    }

    const room = await updateRoom(req.params.id, {
      categoryId: categoryId ?? existing.category_id,
      roomNumber: roomNumber ?? existing.room_number,
      roomName: roomName ?? existing.room_name,
      floorNumber: floorNumber ?? existing.floor_number,
      pricePerNight: pricePerNight ?? existing.price_per_night,
      capacity: capacity ?? existing.capacity,
      description: description ?? existing.description,
      amenities: amenities ?? existing.amenities,
      status: status ?? existing.status,
    });

    return res.status(200).json({ success: true, message: 'Room updated', data: room });
  } catch (err) {
    next(err);
  }
}

async function changeRoomStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const room = await updateRoomStatus(req.params.id, status);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    return res.status(200).json({ success: true, message: 'Room status updated', data: room });
  } catch (err) {
    next(err);
  }
}

async function removeRoom(req, res, next) {
  try {
    const deleted = await deleteRoom(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    return res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/rooms/:id/images  (multipart/form-data, field name: "images", up to 5 files)
async function uploadRoomImages(req, res, next) {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files were uploaded' });
    }

    const savedImages = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/rooms/${file.filename}`;
      const image = await addRoomImage(req.params.id, imageUrl);
      savedImages.push(image);
    }

    return res.status(201).json({ success: true, message: 'Images uploaded', data: savedImages });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/rooms/images/:imageId
async function removeRoomImage(req, res, next) {
  try {
    const deleted = await deleteRoomImage(req.params.imageId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Best-effort: remove the physical file too
    const filePath = path.join(__dirname, '..', 'uploads', 'rooms', path.basename(deleted.image_url || ''));
    fs.unlink(filePath, () => {}); // ignore errors (file may already be gone)

    return res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRooms,
  getRoom,
  addRoom,
  editRoom,
  changeRoomStatus,
  removeRoom,
  uploadRoomImages,
  removeRoomImage,
};
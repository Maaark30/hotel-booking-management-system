const {
  getAllGuests,
  getGuestById,
  getGuestByEmail,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestWithBookingHistory,
} = require('../models/guest.model');

async function listGuests(req, res, next) {
  try {
    const { search } = req.query;
    const guests = await getAllGuests({ search });
    return res.status(200).json({ success: true, data: guests });
  } catch (err) {
    next(err);
  }
}

async function getGuest(req, res, next) {
  try {
    const guest = await getGuestWithBookingHistory(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    return res.status(200).json({ success: true, data: guest });
  } catch (err) {
    next(err);
  }
}

async function addGuest(req, res, next) {
  try {
    const { fullName, email, phone, address, governmentIdType, governmentIdNumber, notes } = req.body;

    // Prevent obvious duplicates by email, if provided
    if (email) {
      const existing = await getGuestByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'A guest with this email already exists', data: existing });
      }
    }

    const guest = await createGuest({
      userId: null, // walk-in guest created by staff; not linked to a login account
      fullName, email, phone, address,
      governmentIdType, governmentIdNumber, governmentIdImageUrl: null, notes,
    });

    return res.status(201).json({ success: true, message: 'Guest created', data: guest });
  } catch (err) {
    next(err);
  }
}

async function editGuest(req, res, next) {
  try {
    const existing = await getGuestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const { fullName, email, phone, address, governmentIdType, governmentIdNumber, notes } = req.body;

    const guest = await updateGuest(req.params.id, {
      fullName: fullName ?? existing.full_name,
      email: email ?? existing.email,
      phone: phone ?? existing.phone,
      address: address ?? existing.address,
      governmentIdType: governmentIdType ?? existing.government_id_type,
      governmentIdNumber: governmentIdNumber ?? existing.government_id_number,
      governmentIdImageUrl: existing.government_id_image_url,
      notes: notes ?? existing.notes,
    });

    return res.status(200).json({ success: true, message: 'Guest updated', data: guest });
  } catch (err) {
    next(err);
  }
}

async function removeGuest(req, res, next) {
  try {
    const deleted = await deleteGuest(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    return res.status(200).json({ success: true, message: 'Guest deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listGuests, getGuest, addGuest, editGuest, removeGuest };
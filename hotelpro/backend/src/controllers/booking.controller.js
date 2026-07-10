const {
  isRoomAvailable,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} = require('../models/booking.model');
const { getRoomById, updateRoomStatus } = require('../models/room.model');
const { sendEmail, bookingConfirmationEmail, bookingCancellationEmail } = require('../services/email.service');
const { logActivity } = require('../models/activityLog.model');
const { getGuestByUserId, createGuest } = require('../models/guest.model');
const { findUserById } = require('../models/user.model');
const { notifyAllStaff } = require('../models/notification.model');

async function listBookings(req, res, next) {
  try {
    const { status, roomId, guestId } = req.query;
    const bookings = await getAllBookings({ status, roomId, guestId });
    return res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings - staff creating a booking on behalf of any guest
async function addBooking(req, res, next) {
  try {
    const { guestId, roomId, checkInDate, checkOutDate, guestCount, specialRequests } = req.body;

    const room = await getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({ success: false, message: 'Room is under maintenance and cannot be booked' });
    }

    const available = await isRoomAvailable(roomId, checkInDate, checkOutDate);
    if (!available) {
      return res.status(409).json({
        success: false,
        message: 'Room is not available for the selected dates',
      });
    }

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * parseFloat(room.price_per_night);

    const booking = await createBooking({
      guestId,
      roomId,
      createdBy: req.user.id,
      checkInDate,
      checkOutDate,
      guestCount: guestCount || 1,
      specialRequests,
      totalAmount,
    });

    return res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
    }
    next(err);
  }
}

// POST /api/bookings/self - for logged-in customers booking for themselves
async function addSelfBooking(req, res, next) {
  try {
    const { roomId, checkInDate, checkOutDate, guestCount, specialRequests } = req.body;

    const room = await getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (room.status === 'maintenance') {
      return res.status(400).json({ success: false, message: 'Room is under maintenance and cannot be booked' });
    }

    const available = await isRoomAvailable(roomId, checkInDate, checkOutDate);
    if (!available) {
      return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
    }

    // Find or create a guest record linked to this customer's account
    let guest = await getGuestByUserId(req.user.id);
    if (!guest) {
      const userAccount = await findUserById(req.user.id);
      guest = await createGuest({
        userId: req.user.id,
        fullName: userAccount.full_name,
        email: userAccount.email,
        phone: userAccount.phone,
        address: null,
        governmentIdType: null,
        governmentIdNumber: null,
        governmentIdImageUrl: null,
        notes: null,
      });
    }

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * parseFloat(room.price_per_night);

    const booking = await createBooking({
      guestId: guest.id,
      roomId,
      createdBy: req.user.id,
      checkInDate,
      checkOutDate,
      guestCount: guestCount || 1,
      specialRequests,
      totalAmount,
    });

    // Notify staff that a new booking came in from the public website
    notifyAllStaff({
      type: 'system',
      title: 'New Booking Received',
      message: `${guest.full_name} booked ${room.room_name || room.room_number} for ${checkInDate} to ${checkOutDate}.`,
      relatedBookingId: booking.id,
    }).catch((err) => console.error('Failed to notify staff:', err.message));

    return res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
    }
    next(err);
  }
}

// GET /api/bookings/my-bookings - for the logged-in customer to view their own history
async function getMyBookings(req, res, next) {
  try {
    const guest = await getGuestByUserId(req.user.id);
    if (!guest) {
      return res.status(200).json({ success: true, data: [] }); // no bookings yet
    }
    const bookings = await getAllBookings({ guestId: guest.id });
    return res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

// PUT /api/bookings/:id  (edit dates/guest count/requests - only sensible while still pending/confirmed)
async function editBooking(req, res, next) {
  try {
    const existing = await getBookingById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['checked_in', 'checked_out', 'cancelled'].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a booking that is already ${existing.status}`,
      });
    }

    const checkInDate = req.body.checkInDate || existing.check_in_date;
    const checkOutDate = req.body.checkOutDate || existing.check_out_date;
    const guestCount = req.body.guestCount ?? existing.guest_count;
    const specialRequests = req.body.specialRequests ?? existing.special_requests;

    const available = await isRoomAvailable(existing.room_id, checkInDate, checkOutDate, existing.id);
    if (!available) {
      return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
    }

    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * parseFloat(existing.price_per_night);

    const booking = await updateBooking(req.params.id, { checkInDate, checkOutDate, guestCount, specialRequests, totalAmount });
    return res.status(200).json({ success: true, message: 'Booking updated', data: booking });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
    }
    next(err);
  }
}

// PATCH /api/bookings/:id/status  - drives the booking lifecycle + room status syncing
async function changeBookingStatus(req, res, next) {
  try {
    const { status: newStatus } = req.body;
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: [],
      cancelled: [],
    };

    if (!validTransitions[booking.status].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition booking from "${booking.status}" to "${newStatus}"`,
      });
    }

    const updated = await updateBookingStatus(req.params.id, newStatus);

    if (newStatus === 'checked_in') {
      await updateRoomStatus(booking.room_id, 'occupied');
    } else if (newStatus === 'checked_out') {
      await updateRoomStatus(booking.room_id, 'available');
    }

    if (newStatus === 'confirmed' && booking.guest_email) {
      const { subject, html } = bookingConfirmationEmail({
        guestName: booking.guest_name,
        roomName: booking.room_name || booking.room_number,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        totalAmount: booking.total_amount,
      });
      sendEmail({ to: booking.guest_email, subject, html }).catch((err) => {
        console.error('Failed to send booking confirmation email:', err.message);
      });
    } else if (newStatus === 'cancelled' && booking.guest_email) {
      const { subject, html } = bookingCancellationEmail({
        guestName: booking.guest_name,
        roomName: booking.room_name || booking.room_number,
        checkInDate: booking.check_in_date,
      });
      sendEmail({ to: booking.guest_email, subject, html }).catch((err) => {
        console.error('Failed to send booking cancellation email:', err.message);
      });
    }

    logActivity({
      userId: req.user.id,
      action: `BOOKING_${newStatus.toUpperCase()}`,
      entityType: 'booking',
      entityId: booking.id,
      details: { previousStatus: booking.status, newStatus },
      ipAddress: req.ip,
    });

    return res.status(200).json({ success: true, message: `Booking status updated to ${newStatus}`, data: updated });
  } catch (err) {
    next(err);
  }
}

async function removeBooking(req, res, next) {
  try {
    const deleted = await deleteBooking(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBookings, getBooking, addBooking, addSelfBooking, getMyBookings, editBooking, changeBookingStatus, removeBooking };
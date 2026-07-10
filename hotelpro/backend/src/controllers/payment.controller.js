const {
  getAllPayments,
  getPaymentById,
  getTotalPaidForBooking,
  createPayment,
  updatePaymentStatus,
  deletePayment,
} = require('../models/payment.model');
const { getBookingById } = require('../models/booking.model');
const { getGuestByUserId } = require('../models/guest.model');
const { sendEmail, paymentConfirmationEmail } = require('../services/email.service');

async function listPayments(req, res, next) {
  try {
    const { status, bookingId } = req.query;
    const payments = await getAllPayments({ status, bookingId });
    return res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

async function getPayment(req, res, next) {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

async function addPayment(req, res, next) {
  try {
    const { bookingId, amount, method, transactionReference } = req.body;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const alreadyPaid = await getTotalPaidForBooking(bookingId);
    const remainingBalance = parseFloat(booking.total_amount) - alreadyPaid;

    if (parseFloat(amount) > remainingBalance + 0.01) { // small epsilon for float rounding
      return res.status(400).json({
        success: false,
        message: `Amount exceeds remaining balance of ${remainingBalance.toFixed(2)}`,
      });
    }

    const payment = await createPayment({
      bookingId, amount, method, recordedBy: req.user.id, transactionReference,
    });

    return res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/self - customer records their own intended payment method for their booking
async function addSelfPayment(req, res, next) {
  try {
    const { bookingId, amount, method } = req.body;

    const guest = await getGuestByUserId(req.user.id);
    if (!guest) {
      return res.status(403).json({ success: false, message: 'No guest profile found for this account' });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure this booking actually belongs to the logged-in customer
    if (booking.guest_id !== guest.id) {
      return res.status(403).json({ success: false, message: 'You can only record payments for your own bookings' });
    }

    const existingPayments = await getAllPayments({ bookingId });
    if (existingPayments.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A payment has already been recorded for this booking',
      });
    }

    const alreadyPaid = await getTotalPaidForBooking(bookingId);
    const remainingBalance = parseFloat(booking.total_amount) - alreadyPaid;

    if (parseFloat(amount) > remainingBalance + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds remaining balance of ${remainingBalance.toFixed(2)}`,
      });
    }

    const payment = await createPayment({
      bookingId, amount, method, recordedBy: req.user.id, transactionReference: null,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment method recorded. Our staff will confirm your payment shortly.',
      data: payment,
    });
  } catch (err) {
    next(err);
  }
}

async function changePaymentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const payment = await updatePaymentStatus(req.params.id, status);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (status === 'paid') {
      const booking = await getBookingById(payment.booking_id);
      if (booking && booking.guest_email) {
        const { subject, html } = paymentConfirmationEmail({
          guestName: booking.guest_name,
          amount: payment.amount,
          method: payment.method,
        });
        sendEmail({ to: booking.guest_email, subject, html }).catch((err) => {
          console.error('Failed to send payment confirmation email:', err.message);
        });
      }
    }

    return res.status(200).json({ success: true, message: `Payment marked as ${status}`, data: payment });
  } catch (err) {
    next(err);
  }
}

async function removePayment(req, res, next) {
  try {
    const deleted = await deletePayment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    return res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPayments, getPayment, addPayment, addSelfPayment, changePaymentStatus, removePayment };
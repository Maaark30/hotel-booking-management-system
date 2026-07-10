const {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByBookingId,
  generateInvoiceNumber,
  calculateInvoiceTotals,
  createInvoice,
} = require('../models/invoice.model');
const { getBookingById } = require('../models/booking.model');

async function listInvoices(req, res, next) {
  try {
    const invoices = await getAllInvoices();
    return res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
}

async function getInvoice(req, res, next) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

// POST /api/invoices/generate  — typically called at checkout time
async function generateInvoice(req, res, next) {
  try {
    const { bookingId, additionalCharges, discountAmount } = req.body;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const existing = await getInvoiceByBookingId(bookingId);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Invoice already exists for this booking', data: existing });
    }

    const totals = calculateInvoiceTotals({
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      pricePerNight: booking.price_per_night,
      additionalCharges: additionalCharges || 0,
      discountAmount: discountAmount || 0,
    });

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await createInvoice({
      bookingId,
      invoiceNumber,
      roomCharge: totals.roomCharge,
      additionalCharges: totals.additionalCharges,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice generated',
      data: { ...invoice, nights: totals.nights },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvoices, getInvoice, generateInvoice };
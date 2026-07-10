const pool = require('../config/db');

const TAX_RATE = 0.12; // 12% VAT — adjust to your actual local tax rate as needed

async function getAllInvoices() {
  const result = await pool.query(
    `SELECT i.*, g.full_name AS guest_name, r.room_number
     FROM invoices i
     JOIN bookings b ON i.booking_id = b.id
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     ORDER BY i.issued_at DESC`
  );
  return result.rows;
}

async function getInvoiceById(id) {
  const result = await pool.query(
    `SELECT i.*, b.check_in_date, b.check_out_date, b.guest_count,
            g.full_name AS guest_name, g.email AS guest_email, g.phone AS guest_phone, g.address AS guest_address,
            r.room_number, r.room_name, rc.name AS category_name
     FROM invoices i
     JOIN bookings b ON i.booking_id = b.id
     JOIN guests g ON b.guest_id = g.id
     JOIN rooms r ON b.room_id = r.id
     JOIN room_categories rc ON r.category_id = rc.id
     WHERE i.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function getInvoiceByBookingId(bookingId) {
  const result = await pool.query(`SELECT * FROM invoices WHERE booking_id = $1`, [bookingId]);
  return result.rows[0];
}

async function generateInvoiceNumber() {
  // e.g. INV-2026-000123, sequential per year for readability
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT COUNT(*) AS count FROM invoices WHERE invoice_number LIKE $1`,
    [`INV-${year}-%`]
  );
  const nextSeq = parseInt(result.rows[0].count, 10) + 1;
  return `INV-${year}-${String(nextSeq).padStart(6, '0')}`;
}

// Computes the full charge breakdown for a booking.
// additionalCharges and discountAmount are optional extras (e.g. food, damages, promo).
function calculateInvoiceTotals({ checkInDate, checkOutDate, pricePerNight, additionalCharges = 0, discountAmount = 0 }) {
  const nights = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );
  const roomCharge = nights * parseFloat(pricePerNight);
  const subtotal = roomCharge + parseFloat(additionalCharges) - parseFloat(discountAmount);
  const taxAmount = Math.max(subtotal, 0) * TAX_RATE;
  const totalAmount = Math.max(subtotal, 0) + taxAmount;

  return {
    nights,
    roomCharge: round2(roomCharge),
    additionalCharges: round2(additionalCharges),
    discountAmount: round2(discountAmount),
    taxAmount: round2(taxAmount),
    totalAmount: round2(totalAmount),
  };
}

function round2(value) {
  return Math.round(parseFloat(value) * 100) / 100;
}

async function createInvoice({ bookingId, invoiceNumber, roomCharge, additionalCharges, taxAmount, discountAmount, totalAmount }) {
  const result = await pool.query(
    `INSERT INTO invoices (booking_id, invoice_number, room_charge, additional_charges, tax_amount, discount_amount, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [bookingId, invoiceNumber, roomCharge, additionalCharges, taxAmount, discountAmount, totalAmount]
  );
  return result.rows[0];
}

async function setInvoicePdfUrl(id, pdfUrl) {
  const result = await pool.query(
    `UPDATE invoices SET pdf_url = $1 WHERE id = $2 RETURNING *`,
    [pdfUrl, id]
  );
  return result.rows[0];
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByBookingId,
  generateInvoiceNumber,
  calculateInvoiceTotals,
  createInvoice,
  setInvoicePdfUrl,
};
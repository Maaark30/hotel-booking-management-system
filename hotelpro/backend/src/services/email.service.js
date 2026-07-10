const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    throw err;
  }
}

// ---------- Email templates ----------

function registrationEmail(fullName) {
  return {
    subject: 'Welcome to Luminarc Hotel!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9A86A;">Welcome to Luminarc Hotel, ${fullName}!</h2>
        <p>Your account has been created successfully. You can now log in and start booking your stay.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Luminarc Hotel.</p>
      </div>
    `,
  };
}

function bookingConfirmationEmail({ guestName, roomName, checkInDate, checkOutDate, totalAmount }) {
  return {
    subject: 'Booking Confirmed - Luminarc Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9A86A;">Your booking is confirmed!</h2>
        <p>Hi ${guestName}, here are your booking details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0;"><strong>Room:</strong></td><td>${roomName}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Check-in:</strong></td><td>${checkInDate}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Check-out:</strong></td><td>${checkOutDate}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Total Amount:</strong></td><td>₱${totalAmount}</td></tr>
        </table>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Luminarc Hotel.</p>
      </div>
    `,
  };
}

function bookingCancellationEmail({ guestName, roomName, checkInDate }) {
  return {
    subject: 'Booking Cancelled - Luminarc Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Your booking has been cancelled</h2>
        <p>Hi ${guestName}, your booking for ${roomName} on ${checkInDate} has been cancelled.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Luminarc Hotel.</p>
      </div>
    `,
  };
}

function paymentConfirmationEmail({ guestName, amount, method }) {
  return {
    subject: 'Payment Received - Luminarc Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Payment received</h2>
        <p>Hi ${guestName}, we've received your payment of ₱${amount} via ${method}.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Luminarc Hotel.</p>
      </div>
    `,
  };
}

function passwordResetEmail({ fullName, resetUrl }) {
  return {
    subject: 'Reset Your Password - Luminarc Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9A86A;">Password Reset Request</h2>
        <p>Hi ${fullName}, click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #C9A86A; color: #080B12; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 12px;">Reset Password</a>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}

module.exports = {
  sendEmail,
  registrationEmail,
  bookingConfirmationEmail,
  bookingCancellationEmail,
  paymentConfirmationEmail,
  passwordResetEmail,
};
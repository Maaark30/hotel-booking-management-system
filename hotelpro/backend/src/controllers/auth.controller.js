const crypto = require('crypto');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/auth.utils');
const { sendEmail, registrationEmail, passwordResetEmail } = require('../services/email.service');
const { logActivity } = require('../models/activityLog.model');

const {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  setResetToken,
  findUserByResetToken,
  updatePassword,
} = require('../models/user.model');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({ fullName, email, phone, passwordHash, roleName: 'customer' });

    // Send welcome email - fire and forget, don't block the response on it
    const { subject, html } = registrationEmail(fullName);
    sendEmail({ to: email, subject, html }).catch((err) => {
      console.error('Failed to send registration email:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await updateLastLogin(user.id);

    logActivity({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role_name,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
// With stateless JWT, logout is handled client-side by deleting the token.
// This endpoint exists for consistency / future token-blacklist support.
async function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// GET /api/auth/me
async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    // Always respond the same way whether or not the email exists,
    // to avoid leaking which emails are registered.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await setResetToken(user.id, resetToken, expiresAt);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const { subject, html } = passwordResetEmail({ fullName: user.full_name, resetUrl });
    sendEmail({ to: email, subject, html }).catch((err) => {
      console.error('Failed to send password reset email:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const passwordHash = await hashPassword(newPassword);
    await updatePassword(user.id, passwordHash);

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/change-password (requires authentication)
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentMatches = await comparePassword(currentPassword, user.password_hash);
    if (!currentMatches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const passwordHash = await hashPassword(newPassword);
    await updatePassword(user.id, passwordHash);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};
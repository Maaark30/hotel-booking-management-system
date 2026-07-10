const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/auth.controller');

const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  validate,
} = require('../validations/auth.validation');

const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', authenticate, getProfile);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.post('/change-password', authenticate, changePasswordRules, validate, changePassword);

module.exports = router;
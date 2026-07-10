const express = require('express');
const router = express.Router();

const { listPayments, getPayment, addPayment, addSelfPayment, changePaymentStatus, removePayment } = require('../controllers/payment.controller');
const { paymentRules, selfPaymentRules, statusRules, validate } = require('../validations/payment.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Customer self-service — record intended payment method for their own booking
router.post('/self', authenticate, selfPaymentRules, validate, addSelfPayment);

router.get('/', authenticate, authorize('admin', 'receptionist'), listPayments);
router.get('/:id', authenticate, authorize('admin', 'receptionist'), getPayment);
router.post('/', authenticate, authorize('admin', 'receptionist'), paymentRules, validate, addPayment);
router.patch('/:id/status', authenticate, authorize('admin', 'receptionist'), statusRules, validate, changePaymentStatus);
router.delete('/:id', authenticate, authorize('admin'), removePayment);

module.exports = router;
const express = require('express');
const router = express.Router();

const { listGuests, getGuest, addGuest, editGuest, removeGuest } = require('../controllers/guest.controller');
const { guestRules, validate } = require('../validations/guest.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Admin + Receptionist can manage guests
router.get('/', authenticate, authorize('admin', 'receptionist'), listGuests);
router.get('/:id', authenticate, authorize('admin', 'receptionist'), getGuest);
router.post('/', authenticate, authorize('admin', 'receptionist'), guestRules, validate, addGuest);
router.put('/:id', authenticate, authorize('admin', 'receptionist'), guestRules, validate, editGuest);
router.delete('/:id', authenticate, authorize('admin'), removeGuest);

module.exports = router;
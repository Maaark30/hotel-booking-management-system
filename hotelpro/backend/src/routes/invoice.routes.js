const express = require('express');
const router = express.Router();

const { listInvoices, getInvoice, generateInvoice } = require('../controllers/invoice.controller');
const { generateInvoiceRules, validate } = require('../validations/invoice.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize('admin', 'receptionist'), listInvoices);
router.get('/:id', authenticate, authorize('admin', 'receptionist'), getInvoice);
router.post('/generate', authenticate, authorize('admin', 'receptionist'), generateInvoiceRules, validate, generateInvoice);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} = require('../controllers/roomCategory.controller');

const { categoryRules, validate } = require('../validations/room.validation');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public: anyone can browse categories (customers need this to see room types)
router.get('/', listCategories);
router.get('/:id', getCategory);

// Admin only: manage categories
router.post('/', authenticate, authorize('admin'), categoryRules, validate, addCategory);
router.put('/:id', authenticate, authorize('admin'), categoryRules, validate, editCategory);
router.delete('/:id', authenticate, authorize('admin'), removeCategory);

module.exports = router;
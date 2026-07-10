const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../models/roomCategory.model');

async function listCategories(req, res, next) {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    const { name, description, basePrice, capacity, amenities } = req.body;
    const category = await createCategory({ name, description, basePrice, capacity, amenities });
    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    next(err);
  }
}

async function editCategory(req, res, next) {
  try {
    const existing = await getCategoryById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const { name, description, basePrice, capacity, amenities } = req.body;
    const category = await updateCategory(req.params.id, { name, description, basePrice, capacity, amenities });
    return res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (err) {
    next(err);
  }
}

async function removeCategory(req, res, next) {
  try {
    const deleted = await deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, getCategory, addCategory, editCategory, removeCategory };
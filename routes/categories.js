const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getProductsByCategoryId,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoriesController');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id/products', getProductsByCategoryId);

router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
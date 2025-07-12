const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// All category routes are protected
router.use(authMiddleware);

// GET /api/categories/menu/:menuId - Get all categories for a specific menu
router.get('/menu/:menuId', categoryController.getCategoriesByMenu);

// POST /api/categories - Create a new category (with optional image upload)
router.post('/', uploadSingle('image'), categoryController.createCategory);

// PUT /api/categories/:categoryId - Update a category (with optional image upload)
router.put('/:categoryId', uploadSingle('image'), categoryController.updateCategory);

// DELETE /api/categories/:categoryId - Delete a category
router.delete('/:categoryId', categoryController.deleteCategory);

// PUT /api/categories/order - Update display order of categories
router.put('/order', categoryController.updateCategoryOrder);

// TODO: Add route for category image upload e.g.
// router.post('/:categoryId/image', uploadMiddleware.single('categoryImage'), categoryController.uploadCategoryImage);

module.exports = router;

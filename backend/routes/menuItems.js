const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const authMiddleware = require('../middleware/authMiddleware');
// const uploadMiddleware = require('../middleware/uploadMiddleware'); // For image uploads later

// All menu item routes are protected
router.use(authMiddleware);

// GET /api/menu-items/category/:categoryId - Get all items for a specific category
router.get('/category/:categoryId', menuItemController.getItemsByCategory);

// POST /api/menu-items - Create a new menu item
router.post('/', menuItemController.createMenuItem);

// PUT /api/menu-items/:itemId - Update a menu item
router.put('/:itemId', menuItemController.updateMenuItem);

// DELETE /api/menu-items/:itemId - Delete a menu item
router.delete('/:itemId', menuItemController.deleteMenuItem);

// PUT /api/menu-items/order - Update display order of menu items
router.put('/order', menuItemController.updateMenuItemOrder);

// TODO: Add route for menu item image upload e.g.
// router.post('/:itemId/image', uploadMiddleware.single('itemImage'), menuItemController.uploadItemImage);

module.exports = router;

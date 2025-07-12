const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the specific function

// All menu routes are protected
router.use(authMiddleware); // Use the destructured function

// GET /api/menus - Get all menus for the user's restaurant
router.get('/', menuController.getMenus);

// POST /api/menus - Create a new menu
router.post('/', menuController.createMenu);

// GET /api/menus/:menuId - Get a specific menu by ID (with categories and items)
router.get('/:menuId', menuController.getMenuById);

// GET /api/menus/:menuId/stats - Get menu statistics (categories and items count)
router.get('/:menuId/stats', menuController.getMenuStats);

// PUT /api/menus/:menuId - Update a menu
router.put('/:menuId', menuController.updateMenu);

// DELETE /api/menus/:menuId - Delete a menu
router.delete('/:menuId', menuController.deleteMenu);

// GET /api/menus/:menuId/items-count - Get total item count for a specific menu
router.get('/:menuId/items-count', menuController.getMenuItemsCountForMenu);

// PUT /api/menus/:menuId/toggle-archive - Archive/Unarchive a menu
router.put('/:menuId/toggle-archive', menuController.toggleMenuArchive);

// PUT /api/menus/:menuId/archive - Archive a menu
router.put('/:menuId/archive', menuController.archiveMenu);

// PUT /api/menus/:menuId/unarchive - Unarchive a menu
router.put('/:menuId/unarchive', menuController.unarchiveMenu);

// POST /api/menus/:menuId/duplicate - Duplicate a menu
router.post('/:menuId/duplicate', menuController.duplicateMenu);

// GET /api/menus/by-type - Get menus grouped by type
router.get('/by-type', menuController.getMenusByType);

// GET /api/menus/type-suggestions - Get menu type suggestions based on restaurant type
router.get('/type-suggestions', menuController.getMenuTypeSuggestions);

// Note: The public menu route /api/menu/public/:restaurantSlug might be separate
// or handled by a different controller/logic if it doesn't require auth.
// For this task, we are focusing on the authenticated dashboard routes.

module.exports = router;

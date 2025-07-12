const db = require('../db/db');

/**
 * Middleware to ensure users can only access their own restaurant data
 * Validates that restaurant_id in params belongs to the authenticated user
 */
const validateRestaurantOwnership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const restaurantId = req.params.restaurantId || req.body.restaurant_id || req.query.restaurant_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required',
                code: 'RESTAURANT_ID_REQUIRED'
            });
        }

        // Check if the restaurant belongs to the authenticated user
        const restaurant = await db('restaurants')
            .where({ id: restaurantId, user_id: userId })
            .first();

        if (!restaurant) {
            console.log(`[Data Isolation] User ${userId} attempted to access restaurant ${restaurantId} - DENIED`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Restaurant not found or you do not have permission.',
                code: 'RESTAURANT_ACCESS_DENIED'
            });
        }

        console.log(`[Data Isolation] User ${userId} accessing restaurant ${restaurantId} - ALLOWED`);
        next();

    } catch (error) {
        console.error('[Data Isolation] Error validating restaurant ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating access permissions',
            code: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Middleware to ensure users can only access their own menu data
 * Validates that menu_id belongs to a restaurant owned by the authenticated user
 */
const validateMenuOwnership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const menuId = req.params.menuId || req.body.menu_id || req.query.menu_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!menuId) {
            return res.status(400).json({
                success: false,
                message: 'Menu ID is required',
                code: 'MENU_ID_REQUIRED'
            });
        }

        // Check if the menu belongs to a restaurant owned by the authenticated user
        const menu = await db('menus')
            .join('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where({ 'menus.id': menuId, 'restaurants.user_id': userId })
            .select('menus.*')
            .first();

        if (!menu) {
            console.log(`[Data Isolation] User ${userId} attempted to access menu ${menuId} - DENIED`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Menu not found or you do not have permission.',
                code: 'MENU_ACCESS_DENIED'
            });
        }

        console.log(`[Data Isolation] User ${userId} accessing menu ${menuId} - ALLOWED`);
        next();

    } catch (error) {
        console.error('[Data Isolation] Error validating menu ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating access permissions',
            code: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Middleware to ensure users can only access their own category data
 * Validates that category_id belongs to a menu/restaurant owned by the authenticated user
 */
const validateCategoryOwnership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const categoryId = req.params.categoryId || req.body.category_id || req.query.category_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required',
                code: 'CATEGORY_ID_REQUIRED'
            });
        }

        // Check if the category belongs to a menu/restaurant owned by the authenticated user
        const category = await db('categories')
            .join('menus', 'categories.menu_id', 'menus.id')
            .join('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where({ 'categories.id': categoryId, 'restaurants.user_id': userId })
            .select('categories.*')
            .first();

        if (!category) {
            console.log(`[Data Isolation] User ${userId} attempted to access category ${categoryId} - DENIED`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Category not found or you do not have permission.',
                code: 'CATEGORY_ACCESS_DENIED'
            });
        }

        console.log(`[Data Isolation] User ${userId} accessing category ${categoryId} - ALLOWED`);
        next();

    } catch (error) {
        console.error('[Data Isolation] Error validating category ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating access permissions',
            code: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Middleware to ensure users can only access their own menu item data
 * Validates that item_id belongs to a category/menu/restaurant owned by the authenticated user
 */
const validateMenuItemOwnership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const itemId = req.params.itemId || req.body.item_id || req.query.item_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'Menu item ID is required',
                code: 'ITEM_ID_REQUIRED'
            });
        }

        // Check if the menu item belongs to a category/menu/restaurant owned by the authenticated user
        const menuItem = await db('menu_items')
            .join('categories', 'menu_items.category_id', 'categories.id')
            .join('menus', 'categories.menu_id', 'menus.id')
            .join('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where({ 'menu_items.id': itemId, 'restaurants.user_id': userId })
            .select('menu_items.*')
            .first();

        if (!menuItem) {
            console.log(`[Data Isolation] User ${userId} attempted to access menu item ${itemId} - DENIED`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Menu item not found or you do not have permission.',
                code: 'MENU_ITEM_ACCESS_DENIED'
            });
        }

        console.log(`[Data Isolation] User ${userId} accessing menu item ${itemId} - ALLOWED`);
        next();

    } catch (error) {
        console.error('[Data Isolation] Error validating menu item ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating access permissions',
            code: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Helper function to get user's restaurant ID
 * Returns null if user has no restaurant
 */
const getUserRestaurantId = async (userId) => {
    try {
        const restaurant = await db('restaurants')
            .where({ user_id: userId })
            .select('id')
            .first();
        
        return restaurant ? restaurant.id : null;
    } catch (error) {
        console.error('Error getting user restaurant ID:', error);
        return null;
    }
};

module.exports = {
    validateRestaurantOwnership,
    validateMenuOwnership,
    validateCategoryOwnership,
    validateMenuItemOwnership,
    getUserRestaurantId
};

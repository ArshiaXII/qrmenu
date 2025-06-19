const knex = require('../db/db'); // Adjust path if your db setup is different

// Get all menus for the logged-in user's restaurant
exports.getMenus = async (req, res) => {
  try {
    // Assuming user's restaurant_id is available via auth (e.g., req.user.restaurant_id)
    // This needs to be set by your auth middleware after verifying JWT
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }

    // Support filtering by is_active status
    const { is_active } = req.query;
    let query = knex('menus').where({ restaurant_id: req.user.restaurant_id });

    if (is_active !== undefined) {
      // Convert string to boolean
      const isActiveBoolean = is_active === 'true';
      query = query.where({ is_active: isActiveBoolean });
    }

    const menus = await query.orderBy('created_at', 'desc');
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus", error: error.message });
  }
};

// Get a single menu by ID, including its categories and items (more complex query)
exports.getMenuById = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;
    const menu = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .first();

    if (!menu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    // Fetch categories for this menu
    const categories = await knex('categories')
      .where({ menu_id: menuId })
      .orderBy('display_order', 'asc');

    // For each category, fetch its items
    for (let category of categories) {
      category.items = await knex('menu_items')
        .where({ category_id: category.id })
        .orderBy('display_order', 'asc');
    }

    // Simple way to nest categories (can be improved for deeper nesting)
    const buildHierarchy = (list, parentId = null) => {
        const children = list.filter(cat => cat.parent_id === parentId);
        if (!children.length) return parentId === null ? [] : undefined; // return undefined for children prop if no children
        return children.map(cat => ({
            ...cat,
            subcategories: buildHierarchy(list, cat.id) || [] // ensure subcategories is always an array
        }));
    };

    menu.categories = buildHierarchy(categories);


    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu details", error: error.message });
  }
};

// Create a new menu
exports.createMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { name, description, menu_type = 'all_day', active_hours, display_order = 0, is_active = true } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Menu name is required." });
    }

    const [newMenuId] = await knex('menus').insert({
      restaurant_id: req.user.restaurant_id,
      name,
      description: description || null,
      menu_type,
      active_hours: active_hours ? JSON.stringify(active_hours) : null,
      display_order,
      is_active,
    });
    const newMenu = await knex('menus').where({ id: newMenuId }).first();
    res.status(201).json(newMenu);
  } catch (error) {
    res.status(500).json({ message: "Error creating menu", error: error.message });
  }
};

// Update an existing menu
exports.updateMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;
    const { name, description, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }

    updateData.updated_at = knex.fn.now(); // Update the timestamp

    const updatedCount = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .update(updateData);

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }
    const updatedMenu = await knex('menus').where({ id: menuId }).first();
    res.status(200).json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: "Error updating menu", error: error.message });
  }
};

// Delete a menu
exports.deleteMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;
    // Ensure categories and items are deleted first due to FK constraints if not handled by DB ON DELETE CASCADE
    // For simplicity, assuming ON DELETE CASCADE is set for categories on menus table,
    // and for menu_items on categories table. If not, manual deletion is needed.

    const deletedCount = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }
    res.status(200).json({ message: "Menu deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu", error: error.message });
  }
};

// Archive/Unarchive a menu (toggle is_active status)
exports.toggleMenuArchive = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    // Get current menu status
    const menu = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .first();

    if (!menu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    // Toggle the is_active status
    const newStatus = !menu.is_active;
    await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .update({
        is_active: newStatus,
        updated_at: knex.fn.now()
      });

    const updatedMenu = await knex('menus').where({ id: menuId }).first();
    res.status(200).json({
      message: `Menu ${newStatus ? 'activated' : 'archived'} successfully.`,
      menu: updatedMenu
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling menu archive status", error: error.message });
  }
};

// Duplicate a menu
exports.duplicateMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    // Get the original menu
    const originalMenu = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .first();

    if (!originalMenu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    // Create new menu with "Copy of" prefix
    const [newMenuId] = await knex('menus').insert({
      restaurant_id: req.user.restaurant_id,
      name: `Copy of ${originalMenu.name}`,
      description: originalMenu.description,
      is_active: false, // Start as inactive
    });

    // Get categories from original menu
    const categories = await knex('categories')
      .where({ menu_id: menuId })
      .orderBy('display_order', 'asc');

    // Duplicate categories and their items
    for (const category of categories) {
      const [newCategoryId] = await knex('categories').insert({
        menu_id: newMenuId,
        parent_id: null, // For now, we'll handle parent_id in a second pass if needed
        name: category.name,
        description: category.description,
        image_path: category.image_path,
        is_visible: category.is_visible,
        display_order: category.display_order,
      });

      // Get items for this category
      const items = await knex('menu_items')
        .where({ category_id: category.id })
        .orderBy('display_order', 'asc');

      // Duplicate items
      for (const item of items) {
        await knex('menu_items').insert({
          category_id: newCategoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          price_min: item.price_min,
          price_max: item.price_max,
          image_path: item.image_path,
          is_available: item.is_available,
          display_order: item.display_order,
          name_en: item.name_en,
          description_en: item.description_en,
          name_tr: item.name_tr,
          description_tr: item.description_tr,
        });
      }
    }

    const newMenu = await knex('menus').where({ id: newMenuId }).first();
    res.status(201).json({
      message: "Menu duplicated successfully.",
      menu: newMenu
    });
  } catch (error) {
    res.status(500).json({ message: "Error duplicating menu", error: error.message });
  }
};

// Archive a menu (set is_active = false)
exports.archiveMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    const updatedCount = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .update({
        is_active: false,
        updated_at: knex.fn.now()
      });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    const updatedMenu = await knex('menus').where({ id: menuId }).first();
    res.status(200).json({
      message: "Menu archived successfully.",
      menu: updatedMenu
    });
  } catch (error) {
    res.status(500).json({ message: "Error archiving menu", error: error.message });
  }
};

// Unarchive a menu (set is_active = true)
exports.unarchiveMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    const updatedCount = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .update({
        is_active: true,
        updated_at: knex.fn.now()
      });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    const updatedMenu = await knex('menus').where({ id: menuId }).first();
    res.status(200).json({
      message: "Menu unarchived successfully.",
      menu: updatedMenu
    });
  } catch (error) {
    res.status(500).json({ message: "Error unarchiving menu", error: error.message });
  }
};

// Get menu statistics (categories and items count)
exports.getMenuStats = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    // Verify the menu belongs to the user's restaurant
    const menu = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .first();

    if (!menu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    // Get count of categories for this menu
    const categoryCount = await knex('categories')
      .where('menu_id', menuId)
      .count('id as count')
      .first();

    // Get count of menu items for this menu
    const itemCount = await knex('menu_items')
      .join('categories', 'menu_items.category_id', 'categories.id')
      .where('categories.menu_id', menuId)
      .count('menu_items.id as count')
      .first();

    res.status(200).json({
      categories: parseInt(categoryCount.count) || 0,
      items: parseInt(itemCount.count) || 0
    });
  } catch (error) {
    console.error(`[MenuController] Error fetching stats for menu ${req.params.menuId}:`, error);
    res.status(500).json({ message: "Error fetching menu statistics", error: error.message });
  }
};

exports.getMenuItemsCountForMenu = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(403).json({ message: "User not associated with a restaurant." });
    }
    const { menuId } = req.params;

    // Verify the menu belongs to the user's restaurant
    const menu = await knex('menus')
      .where({ id: menuId, restaurant_id: req.user.restaurant_id })
      .first();

    if (!menu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    // Count items across all categories of this menu
    const result = await knex('menu_items')
      .join('categories', 'menu_items.category_id', 'categories.id')
      .where('categories.menu_id', menuId)
      .count('menu_items.id as itemCount')
      .first();

    res.status(200).json({ itemCount: result.itemCount || 0 });

  } catch (error) {
    console.error(`[MenuController] Error fetching item count for menu ${req.params.menuId}:`, error);
    res.status(500).json({ message: "Error fetching menu items count", error: error.message });
  }
};

// --- Public Menu Access ---
exports.getPublicMenuBySlug = async (req, res) => {
    const { restaurantSlug } = req.params;
    console.log(`[MenuController] Attempting to fetch public menu for slug: ${restaurantSlug}`);

    try {
        // 1. Get restaurant by slug
        const restaurant = await knex('restaurants').where({ slug: restaurantSlug }).first();
        if (!restaurant) {
            console.log(`[MenuController] PublicMenu: Restaurant not found for slug: ${restaurantSlug}`);
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        // 2. Get the active menu for this restaurant.
        const menu = await knex('menus')
            .where({ restaurant_id: restaurant.id, is_active: true })
            .first();

        if (!menu) {
            console.log(`[MenuController] PublicMenu: No active menu found for restaurant ID: ${restaurant.id}`);
            return res.status(404).json({ message: 'No active menu found for this restaurant.' });
        }

        // 3. Fetch categories for this menu (visible only)
        const categories = await knex('categories')
            .where({ menu_id: menu.id, is_visible: true })
            .orderBy('display_order', 'asc');

        // 4. For each category, fetch its items (available only)
        for (let category of categories) {
            category.items = await knex('menu_items')
                .where({ category_id: category.id, is_available: true })
                .orderBy('display_order', 'asc');
        }
        menu.categories = categories;

        // 5. Fetch template data.
        // ASSUMPTION: Restaurant has an 'active_template_id' field. Adapt if different.
        let templateDetails = null;
        if (restaurant.active_template_id) {
            templateDetails = await knex('templates') // Assuming a 'templates' table
                .where({ id: restaurant.active_template_id })
                .first();
        }

        if (!templateDetails) {
            console.warn(`[MenuController] PublicMenu: No specific template found for restaurant ID: ${restaurant.id}. Providing fallback structure.`);
            // Ensure a minimal template object is passed if none found, so frontend doesn't break
            // The frontend PublicMenu.js already parses customization_settings
            templateDetails = {
                id: 'fallback-default',
                name: 'Default Fallback Template',
                customization_settings: JSON.stringify({ identifier: "default-template" }) // Stringify as frontend expects to parse
            };
        }

        // Ensure customization_settings is a string if it exists on fetched templateDetails,
        // as frontend PublicMenu.js expects to parse it.
        // If it's already an object (e.g. from JSON/JSONB db type), stringify it.
        // If it's null/undefined, the default above handles it.
        if (templateDetails && typeof templateDetails.customization_settings === 'object') {
            templateDetails.customization_settings = JSON.stringify(templateDetails.customization_settings);
        }


        // 6. Return the data
        res.status(200).json({
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                logo_path: restaurant.logo_path,
                currency_code: restaurant.currency_code
                // Add any other fields needed by public menu templates
            },
            menu: menu,
            template: templateDetails
        });

    } catch (error) {
        console.error(`[MenuController] Error fetching public menu for slug ${restaurantSlug}:`, error);
        res.status(500).json({ message: 'Error fetching public menu data', error: error.message });
    }
};

// Get menus grouped by type for a restaurant
exports.getMenusByType = async (req, res) => {
  try {
    console.log('[Menu Controller] Get menus by type for restaurant:', req.user.restaurant_id);

    const menus = await knex('menus')
      .where({ restaurant_id: req.user.restaurant_id })
      .orderBy('display_order', 'asc')
      .orderBy('created_at', 'asc');

    // Group menus by type
    const menusByType = menus.reduce((acc, menu) => {
      if (!acc[menu.menu_type]) {
        acc[menu.menu_type] = [];
      }
      acc[menu.menu_type].push(menu);
      return acc;
    }, {});

    console.log('[Menu Controller] Found menus by type:', Object.keys(menusByType));
    res.status(200).json(menusByType);
  } catch (error) {
    console.error('[Menu Controller] Error fetching menus by type:', error);
    res.status(500).json({ message: "Error fetching menus", error: error.message });
  }
};

// Get menu types and suggestions based on restaurant type
exports.getMenuTypeSuggestions = async (req, res) => {
  try {
    console.log('[Menu Controller] Get menu type suggestions for restaurant:', req.user.restaurant_id);

    // Get restaurant type
    const restaurant = await knex('restaurants')
      .where({ id: req.user.restaurant_id })
      .select('restaurant_type')
      .first();

    const restaurantType = restaurant?.restaurant_type || 'other';

    // Define menu type suggestions based on restaurant type
    const suggestions = {
      pizzeria: ['lunch', 'dinner', 'drinks'],
      cafe: ['breakfast', 'lunch', 'drinks', 'desserts'],
      fine_dining: ['lunch', 'dinner', 'wine', 'desserts'],
      burger_joint: ['all_day', 'drinks'],
      fast_food: ['all_day', 'breakfast', 'drinks'],
      bakery: ['breakfast', 'lunch', 'desserts'],
      bar_pub: ['lunch', 'dinner', 'drinks', 'appetizers'],
      other: ['breakfast', 'lunch', 'dinner', 'drinks']
    };

    const menuTypes = suggestions[restaurantType] || suggestions.other;

    res.status(200).json({
      restaurant_type: restaurantType,
      suggested_menu_types: menuTypes,
      all_menu_types: ['breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'wine', 'appetizers', 'all_day']
    });
  } catch (error) {
    console.error('[Menu Controller] Error fetching menu type suggestions:', error);
    res.status(500).json({ message: "Error fetching suggestions", error: error.message });
  }
};

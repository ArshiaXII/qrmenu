const knex = require('../db/db');

// Get all categories for a specific menu (can be hierarchical)
exports.getCategoriesByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    // Ensure the user has access to this menu
    const menu = await knex('menus').where({ id: menuId, restaurant_id: req.user.restaurant_id }).first();
    if (!menu) {
      return res.status(404).json({ message: "Menu not found or access denied." });
    }

    const categories = await knex('categories')
      .where({ menu_id: menuId })
      .orderBy('display_order', 'asc');

    // Helper to build hierarchy (same as in menuController, could be refactored to a util)
    const buildHierarchy = (list, parentId = null) => {
        const children = list.filter(cat => cat.parent_id === parentId);
        if (!children.length) return parentId === null ? [] : undefined;
        return children.map(cat => ({
            ...cat,
            subcategories: buildHierarchy(list, cat.id) || []
        }));
    };

    const hierarchicalCategories = buildHierarchy(categories);
    res.status(200).json(hierarchicalCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    console.log('[Category Controller] Create category request received');
    console.log('[Category Controller] Request body:', req.body);
    console.log('[Category Controller] User from token:', req.user);

    const { menu_id, parent_id, name, description, is_visible = true, display_order = 0, image_path } = req.body;

    // Convert FormData string values to proper types
    const processedData = {
      menu_id: parseInt(menu_id),
      parent_id: parent_id && parent_id !== '' ? parseInt(parent_id) : null,
      name: name,
      description: description || '',
      is_visible: is_visible === 'true' || is_visible === true || is_visible === 1,
      display_order: parseInt(display_order) || 0,
      image_path: req.file ? req.body.image_path : (image_path || null)
    };

    console.log('[Category Controller] Extracted fields:', { menu_id, parent_id, name, description, is_visible, display_order, image_path });
    console.log('[Category Controller] Processed data:', processedData);
    console.log('[Category Controller] Uploaded file:', req.file);

    if (!processedData.menu_id || !processedData.name) {
      console.log('[Category Controller] Validation failed: Missing menu_id or name');
      return res.status(400).json({ message: "Menu ID and category name are required." });
    }

    // Verify menu belongs to user's restaurant
    console.log('[Category Controller] Verifying menu access for menu_id:', processedData.menu_id, 'restaurant_id:', req.user.restaurant_id);
    const menu = await knex('menus').where({ id: processedData.menu_id, restaurant_id: req.user.restaurant_id }).first();
    console.log('[Category Controller] Menu verification result:', menu);

    if (!menu) {
      console.log('[Category Controller] Access denied: Menu not found or not owned by user');
      return res.status(403).json({ message: "Access to this menu is denied." });
    }

    // Check item limit if adding a category implies potential for more items
    // This logic might be better suited when adding items, but good to be mindful
    // For now, we assume category creation itself doesn't directly hit the item limit.

    console.log('[Category Controller] Inserting category with data:', {
      menu_id: processedData.menu_id,
      restaurant_id: req.user.restaurant_id,
      parent_id: processedData.parent_id,
      name: processedData.name,
      description: processedData.description,
      is_visible: processedData.is_visible,
      display_order: processedData.display_order,
      image_path: processedData.image_path,
    });

    const [newCategoryId] = await knex('categories').insert({
      menu_id: processedData.menu_id,
      restaurant_id: req.user.restaurant_id, // Required field from current schema
      parent_id: processedData.parent_id, // Already processed to be null if empty
      name: processedData.name,
      description: processedData.description,
      is_visible: processedData.is_visible, // Now properly converted to boolean
      display_order: processedData.display_order,
      image_path: processedData.image_path, // Include image path if provided
    });

    console.log('[Category Controller] Category inserted with ID:', newCategoryId);

    const newCategory = await knex('categories').where({ id: newCategoryId }).first();
    console.log('[Category Controller] Retrieved new category:', newCategory);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('[Category Controller] Error creating category:', error);
    console.error('[Category Controller] Error stack:', error.stack);
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, parent_id, is_visible, display_order, image_path } = req.body;

    // Verify category belongs to a menu of the user's restaurant
    const category = await knex('categories')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('categories.id', categoryId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('categories.*')
      .first();

    if (!category) {
      return res.status(404).json({ message: "Category not found or access denied." });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (parent_id !== undefined) updateData.parent_id = parent_id === '' ? null : parent_id; // Handle empty string for null parent
    if (is_visible !== undefined) updateData.is_visible = is_visible;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (image_path !== undefined) updateData.image_path = image_path; // Assuming image_path is directly provided for now

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }
    updateData.updated_at = knex.fn.now();

    await knex('categories').where({ id: categoryId }).update(updateData);
    const updatedCategory = await knex('categories').where({ id: categoryId }).first();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await knex('categories')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('categories.id', categoryId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('categories.id')
      .first();

    if (!category) {
      return res.status(404).json({ message: "Category not found or access denied." });
    }

    // Handle nested categories and items:
    // Option 1: Database CASCADE (defined in schema) - Simplest if schema supports it.
    // Option 2: Manually delete children items and sub-categories.
    // For this example, we assume ON DELETE CASCADE for items in category,
    // and for sub-categories, it depends on the schema (SET NULL or CASCADE).
    // If parent_id is SET NULL, subcategories become top-level, which might not be desired.
    // A recursive delete might be needed if not handled by DB.

    await knex('categories').where({ id: categoryId }).del();
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};

// Update order of categories
exports.updateCategoryOrder = async (req, res) => {
    const { menuId, orderedCategories } = req.body; // orderedCategories is an array of {id, display_order, parent_id}

    if (!menuId || !Array.isArray(orderedCategories)) {
        return res.status(400).json({ message: "Menu ID and an array of ordered categories are required." });
    }

    // Verify menu belongs to user's restaurant
    const menu = await knex('menus').where({ id: menuId, restaurant_id: req.user.restaurant_id }).first();
    if (!menu) {
      return res.status(403).json({ message: "Access to this menu is denied." });
    }

    const trx = await knex.transaction();
    try {
        for (const cat of orderedCategories) {
            await trx('categories')
                .where({ id: cat.id, menu_id: menuId }) // Ensure category belongs to the specified menu
                .update({
                    display_order: cat.display_order,
                    parent_id: cat.parent_id === undefined ? null : cat.parent_id, // Handle parent_id update
                    updated_at: knex.fn.now()
                });
        }
        await trx.commit();
        res.status(200).json({ message: "Category order updated successfully." });
    } catch (error) {
        await trx.rollback();
        res.status(500).json({ message: "Error updating category order", error: error.message });
    }
};

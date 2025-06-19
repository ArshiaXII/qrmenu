const knex = require('../db/db');

// Get all items for a specific category
exports.getItemsByCategory = async (req, res) => {
  try {
    console.log('[MenuItems Controller] Get items by category request received');
    const { categoryId } = req.params;
    console.log('[MenuItems Controller] Category ID:', categoryId);
    console.log('[MenuItems Controller] User from token:', req.user);
    console.log('[MenuItems Controller] User restaurant_id:', req.user.restaurant_id);

    // Ensure the user has access to this category via menu and restaurant
    console.log('[MenuItems Controller] Verifying category access...');
    const category = await knex('categories')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('categories.id', categoryId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('categories.id')
      .first();

    console.log('[MenuItems Controller] Category verification result:', category);

    if (!category) {
      console.log('[MenuItems Controller] Access denied: Category not found or not owned by user');
      return res.status(404).json({ message: "Category not found or access denied." });
    }

    console.log('[MenuItems Controller] Fetching items for category...');
    const items = await knex('menu_items')
      .where({ category_id: categoryId })
      .orderBy('display_order', 'asc');

    console.log('[MenuItems Controller] Items found:', items.length);
    console.log('[MenuItems Controller] Items data:', items);

    res.status(200).json(items);
  } catch (error) {
    console.error('[MenuItems Controller] Error fetching menu items:', error);
    console.error('[MenuItems Controller] Error stack:', error.stack);
    res.status(500).json({ message: "Error fetching menu items", error: error.message });
  }
};

// Create a new menu item
exports.createMenuItem = async (req, res) => {
  try {
    console.log('[MenuItems Controller] Create menu item request received');
    console.log('[MenuItems Controller] Request body:', req.body);
    console.log('[MenuItems Controller] User from token:', req.user);

    const { category_id, name, description, price, price_min, price_max, is_available = true, display_order = 0 } = req.body;

    console.log('[MenuItems Controller] Extracted fields:', { category_id, name, description, price, is_available, display_order });

    if (!category_id || !name || (price === undefined && (price_min === undefined || price_max === undefined))) {
      console.log('[MenuItems Controller] Validation failed: Missing required fields');
      return res.status(400).json({ message: "Category ID, name, and price information are required." });
    }

    // Verify category belongs to a menu of the user's restaurant
    console.log('[MenuItems Controller] Verifying category access for category_id:', category_id);
    const category = await knex('categories')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('categories.id', category_id)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('menus.restaurant_id as restaurant_id')
      .first();

    console.log('[MenuItems Controller] Category verification result:', category);

    if (!category) {
      console.log('[MenuItems Controller] Access denied: Category not found or not owned by user');
      return res.status(403).json({ message: "Access to this category is denied." });
    }

    // Check item limit
    console.log('[MenuItems Controller] Checking item limit for restaurant_id:', category.restaurant_id);
    const restaurant = await knex('restaurants').where({ id: category.restaurant_id }).first();
    console.log('[MenuItems Controller] Restaurant data:', restaurant);

    if (restaurant && restaurant.item_limit) {
      console.log('[MenuItems Controller] Checking current item count...');
      const currentItemCount = await knex('menu_items')
        .join('categories', 'menu_items.category_id', 'categories.id')
        .join('menus', 'categories.menu_id', 'menus.id')
        .where('menus.restaurant_id', category.restaurant_id)
        .count('menu_items.id as count')
        .first();

      console.log('[MenuItems Controller] Current item count:', currentItemCount);

      if (parseInt(currentItemCount.count, 10) >= restaurant.item_limit) {
        console.log('[MenuItems Controller] Item limit reached');
        return res.status(403).json({ message: `Item limit of ${restaurant.item_limit} reached for your plan.` });
      }
    } else {
      console.log('[MenuItems Controller] No item limit set for restaurant, skipping limit check');
    }

    const newItemData = {
      category_id,
      name,
      description,
      price: price !== undefined ? price : null,
      price_min: price_min !== undefined ? price_min : null,
      price_max: price_max !== undefined ? price_max : null,
      is_available,
      display_order,
    };

    console.log('[MenuItems Controller] Inserting menu item with data:', newItemData);
    const [newItemId] = await knex('menu_items').insert(newItemData);
    console.log('[MenuItems Controller] Menu item inserted with ID:', newItemId);

    const newItem = await knex('menu_items').where({ id: newItemId }).first();
    console.log('[MenuItems Controller] Retrieved new menu item:', newItem);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('[MenuItems Controller] Error creating menu item:', error);
    console.error('[MenuItems Controller] Error stack:', error.stack);
    res.status(500).json({ message: "Error creating menu item", error: error.message });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, price_min, price_max, category_id, is_available, display_order, image_path } = req.body;

    // Verify item belongs to user's restaurant
    const item = await knex('menu_items')
      .join('categories', 'menu_items.category_id', 'categories.id')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('menu_items.id', itemId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('menu_items.*')
      .first();

    if (!item) {
      return res.status(404).json({ message: "Menu item not found or access denied." });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (price_min !== undefined) updateData.price_min = price_min;
    if (price_max !== undefined) updateData.price_max = price_max;
    if (category_id !== undefined) { // If category_id is being changed, verify new category access
        const newCategory = await knex('categories')
            .join('menus', 'categories.menu_id', 'menus.id')
            .where('categories.id', category_id)
            .andWhere('menus.restaurant_id', req.user.restaurant_id)
            .first();
        if (!newCategory) return res.status(403).json({ message: "Invalid target category or access denied."});
        updateData.category_id = category_id;
    }
    if (is_available !== undefined) updateData.is_available = is_available;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (image_path !== undefined) updateData.image_path = image_path; // Assuming image_path is directly provided

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }
    updateData.updated_at = knex.fn.now();

    await knex('menu_items').where({ id: itemId }).update(updateData);
    const updatedItem = await knex('menu_items').where({ id: itemId }).first();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating menu item", error: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
     const item = await knex('menu_items')
      .join('categories', 'menu_items.category_id', 'categories.id')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('menu_items.id', itemId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .select('menu_items.id')
      .first();

    if (!item) {
      return res.status(404).json({ message: "Menu item not found or access denied." });
    }

    await knex('menu_items').where({ id: itemId }).del();
    res.status(200).json({ message: "Menu item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item", error: error.message });
  }
};

// Update order of menu items
exports.updateMenuItemOrder = async (req, res) => {
    const { categoryId, orderedItems } = req.body; // orderedItems is an array of {id, display_order}

    if (!categoryId || !Array.isArray(orderedItems)) {
        return res.status(400).json({ message: "Category ID and an array of ordered items are required." });
    }

    // Verify category belongs to user's restaurant
     const category = await knex('categories')
      .join('menus', 'categories.menu_id', 'menus.id')
      .where('categories.id', categoryId)
      .andWhere('menus.restaurant_id', req.user.restaurant_id)
      .first();
    if (!category) {
      return res.status(403).json({ message: "Access to this category is denied." });
    }

    const trx = await knex.transaction();
    try {
        for (const item of orderedItems) {
            await trx('menu_items')
                .where({ id: item.id, category_id: categoryId }) // Ensure item belongs to the specified category
                .update({
                    display_order: item.display_order,
                    updated_at: knex.fn.now()
                });
        }
        await trx.commit();
        res.status(200).json({ message: "Menu item order updated successfully." });
    } catch (error) {
        await trx.rollback();
        res.status(500).json({ message: "Error updating menu item order", error: error.message });
    }
};

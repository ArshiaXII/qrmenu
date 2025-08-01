import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../services/api';

const EnhancedMenuEditor = ({ menu, onBack, restaurantData }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState('category'); // 'category' or 'item'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'passive'

  // Mobile view state management
  const [mobileView, setMobileView] = useState('categories'); // 'categories', 'items', 'edit'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView('categories'); // Reset mobile view on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (menu) {
      fetchCategories();
    }
  }, [menu]);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/menu/${menu.id}`);
      setCategories(response.data);

      // Auto-select first category if none selected
      if (!selectedCategory && response.data.length > 0) {
        setSelectedCategory(response.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      const response = await api.get(`/menu-items/category/${categoryId}`);
      setItems(response.data);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error('Error fetching items:', err);
    }
  };



  const handleCreateItem = () => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }
    setSelectedItem(null);
    setEditMode('item');
  };

  const handleCategorySave = async (categoryData) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const response = await api.put(`/categories/${selectedCategory.id}`, categoryData);
        setCategories(categories.map(cat =>
          cat.id === selectedCategory.id ? response.data : cat
        ));
        setSelectedCategory(response.data);
      } else {
        // Create new category
        const response = await api.post('/categories', {
          ...categoryData,
          menu_id: menu.id
        });
        setCategories([...categories, response.data]);
        setSelectedCategory(response.data);
      }
    } catch (err) {
      setError('Failed to save category');
      console.error('Error saving category:', err);
    }
  };

  const handleItemSave = async (itemData) => {
    try {
      if (selectedItem) {
        // Update existing item
        const response = await api.put(`/menu-items/${selectedItem.id}`, itemData);
        setItems(items.map(item =>
          item.id === selectedItem.id ? response.data : item
        ));
        setSelectedItem(response.data);
      } else {
        // Create new item
        const response = await api.post('/menu-items', {
          ...itemData,
          category_id: selectedCategory.id
        });
        setItems([...items, response.data]);
        setSelectedItem(response.data);
      }
    } catch (err) {
      setError('Failed to save menu item');
      console.error('Error saving item:', err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.id !== categoryId));

      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
        setItems([]);
      }
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await api.delete(`/menu-items/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));

      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
      }
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting item:', err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'category') {
      const newCategories = Array.from(categories);
      const [reorderedCategory] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, reorderedCategory);

      // Update display_order for all categories
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        display_order: index
      }));

      setCategories(updatedCategories);

      // TODO: Send API request to update category order
      // api.put('/categories/order', { categories: updatedCategories });
    } else if (type === 'item') {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);

      // Update display_order for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        display_order: index
      }));

      setItems(updatedItems);

      // TODO: Send API request to update item order
      // api.put('/menu-items/order', { items: updatedItems });
    }
  };

  const filteredCategories = categories.filter(category => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return category.is_visible;
    if (filterStatus === 'passive') return !category.is_visible;
    return true;
  });

  const filteredItems = items.filter(item => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return item.is_available;
    if (filterStatus === 'passive') return !item.is_available;
    return true;
  });

  // Navigation functions (handles both mobile and desktop)
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setEditMode('category');
    if (isMobile) {
      setMobileView('items');
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setEditMode('item');
    if (isMobile) {
      setMobileView('edit');
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setSelectedItem(null);
    setEditMode('category');
    if (isMobile) {
      setMobileView('edit');
    }
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setEditMode('item');
    if (isMobile) {
      setMobileView('edit');
    }
  };

  const handleMobileBack = () => {
    if (mobileView === 'edit') {
      setMobileView(editMode === 'category' ? 'categories' : 'items');
    } else if (mobileView === 'items') {
      setMobileView('categories');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Back Button */}
            {isMobile && mobileView !== 'categories' && (
              <button
                onClick={handleMobileBack}
                className="p-2 text-gray-600 hover:text-gray-800 lg:hidden"
              >
                ← Geri
              </button>
            )}

            {/* Desktop Back Button */}
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 hidden lg:block"
            >
              ← Back to Menus
            </button>

            <h1 className="text-lg md:text-2xl font-semibold text-gray-900 truncate">
              {isMobile && mobileView === 'items' ? selectedCategory?.name :
               isMobile && mobileView === 'edit' ? (editMode === 'category' ? 'Edit Category' : 'Edit Item') :
               `Edit Menu: ${menu.name}`}
            </h1>
          </div>

          {/* Filter - Hidden on mobile edit view */}
          {(!isMobile || mobileView !== 'edit') && (
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="passive">Passive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-6 mt-4 rounded-lg">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Desktop Three-Panel Layout */}
        {!isMobile && (
          <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Categories & Filters */}
          <div className="w-1/4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Categories & Filters</h2>
                <button
                  onClick={handleCreateCategory}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                >
                  + Add
                </button>
              </div>

              <Droppable droppableId="categories" type="category">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {filteredCategories.map((category, index) => (
                      <Draggable key={category.id} draggableId={`category-${category.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedCategory?.id === category.id
                                ? 'bg-purple-100 border-purple-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            } ${snapshot.isDragging ? 'shadow-lg' : 'border'}`}
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{category.name}</h3>
                                {category.description && (
                                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  category.is_visible ? 'bg-green-400' : 'bg-gray-400'
                                }`}></span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(category.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Center Panel: Items in Selected Category */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Items in {selectedCategory ? selectedCategory.name : '[Select Category]'}
                </h2>
                <button
                  onClick={handleCreateItem}
                  disabled={!selectedCategory}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
                >
                  Add Item
                </button>
              </div>

              {selectedCategory ? (
                <Droppable droppableId="items" type="item">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {filteredItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={`item-${item.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                selectedItem?.id === item.id
                                  ? 'bg-purple-50 border-purple-300'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } ${snapshot.isDragging ? 'shadow-lg' : 'border'}`}
                              onClick={() => handleItemSelect(item)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                  <p className="text-sm font-medium text-purple-600 mt-2">
                                    {item.price ? `$${item.price}` :
                                     (item.price_min && item.price_max) ? `$${item.price_min} - $${item.price_max}` :
                                     'Price not set'}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className={`w-2 h-2 rounded-full ${
                                    item.is_available ? 'bg-green-400' : 'bg-gray-400'
                                  }`}></span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteItem(item.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a category to view its items
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Edit Form */}
          <div className="w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              {editMode === 'category' ? (
                <CategoryEditForm
                  category={selectedCategory}
                  onSave={handleCategorySave}
                  onCancel={() => setSelectedCategory(categories[0] || null)}
                />
              ) : (
                <ItemEditForm
                  item={selectedItem}
                  categoryId={selectedCategory?.id}
                  onSave={handleItemSave}
                  onCancel={() => setSelectedItem(null)}
                />
              )}
            </div>
          </div>
          </div>
        )}

        {/* Mobile Single-Column Drill-Down Layout */}
        {isMobile && (
          <div className="flex-1 overflow-hidden">
            {/* Categories View */}
            {mobileView === 'categories' && (
              <div className="h-full bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                    <button
                      onClick={handleCreateCategory}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
                    >
                      + Add Category
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className={`w-2 h-2 rounded-full ${
                              category.is_visible ? 'bg-green-400' : 'bg-gray-400'
                            }`}></span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Items View */}
            {mobileView === 'items' && selectedCategory && (
              <div className="h-full bg-white overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                    <button
                      onClick={handleNewItem}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <p className="text-sm font-medium text-purple-600 mt-2">
                              {item.price ? `$${item.price}` :
                               (item.price_min && item.price_max) ? `$${item.price_min} - $${item.price_max}` :
                               'Price not set'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className={`w-2 h-2 rounded-full ${
                              item.is_available ? 'bg-green-400' : 'bg-gray-400'
                            }`}></span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form View */}
            {mobileView === 'edit' && (
              <div className="h-full bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  {editMode === 'category' ? (
                    <CategoryEditForm
                      category={selectedCategory}
                      onSave={handleCategorySave}
                      onCancel={handleMobileBack}
                    />
                  ) : (
                    <ItemEditForm
                      item={selectedItem}
                      categoryId={selectedCategory?.id}
                      onSave={handleItemSave}
                      onCancel={handleMobileBack}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DragDropContext>
    </div>
  );
};

// Category Edit Form Component
const CategoryEditForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_visible: true,
    display_order: 0
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        is_visible: category.is_visible !== undefined ? category.is_visible : true,
        display_order: category.display_order || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_visible: true,
        display_order: 0
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {category ? 'Edit Category' : 'Create Category'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_visible"
            checked={formData.is_visible}
            onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-700">
            Visible to customers
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Item Edit Form Component (will be continued in next file due to length limit)
const ItemEditForm = ({ item, categoryId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        is_available: item.is_available !== undefined ? item.is_available : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        is_available: true
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      category_id: categoryId
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {item ? 'Edit Menu Item' : 'Create Menu Item'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_available"
            checked={formData.is_available}
            onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
            Available to customers
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedMenuEditor;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  FolderIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import Toast from '../components/Toast';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CreateItemModal from '../components/CreateItemModal';
import CategoryEditFormInline from '../components/CategoryEditFormInline';

const MenuEditorPage = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();

  // State management
  const [menu, setMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Loading states
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Error and toast states
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  // Modal states
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  useEffect(() => {
    if (menuId) {
      fetchMenuDetails();
      fetchCategories();
    }
  }, [menuId]);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory.id);
    } else {
      setItems([]);
      setSelectedItem(null);
    }
  }, [selectedCategory]);

  // Toast helper functions
  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // API calls
  const fetchMenuDetails = async () => {
    try {
      setIsLoadingMenu(true);
      console.log(`[MenuEditor] Fetching menu details for ID: ${menuId}`);

      const response = await api.get(`/menus/${menuId}`);
      console.log('[MenuEditor] Menu details:', response.data);

      setMenu(response.data);
    } catch (error) {
      console.error('[MenuEditor] Error fetching menu details:', error);
      setError('Failed to load menu details. Please try again.');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      console.log(`[MenuEditor] Fetching categories for menu ID: ${menuId}`);

      const response = await api.get(`/categories/menu/${menuId}`);
      console.log('[MenuEditor] Categories:', response.data);

      setCategories(response.data);
    } catch (error) {
      console.error('[MenuEditor] Error fetching categories:', error);
      showToast('Failed to load categories. Please try again.', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      setIsLoadingItems(true);
      console.log(`[MenuEditor] Fetching items for category ID: ${categoryId}`);

      const response = await api.get(`/menu-items/category/${categoryId}`);
      console.log('[MenuEditor] Items:', response.data);

      setItems(response.data);
    } catch (error) {
      console.error('[MenuEditor] Error fetching items:', error);
      showToast('Failed to load items. Please try again.', 'error');
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Event handlers
  const handleBackToMenus = () => {
    navigate('/dashboard/menu');
  };

  const handleCategorySelect = (category) => {
    console.log('[MenuEditor] Selected category:', category);
    setSelectedCategory(category);
    setSelectedItem(null); // Clear selected item when changing category
  };

  const handleItemSelect = (item) => {
    console.log('[MenuEditor] Selected item:', item);
    setSelectedItem(item);
  };

  // Edit category handler
  const handleEditCategory = (category) => {
    console.log('[MenuEditor] Editing category:', category);
    setSelectedCategory(category);
    setSelectedItem(null); // Clear selected item when editing category
  };

  // Create category handler
  const handleCreateCategory = async (formData) => {
    try {
      setIsCreatingCategory(true);
      console.log('[MenuEditor] Creating category:', formData);

      const response = await api.post('/categories', formData);
      console.log('[MenuEditor] Category created successfully:', response.data);

      // Close modal
      setShowCreateCategoryModal(false);

      // Show success toast
      const categoryName = formData instanceof FormData ? formData.get('name') : formData.name;
      showToast(`Category "${categoryName}" created successfully!`, 'success');

      // Refresh the categories list
      await fetchCategories();

    } catch (error) {
      console.error('[MenuEditor] Error creating category:', error);
      console.error('[MenuEditor] Error response:', error.response);
      console.error('[MenuEditor] Error status:', error.response?.status);
      console.error('[MenuEditor] Error data:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create category. Please try again.';
      showToast(errorMessage, 'error');
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Update category handler
  const handleUpdateCategory = async (categoryId, formData) => {
    try {
      setIsUpdatingCategory(true);
      console.log('[MenuEditor] Updating category:', categoryId, formData);

      const response = await api.put(`/categories/${categoryId}`, formData);
      console.log('[MenuEditor] Category updated successfully:', response.data);

      // Show success toast
      showToast(`Category "${formData.name}" updated successfully!`, 'success');

      // Refresh the categories list
      await fetchCategories();

      // Update selected category if it's the one being edited
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(response.data);
      }

    } catch (error) {
      console.error('[MenuEditor] Error updating category:', error);
      console.error('[MenuEditor] Error response:', error.response);
      console.error('[MenuEditor] Error status:', error.response?.status);
      console.error('[MenuEditor] Error data:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update category. Please try again.';
      showToast(errorMessage, 'error');
      throw error; // Re-throw so form can handle it
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Cancel category edit handler
  const handleCancelCategoryEdit = () => {
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  // Create item handler
  const handleCreateItem = async (formData) => {
    try {
      setIsCreatingItem(true);
      console.log('[MenuEditor] Creating item:', formData);

      const response = await api.post('/menu-items', formData);
      console.log('[MenuEditor] Item created successfully:', response.data);

      // Close modal
      setShowCreateItemModal(false);

      // Show success toast
      showToast(`Item "${formData.name}" added successfully!`, 'success');

      // Refresh the items list for the current category
      if (selectedCategory) {
        await fetchItems(selectedCategory.id);
      }

    } catch (error) {
      console.error('[MenuEditor] Error creating item:', error);
      console.error('[MenuEditor] Error response:', error.response);
      console.error('[MenuEditor] Error status:', error.response?.status);
      console.error('[MenuEditor] Error data:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create item. Please try again.';
      showToast(errorMessage, 'error');
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCreatingItem(false);
    }
  };

  // Loading state
  if (isLoadingMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <div className="mt-4 space-x-3">
              <button
                onClick={fetchMenuDetails}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToMenus}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Menus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={handleBackToMenus}
                className="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Menus</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="ml-3 sm:ml-6 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  <span className="hidden sm:inline">Editing: </span>{menu?.name || 'Menu'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Manage categories and items for this menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Panel Layout - Responsive */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel: Categories */}
        <div className="w-full lg:w-1/4 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
          <CategoriesPanel
            categories={categories}
            selectedCategory={selectedCategory}
            isLoading={isLoadingCategories}
            onCategorySelect={handleCategorySelect}
            onCategoryEdit={handleEditCategory}
            onRefresh={fetchCategories}
            onAddCategory={() => setShowCreateCategoryModal(true)}
            menuId={menuId}
            showToast={showToast}
          />
        </div>

        {/* Middle Panel: Items */}
        <div className="w-full lg:w-2/5 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
          <ItemsPanel
            items={items}
            selectedCategory={selectedCategory}
            selectedItem={selectedItem}
            isLoading={isLoadingItems}
            onItemSelect={handleItemSelect}
            onAddItem={() => setShowCreateItemModal(true)}
            onRefresh={() => selectedCategory && fetchItems(selectedCategory.id)}
            showToast={showToast}
          />
        </div>

        {/* Right Panel: Edit Form */}
        <div className="w-full lg:w-1/3 bg-gray-50 flex flex-col">
          <EditPanel
            selectedCategory={selectedCategory}
            selectedItem={selectedItem}
            categories={categories}
            onCategoryUpdate={handleUpdateCategory}
            onCancelCategoryEdit={handleCancelCategoryEdit}
            isUpdatingCategory={isUpdatingCategory}
            onItemUpdate={() => selectedCategory && fetchItems(selectedCategory.id)}
            showToast={showToast}
          />
        </div>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSubmit={handleCreateCategory}
        isLoading={isCreatingCategory}
        menuId={menuId}
        categories={categories}
      />

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        onSubmit={handleCreateItem}
        isLoading={isCreatingItem}
        selectedCategory={selectedCategory}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

// Categories Panel Component (Left Panel)
const CategoriesPanel = ({ categories, selectedCategory, isLoading, onCategorySelect, onCategoryEdit, onRefresh, onAddCategory, menuId, showToast }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          <button
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
            onClick={onAddCategory}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first category to organize menu items
            </p>
            <button
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              onClick={onAddCategory}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="p-2">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategory?.id === category.id}
                onSelect={() => onCategorySelect(category)}
                onEdit={onCategoryEdit}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Category Item Component
const CategoryItem = ({ category, isSelected, onSelect, onEdit, showToast }) => {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
        isSelected
          ? 'bg-purple-100 border-2 border-purple-300 shadow-md'
          : 'hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm truncate ${
            isSelected
              ? 'font-semibold text-purple-900'
              : 'font-medium text-gray-900'
          }`}>
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {category.description}
            </p>
          )}
        </div>
        <div className="ml-2 flex items-center space-x-1">
          <button
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            title="Edit Category"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
          <button
            className={`p-1 transition-colors ${
              category.is_visible
                ? 'text-green-500 hover:text-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              showToast('Toggle visibility functionality coming soon!', 'info');
            }}
            title={category.is_visible ? 'Visible' : 'Hidden'}
          >
            {category.is_visible ? (
              <EyeIcon className="h-3 w-3" />
            ) : (
              <EyeSlashIcon className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Items Panel Component (Middle Panel)
const ItemsPanel = ({ items, selectedCategory, selectedItem, isLoading, onItemSelect, onAddItem, onRefresh, showToast }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Items {selectedCategory && `in "${selectedCategory.name}"`}
          </h2>
          {selectedCategory && (
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              onClick={onAddItem}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCategory ? (
          <div className="text-center py-8 px-4">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">Select a category</h3>
            <p className="text-sm text-gray-500">
              Choose a category from the left panel to view its items
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 px-4">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No items in "{selectedCategory.name}"</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add your first item to this category to get started
            </p>
            <button
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              onClick={onAddItem}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>
        ) : (
          <div className="p-2">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onSelect={() => onItemSelect(item)}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, isSelected, onSelect, showToast }) => {
  const formatPrice = (price) => {
    return price ? `$${parseFloat(price).toFixed(2)}` : 'No price';
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
        isSelected
          ? 'bg-purple-50 border-2 border-purple-200'
          : 'hover:bg-gray-50 border-2 border-transparent'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-green-600">
              {formatPrice(item.price)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.is_available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className="ml-2 flex items-center space-x-1">
          <button
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              showToast('Edit item functionality coming soon!', 'info');
            }}
            title="Edit Item"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Panel Component (Right Panel)
const EditPanel = ({ selectedCategory, selectedItem, categories, onCategoryUpdate, onCancelCategoryEdit, isUpdatingCategory, onItemUpdate, showToast }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {selectedItem ? 'Edit Item' : selectedCategory ? 'Edit Category' : 'Edit'}
        </h2>
      </div>

      {/* Edit Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedItem ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Editing Item: {selectedItem.name}</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Item editing form will be implemented here.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Fields: Name, Description, Price, Image, Availability
              </p>
            </div>
          </div>
        ) : selectedCategory ? (
          <CategoryEditFormInline
            category={selectedCategory}
            categories={categories}
            onSubmit={onCategoryUpdate}
            onCancel={onCancelCategoryEdit}
            isLoading={isUpdatingCategory}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <PencilIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Nothing selected</h3>
            <p className="text-sm text-gray-500">
              Select a category or item to edit its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuEditorPage;

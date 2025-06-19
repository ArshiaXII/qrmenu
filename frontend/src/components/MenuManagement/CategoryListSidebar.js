import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Assuming your API service is here
// import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // For dropdowns, keep commented
// import { PlusIcon } from '@heroicons/react/24/outline'; // For Add Category button, keep commented

// Recursive component to render category tree
const CategoryTree = ({ categories, onSelectCategory, selectedCategoryId }) => {
  const primaryColor = '#8F00FF'; // Your brand color

  return (
    <ul className="space-y-1">
      {categories.map(category => (
        <li key={category.id}>
          <button
            onClick={() => onSelectCategory(category.id)}
            className={`group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              selectedCategoryId === category.id
                ? 'text-white shadow-sm'
                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
            style={selectedCategoryId === category.id ? { backgroundColor: primaryColor } : {}}
          >
            {/* Placeholder for category icon */}
            <span className="mr-2 text-base">[C]</span>
            <span className="flex-1 text-left">{category.name}</span>
            {/* Placeholder for item count or other info */}
            {category.items && <span className="text-xs opacity-70">({category.items.length})</span>}
            {category.subcategories && category.subcategories.length > 0 && (
              <span className="ml-2 text-xs">▼</span> {/* Placeholder for Chevron */}
            )}
          </button>
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="pl-4 mt-1">
              <CategoryTree
                categories={category.subcategories}
                onSelectCategory={onSelectCategory}
                selectedCategoryId={selectedCategoryId}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};


const CategoryListSidebar = ({ onSelectCategory, selectedCategoryId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'
  const [menuId, setMenuId] = useState(null); // Assuming a default menu for now

  // TODO: Fetch the user's default menu ID on component mount
  useEffect(() => {
    const fetchDefaultMenu = async () => {
      try {
        // This assumes an endpoint to get the user's menus and find a default one
        const response = await api.get('/api/menus');
        if (response.data && response.data.length > 0) {
          // For simplicity, use the first menu found as the default
          setMenuId(response.data[0].id);
        } else {
          setError("No menus found for this restaurant.");
        }
      } catch (err) {
        setError("Failed to fetch menus.");
        console.error("Failed to fetch menus:", err);
      }
    };
    fetchDefaultMenu();
  }, []); // Run only on mount

  // Fetch categories when menuId or filter changes
  useEffect(() => {
    if (menuId) {
      const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`/api/categories/menu/${menuId}`);
          let filteredCategories = response.data;

          if (filter === 'active') {
            filteredCategories = filteredCategories.filter(cat => cat.is_visible);
          } else if (filter === 'passive') {
            filteredCategories = filteredCategories.filter(cat => !cat.is_visible);
          }
          
          // Note: Filtering here only affects the top level. 
          // For full hierarchical filtering, the backend query or a recursive frontend filter is needed.
          // For now, this filters top-level categories.

          setCategories(filteredCategories);
        } catch (err) {
          setError("Failed to fetch categories.");
          console.error("Failed to fetch categories:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [menuId, filter]); // Re-fetch when menuId or filter changes

  // Handle Add Category button click (placeholder)
  const handleAddCategory = () => {
    console.log("Add Category clicked");
    // TODO: Implement logic to open a form for adding a new category
  };

  if (loading) return <div className="p-4 text-center">Loading Categories...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!menuId) return <div className="p-4 text-center text-gray-600">Select or create a menu first.</div>;


  return (
    <div className="flex h-full flex-col">
      {/* Filters */}
      <div className="mb-4 border-b border-gray-200 pb-4 dark:border-slate-700">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1 text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`rounded-md px-3 py-1 text-sm ${filter === 'active' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('passive')}
            className={`rounded-md px-3 py-1 text-sm ${filter === 'passive' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
          >
            Passive
          </button>
        </div>
      </div>

      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">Your Categories</h2>
        {categories.length > 0 ? (
          <CategoryTree
            categories={categories}
            onSelectCategory={onSelectCategory}
            selectedCategoryId={selectedCategoryId}
          />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">No categories found.</p>
        )}
      </div>

      {/* Add Category Button */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-slate-700">
        <button
          onClick={handleAddCategory}
          className="flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {/* <PlusIcon className="h-5 w-5 mr-2" /> */}
          <span className="mr-2 text-xl">+</span> {/* Placeholder */}
          Add Category
        </button>
      </div>
    </div>
  );
};

export default CategoryListSidebar;

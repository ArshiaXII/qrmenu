import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../services/api';

const MenuListingPage = ({ onEditMenu, onCreateMenu, restaurantData }) => {
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archive'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMenuData, setNewMenuData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menus');
      setMenus(response.data);

      // Auto-select the first active menu if none selected
      if (!selectedMenu && response.data.length > 0) {
        const firstActiveMenu = response.data.find(menu => menu.is_active);
        if (firstActiveMenu) {
          setSelectedMenu(firstActiveMenu);
        }
      }
    } catch (err) {
      setError('Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/menus', newMenuData);
      setMenus([...menus, response.data]);
      setNewMenuData({ name: '', description: '', is_active: true });
      setShowCreateModal(false);

      // Auto-select the newly created menu
      setSelectedMenu(response.data);

      if (onCreateMenu) {
        onCreateMenu(response.data);
      }
    } catch (err) {
      setError('Failed to create menu');
      console.error('Error creating menu:', err);
    }
  };

  const handleToggleArchive = async (menuId) => {
    try {
      const response = await api.put(`/menus/${menuId}/toggle-archive`);
      setMenus(menus.map(menu =>
        menu.id === menuId ? response.data.menu : menu
      ));

      // Update selected menu if it was the one toggled
      if (selectedMenu && selectedMenu.id === menuId) {
        setSelectedMenu(response.data.menu);
      }
    } catch (err) {
      setError('Failed to toggle menu archive status');
      console.error('Error toggling archive:', err);
    }
  };

  const handleDuplicateMenu = async (menuId) => {
    try {
      const response = await api.post(`/menus/${menuId}/duplicate`);
      setMenus([...menus, response.data.menu]);
    } catch (err) {
      setError('Failed to duplicate menu');
      console.error('Error duplicating menu:', err);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/menus/${menuId}`);
      setMenus(menus.filter(menu => menu.id !== menuId));

      // Clear selected menu if it was deleted
      if (selectedMenu && selectedMenu.id === menuId) {
        setSelectedMenu(null);
      }
    } catch (err) {
      setError('Failed to delete menu');
      console.error('Error deleting menu:', err);
    }
  };

  const getPublicMenuUrl = (menu) => {
    // Use restaurant slug from restaurantData if available
    const slug = restaurantData?.slug || 'restaurant-slug';
    return `${window.location.origin}/menu/${slug}`;
  };

  const filteredMenus = menus.filter(menu =>
    activeTab === 'active' ? menu.is_active : !menu.is_active
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          Create Menu
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'active'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Menus ({menus.filter(m => m.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'archive'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archive ({menus.filter(m => !m.is_active).length})
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="xl:col-span-2">
          {filteredMenus.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'No active menus' : 'No archived menus'}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'active'
                  ? 'Create your first menu to get started'
                  : 'No menus have been archived yet'
                }
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Menu
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMenus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  isSelected={selectedMenu?.id === menu.id}
                  onSelect={() => setSelectedMenu(menu)}
                  onEdit={() => onEditMenu && onEditMenu(menu)}
                  onToggleArchive={() => handleToggleArchive(menu.id)}
                  onDuplicate={() => handleDuplicateMenu(menu.id)}
                  onDelete={() => handleDeleteMenu(menu.id)}
                  publicUrl={getPublicMenuUrl(menu)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Menu Preview */}
        <div className="xl:col-span-1">
          {selectedMenu && (
            <SelectedMenuCard
              menu={selectedMenu}
              publicUrl={getPublicMenuUrl(selectedMenu)}
              onEdit={() => onEditMenu && onEditMenu(selectedMenu)}
            />
          )}
        </div>
      </div>

      {/* Create Menu Modal */}
      {showCreateModal && (
        <CreateMenuModal
          newMenuData={newMenuData}
          setNewMenuData={setNewMenuData}
          onSubmit={handleCreateMenu}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// Menu Card Component
const MenuCard = ({ menu, isSelected, onSelect, onEdit, onToggleArchive, onDuplicate, onDelete, publicUrl }) => {
  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
        isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 space-y-3 md:space-y-0">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
          {menu.description && (
            <p className="text-gray-600 text-sm mt-1">{menu.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:space-x-2 md:flex-nowrap">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleArchive(); }}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-2 py-1 rounded hover:bg-yellow-50 transition-colors"
          >
            {menu.is_active ? 'Archive' : 'Activate'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          menu.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {menu.is_active ? 'Active' : 'Archived'}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); window.open(publicUrl, '_blank'); }}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

// Selected Menu Card Component (Right Sidebar)
const SelectedMenuCard = ({ menu, publicUrl, onEdit }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your digital menu is ready!</h3>
        <p className="text-gray-600 text-sm mb-4">
          Scan the QR code or use the link to view your brand new menu.
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCodeCanvas
              value={publicUrl}
              size={120}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.open(publicUrl, '_blank')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Preview
          </button>

          <button
            onClick={onEdit}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Edit Menu
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Menu: <span className="font-medium">{menu.name}</span>
          </p>
          <p className="text-xs text-gray-500">
            Status: <span className={`font-medium ${menu.is_active ? 'text-green-600' : 'text-gray-600'}`}>
              {menu.is_active ? 'Active' : 'Archived'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Create Menu Modal Component
const CreateMenuModal = ({ newMenuData, setNewMenuData, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Menu</h2>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Name *
              </label>
              <input
                type="text"
                value={newMenuData.name}
                onChange={(e) => setNewMenuData({...newMenuData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Main Menu, Lunch Menu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newMenuData.description}
                onChange={(e) => setNewMenuData({...newMenuData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional description"
                rows="3"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={newMenuData.is_active}
                onChange={(e) => setNewMenuData({...newMenuData, is_active: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Make this menu active
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Create Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuListingPage;

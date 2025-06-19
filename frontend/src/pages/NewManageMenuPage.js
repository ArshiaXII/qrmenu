import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FolderIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import CreateMenuModal from '../components/CreateMenuModal';
import Toast from '../components/Toast';

const NewManageMenuPage = () => {
  const navigate = useNavigate();
  const [allMenus, setAllMenus] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and Toast states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  useEffect(() => {
    fetchMenus();
  }, [activeTab]); // Refetch when tab changes

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === 'active') {
        console.log('[NewManageMenuPage] Fetching active menus from /api/menus?is_active=true');
        const response = await api.get('/menus?is_active=true');
        console.log('[NewManageMenuPage] Received active menus:', response.data);
        setAllMenus(response.data);
      } else {
        console.log('[NewManageMenuPage] Fetching archived menus from /api/menus?is_active=false');
        const response = await api.get('/menus?is_active=false');
        console.log('[NewManageMenuPage] Received archived menus:', response.data);
        setAllMenus(response.data);
      }
    } catch (err) {
      console.error('[NewManageMenuPage] Error fetching menus:', err);
      setError('Failed to fetch menus. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Since we're fetching filtered data, no need to filter again
  const filteredMenus = allMenus;

  // For tab counts, we'll need to fetch both counts separately or show current count
  const currentMenusCount = allMenus.length;

  // Toast helper function
  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Create menu handler
  const handleCreateMenu = async (formData) => {
    try {
      setIsCreatingMenu(true);
      console.log('[NewManageMenuPage] Creating menu:', formData);

      const response = await api.post('/menus', formData);
      console.log('[NewManageMenuPage] Menu created successfully:', response.data);

      // Close modal
      setShowCreateModal(false);

      // Show success toast
      showToast(`Menu "${formData.name}" created successfully!`, 'success');

      // Refresh the menu list
      await fetchMenus();

    } catch (error) {
      console.error('[NewManageMenuPage] Error creating menu:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create menu. Please try again.';
      showToast(errorMessage, 'error');
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCreatingMenu(false);
    }
  };

  // Archive/Unarchive menu handler
  const handleToggleArchive = async (menuId, currentStatus) => {
    try {
      const action = currentStatus ? 'archive' : 'unarchive';
      console.log(`[NewManageMenuPage] ${action} menu:`, menuId);

      const response = await api.put(`/menus/${menuId}/${action}`);
      console.log(`[NewManageMenuPage] Menu ${action}d successfully:`, response.data);

      showToast(response.data.message || `Menu ${action}d successfully!`, 'success');

      // Refresh the menu list
      await fetchMenus();

    } catch (error) {
      console.error('[NewManageMenuPage] Error toggling archive status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update menu status. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  // Delete menu handler
  const handleDeleteMenu = async (menuId, menuName) => {
    if (!window.confirm(`Are you sure you want to delete "${menuName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('[NewManageMenuPage] Deleting menu:', menuId);

      const response = await api.delete(`/menus/${menuId}`);
      console.log('[NewManageMenuPage] Menu deleted successfully:', response.data);

      showToast(`Menu "${menuName}" deleted successfully!`, 'success');

      // Refresh the menu list
      await fetchMenus();

    } catch (error) {
      console.error('[NewManageMenuPage] Error deleting menu:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete menu. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  // Edit menu handler - navigate to editor
  const handleEditMenu = (menuId) => {
    console.log('Navigating to edit menu:', menuId);
    navigate(`/dashboard/menu/${menuId}/edit`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMenus}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="mt-2 text-gray-600">Create, organize, and manage your digital menus</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard/menu/create')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                ✨ Create with Wizard
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Quick Create
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <FolderIcon className="h-5 w-5 mr-2" />
                  Active Menus {activeTab === 'active' ? `(${currentMenusCount})` : ''}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'archived'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                  Archived {activeTab === 'archived' ? `(${currentMenusCount})` : ''}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'active' ? 'Active Menus' : 'Archived Menus'}
            </h2>
          </div>

          <div className="p-6">
            {filteredMenus.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'active' ? (
                    <FolderIcon className="mx-auto h-12 w-12" />
                  ) : (
                    <ArchiveBoxIcon className="mx-auto h-12 w-12" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'active' ? 'No active menus yet' : 'No archived menus'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'active'
                    ? 'Create your first digital menu to get started'
                    : 'Archived menus will appear here when you archive them'
                  }
                </p>
                {activeTab === 'active' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Menu
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMenus.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    onEdit={handleEditMenu}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteMenu}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Menu Modal */}
        <CreateMenuModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMenu}
          isLoading={isCreatingMenu}
        />

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </div>
  );
};

// MenuCard Component
const MenuCard = ({ menu, onEdit, onToggleArchive, onDelete }) => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchMenuStats();
  }, [menu.id]);

  const fetchMenuStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get(`/menus/${menu.id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error(`[MenuCard] Error fetching stats for menu ${menu.id}:`, error);
      setStats({ categories: 0, items: 0 }); // Fallback
    } finally {
      setLoadingStats(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Menu Name and Description */}
          <h3 className="text-xl font-semibold text-gray-900 truncate">{menu.name}</h3>
          {menu.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{menu.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-1" />
              <span>
                {loadingStats ? '...' : `${stats?.categories || 0} Categories`}
              </span>
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              <span>
                {loadingStats ? '...' : `${stats?.items || 0} Items`}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs">
                Updated {formatDate(menu.updated_at || menu.created_at)}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              menu.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {menu.is_active ? 'Active' : 'Archived'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-6 flex items-center space-x-2">
          <button
            onClick={() => onEdit(menu.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Menu"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>

          <button
            onClick={() => onToggleArchive(menu.id, menu.is_active)}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              menu.is_active
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }`}
            title={menu.is_active ? 'Archive Menu' : 'Unarchive Menu'}
          >
            {menu.is_active ? (
              <>
                <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                Archive
              </>
            ) : (
              <>
                <ArrowUturnUpIcon className="h-4 w-4 mr-1" />
                Unarchive
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(menu.id, menu.name)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Menu"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewManageMenuPage;

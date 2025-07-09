import React, { createContext, useContext, useReducer, useCallback } from 'react';
import menuService from '../services/menuService';

// Initial state
const initialState = {
  currentMenu: null,
  currentRestaurant: null,
  currentBranding: null,
  isLoading: false,
  error: null,
  menuStatus: 'draft' // 'active' or 'draft'
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MENU_DATA: 'SET_MENU_DATA',
  SET_RESTAURANT_DATA: 'SET_RESTAURANT_DATA',
  SET_BRANDING_DATA: 'SET_BRANDING_DATA',
  SET_MENU_STATUS: 'SET_MENU_STATUS',
  UPDATE_SECTION: 'UPDATE_SECTION',
  UPDATE_ITEM: 'UPDATE_ITEM',
  CLEAR_DATA: 'CLEAR_DATA'
};

// Reducer
function menuReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ActionTypes.SET_MENU_DATA:
      return {
        ...state,
        currentMenu: action.payload,
        isLoading: false,
        error: null
      };

    case ActionTypes.SET_RESTAURANT_DATA:
      return {
        ...state,
        currentRestaurant: action.payload,
        menuStatus: action.payload?.isActive ? 'active' : 'draft',
        isLoading: false,
        error: null
      };

    case ActionTypes.SET_BRANDING_DATA:
      return {
        ...state,
        currentBranding: action.payload,
        isLoading: false,
        error: null
      };

    case ActionTypes.SET_MENU_STATUS:
      return {
        ...state,
        menuStatus: action.payload,
        currentRestaurant: state.currentRestaurant ? {
          ...state.currentRestaurant,
          isActive: action.payload === 'active'
        } : null
      };

    case ActionTypes.UPDATE_SECTION:
      if (!state.currentMenu) return state;
      return {
        ...state,
        currentMenu: {
          ...state.currentMenu,
          sections: state.currentMenu.sections.map(section =>
            section.id === action.payload.id ? { ...section, ...action.payload.updates } : section
          )
        }
      };

    case ActionTypes.UPDATE_ITEM:
      if (!state.currentMenu) return state;
      return {
        ...state,
        currentMenu: {
          ...state.currentMenu,
          sections: state.currentMenu.sections.map(section => ({
            ...section,
            items: section.items.map(item =>
              item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
            )
          }))
        }
      };

    case ActionTypes.CLEAR_DATA:
      return initialState;

    default:
      return state;
  }
}

// Create context
const MenuContext = createContext();

// Provider component
export function MenuProvider({ children }) {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Load public menu data
  const loadPublicMenuData = useCallback(async (restaurantSlug) => {
    console.log('🔍 [MenuContext] loadPublicMenuData called with slug:', restaurantSlug);
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const data = await menuService.getPublicMenuData(restaurantSlug);
      console.log('✅ [MenuContext] Received public menu data:', data);

      if (data) {
        // Create restaurant object using correct data structure
        const restaurant = {
          id: data.userId || data.id,
          name: data.name,
          slug: data.slug,
          address: data.address,
          phone: data.phone,
          hours: data.hours,
          isActive: data.isActive
        };

        // FIXED: Use actual branding data instead of hardcoded values
        const branding = data.branding || {
          colors: {
            accentColor: '#8b5cf6',
            textColor: '#1f2937',
            backgroundColor: '#ffffff'
          },
          primaryColor: '#8b5cf6',
          secondaryColor: '#7c3aed',
          fontFamily: 'Inter'
        };

        console.log('🔍 [MenuContext] Setting restaurant data:', restaurant);
        console.log('🔍 [MenuContext] Setting branding data:', branding);
        console.log('🔍 [MenuContext] Setting menu data:', data.menu);

        dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: restaurant });
        dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: branding });
        dispatch({ type: ActionTypes.SET_MENU_DATA, payload: data.menu });

        return { restaurant, branding, menu: data.menu };
      } else {
        throw new Error('RESTAURANT_NOT_FOUND');
      }
    } catch (error) {
      console.error('❌ [MenuContext] Error in loadPublicMenuData:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Load preview menu data (bypasses active status check)
  const loadPreviewMenuData = useCallback(async (restaurantSlug) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const data = await menuService.getPreviewMenuData(restaurantSlug);

      if (data) {
        console.log('🔍 [MenuContext] Processing preview menu data:', data);

        // FIXED: Create restaurant object using correct data structure
        const restaurant = {
          id: data.restaurant?.id || data.userId,
          name: data.restaurant?.name || data.name,
          slug: data.restaurant?.slug || data.slug,
          address: data.restaurant?.address || data.address,
          phone: data.restaurant?.phone || data.phone,
          hours: data.restaurant?.hours || data.hours,
          isActive: data.restaurant?.isActive || false
        };

        // FIXED: Use actual branding data instead of hardcoded values
        const branding = data.branding || {
          colors: {
            accentColor: '#8b5cf6',
            textColor: '#1f2937',
            backgroundColor: '#ffffff'
          },
          primaryColor: '#8b5cf6',
          secondaryColor: '#7c3aed',
          fontFamily: 'Inter'
        };

        console.log('🔍 [MenuContext] Setting preview restaurant data:', restaurant);
        console.log('🔍 [MenuContext] Setting preview branding data:', branding);
        console.log('🔍 [MenuContext] Setting preview menu data:', data.menu);

        dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: restaurant });
        dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: branding });
        dispatch({ type: ActionTypes.SET_MENU_DATA, payload: data.menu });

        return { restaurant, branding, menu: data.menu };
      } else {
        throw new Error('RESTAURANT_NOT_FOUND');
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Load dashboard menu data (authenticated)
  const loadDashboardMenuData = useCallback(async () => {
    console.log('🔍 MenuContext.loadDashboardMenuData called');

    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      // Get current user's restaurant data using simplified service
      const restaurantData = menuService.getCurrentUserRestaurant();

      if (restaurantData) {
        console.log('🔍 MenuContext received restaurant data:', restaurantData);

        // Create restaurant object for context
        const restaurant = {
          id: restaurantData.userId,
          name: restaurantData.name,
          slug: restaurantData.slug,
          address: restaurantData.address,
          phone: restaurantData.phone,
          hours: restaurantData.hours,
          isActive: restaurantData.isActive === true
        };

        // Use actual branding data or create default
        const branding = restaurantData.branding || {
          colors: {
            accentColor: '#8b5cf6',
            textColor: '#1f2937',
            backgroundColor: '#ffffff'
          },
          primaryColor: '#8b5cf6',
          secondaryColor: '#7c3aed',
          fontFamily: 'Inter'
        };

        dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: restaurant });
        dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: branding });
        dispatch({ type: ActionTypes.SET_MENU_DATA, payload: restaurantData.menu });
        dispatch({ type: ActionTypes.SET_MENU_STATUS, payload: restaurantData.isActive ? 'active' : 'draft' });

        console.log('✅ MenuContext loaded dashboard data successfully');
        return { restaurant, branding, menu: restaurantData.menu };
      } else {
        console.log('⚠️ No restaurant data found, creating default');

        // Create default data structure
        const defaultRestaurant = {
          id: null,
          name: 'Yeni Restaurant',
          slug: 'new-restaurant',
          address: 'İstanbul, Türkiye',
          phone: '+90 212 555 0123',
          hours: '09:00 - 23:00',
          isActive: false
        };

        const defaultBranding = {
          primaryColor: '#8b5cf6',
          secondaryColor: '#7c3aed',
          fontFamily: 'Inter'
        };

        const defaultMenu = {
          sections: [
            {
              id: 'section-1',
              name: 'Ana Yemekler',
              items: [
                {
                  id: 'item-1',
                  name: 'Örnek Ürün',
                  description: 'Lezzetli örnek ürün açıklaması',
                  price: 25.00
                }
              ]
            }
          ]
        };

        dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: defaultRestaurant });
        dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: defaultBranding });
        dispatch({ type: ActionTypes.SET_MENU_DATA, payload: defaultMenu });
        dispatch({ type: ActionTypes.SET_MENU_STATUS, payload: 'draft' });

        return { restaurant: defaultRestaurant, branding: defaultBranding, menu: defaultMenu };
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard menu data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Save menu content - FIXED to use bulletproof function
  const saveMenuContent = useCallback(async (menuData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      console.log('Data saved successfully:', menuData);

      // Get current restaurant slug
      const slug = menuService.getCurrentUserRestaurantSlug();
      if (!slug) {
        throw new Error("No active restaurant slug to save menu for.");
      }

      // FIXED: Use the new bulletproof centralized save function
      const result = await menuService.saveOrUpdateRestaurantData(slug, { menu: menuData });

      // Update local state
      dispatch({ type: ActionTypes.SET_MENU_DATA, payload: menuData });

      return result;
    } catch (error) {
      console.error('Error saving menu content:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Save design customization - FIXED to use bulletproof function
  const saveDesignCustomization = useCallback(async (brandingData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      console.log('Design data saved successfully:', brandingData);

      // Get current restaurant slug
      const slug = menuService.getCurrentUserRestaurantSlug();
      if (!slug) {
        throw new Error("No active restaurant slug to save design for.");
      }

      // FIXED: Use the new bulletproof centralized save function
      const result = await menuService.saveOrUpdateRestaurantData(slug, { branding: brandingData });

      // Update local state
      dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: brandingData });

      return result;
    } catch (error) {
      console.error('Error saving design customization:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Update menu status
  const updateMenuStatus = useCallback(async (status) => {
    console.log('🔄 [MenuContext] updateMenuStatus called with status:', status);

    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      // Convert status to boolean for menuService
      const isActive = status === 'active';

      // Get current user's restaurant slug
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const restaurantSlug = currentUser.restaurantSlug || state.currentRestaurant?.slug;

      console.log('🔄 [MenuContext] Using restaurant slug:', restaurantSlug);
      console.log('🔄 [MenuContext] Setting isActive to:', isActive);

      const result = await menuService.updateMenuStatus(restaurantSlug, isActive);
      console.log('✅ [MenuContext] menuService.updateMenuStatus result:', result);

      dispatch({ type: ActionTypes.SET_MENU_STATUS, payload: status });

      // Also update the restaurant's isActive property
      dispatch({
        type: ActionTypes.SET_RESTAURANT_DATA,
        payload: {
          ...state.currentRestaurant,
          isActive: status === 'active'
        }
      });

      return result;
    } catch (error) {
      console.error('❌ [MenuContext] Error updating menu status:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.currentRestaurant]);

  // Save restaurant settings (simplified - components should call menuService directly)
  const saveRestaurantSettings = useCallback(async (name, address, phone, hours) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.saveRestaurantSettings(name, address, phone, hours);

      // Update local restaurant state
      const updatedRestaurant = {
        ...state.currentRestaurant,
        name: result.name,
        slug: result.slug,
        address: result.address,
        phone: result.phone,
        hours: result.hours
      };

      dispatch({
        type: ActionTypes.SET_RESTAURANT_DATA,
        payload: updatedRestaurant
      });

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.currentRestaurant]);

  // Update section
  const updateSection = useCallback((sectionId, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_SECTION,
      payload: { id: sectionId, updates }
    });
  }, []);

  // Update item
  const updateItem = useCallback((itemId, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_ITEM,
      payload: { id: itemId, updates }
    });
  }, []);

  // Check restaurant name uniqueness
  const checkRestaurantNameUnique = useCallback(async (name, excludeSlug = null) => {
    try {
      return await menuService.checkRestaurantNameUnique(name, excludeSlug);
    } catch (error) {
      console.error('Error checking restaurant name uniqueness:', error);
      return false;
    }
  }, []);

  // Update restaurant name with validation
  const updateRestaurantName = useCallback(async (newName) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.updateRestaurantName(newName);

      // Update local restaurant state
      if (state.currentRestaurant) {
        dispatch({
          type: ActionTypes.SET_RESTAURANT_DATA,
          payload: {
            ...state.currentRestaurant,
            name: newName
          }
        });
      }

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [state.currentRestaurant]);

  // Clear all data (useful for logout)
  const clearData = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_DATA });
  }, []);

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    loadPublicMenuData,
    loadPreviewMenuData,
    loadDashboardMenuData,
    saveMenuContent,
    saveDesignCustomization,
    updateMenuStatus,
    saveRestaurantSettings,
    updateSection,
    updateItem,
    checkRestaurantNameUnique,
    updateRestaurantName,
    clearData
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

// Custom hook to use menu context
export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}

export default MenuContext;

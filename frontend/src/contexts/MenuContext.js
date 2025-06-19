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
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const data = await menuService.getPublicMenuData(restaurantSlug);

      dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: data.restaurant });
      dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: data.branding });
      dispatch({ type: ActionTypes.SET_MENU_DATA, payload: data.menu });

      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Load preview menu data (bypasses active status check)
  const loadPreviewMenuData = useCallback(async (restaurantSlug) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const data = await menuService.getPreviewMenuData(restaurantSlug);

      dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: data.restaurant });
      dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: data.branding });
      dispatch({ type: ActionTypes.SET_MENU_DATA, payload: data.menu });

      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Load dashboard menu data (authenticated)
  const loadDashboardMenuData = useCallback(async (restaurantSlug = 'lezzet-restaurant') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const data = await menuService.getMenuData(restaurantSlug);

      dispatch({ type: ActionTypes.SET_RESTAURANT_DATA, payload: data.restaurant });
      dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: data.branding });
      dispatch({ type: ActionTypes.SET_MENU_DATA, payload: data.menu });

      return data;
    } catch (error) {
      console.error('Failed to load dashboard menu data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });

      // Don't throw the error, just continue with empty state
      // This prevents the app from crashing
      return null;
    }
  }, []);

  // Save menu content
  const saveMenuContent = useCallback(async (menuData, restaurantSlug = 'lezzet-restaurant') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.saveMenuContent(restaurantSlug, menuData);

      dispatch({ type: ActionTypes.SET_MENU_DATA, payload: menuData });

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Save design customization
  const saveDesignCustomization = useCallback(async (brandingData, restaurantSlug = 'lezzet-restaurant') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.saveDesignCustomization(restaurantSlug, brandingData);

      dispatch({ type: ActionTypes.SET_BRANDING_DATA, payload: brandingData });

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Update menu status
  const updateMenuStatus = useCallback(async (isActive, restaurantSlug = 'lezzet-restaurant') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.updateMenuStatus(restaurantSlug, isActive);

      const newStatus = isActive ? 'active' : 'draft';
      dispatch({ type: ActionTypes.SET_MENU_STATUS, payload: newStatus });

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Save restaurant settings
  const saveRestaurantSettings = useCallback(async (settings, restaurantSlug = 'lezzet-restaurant') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const result = await menuService.saveRestaurantSettings(restaurantSlug, settings);

      // Update local restaurant state
      if (state.currentRestaurant) {
        dispatch({
          type: ActionTypes.SET_RESTAURANT_DATA,
          payload: {
            ...state.currentRestaurant,
            currency: settings.currency,
            socialMedia: settings.socialMedia
          }
        });
      }

      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
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

  // Clear all data
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

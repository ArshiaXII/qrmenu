// Menu Service - Handles all menu-related API calls and data management
class MenuService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.menuCache = new Map(); // Simple caching mechanism
    this.initializeStorage();
  }

  // Get current user's restaurant slug from auth context
  getCurrentUserRestaurantSlug() {
    console.log('🔍 Getting current user restaurant slug...');
    try {
      const authUser = localStorage.getItem('authUser');
      console.log('🔍 Raw authUser from localStorage:', authUser);

      if (authUser) {
        const user = JSON.parse(authUser);
        console.log('🔍 Parsed user object:', user);
        console.log('🔍 User restaurant_id:', user.restaurant_id);

        if (user.restaurant_id) {
          // For now, we'll use a simple mapping. In production, this would come from the backend
          const slug = `restaurant-${user.restaurant_id}`;
          console.log('🔍 Generated restaurant slug:', slug);
          return slug;
        } else {
          console.warn('⚠️ User has no restaurant_id');
        }
      } else {
        console.warn('⚠️ No authUser found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error getting user restaurant slug:', error);
    }
    console.log('🔍 Returning null - no valid restaurant slug found');
    return null;
  }

  // Check if user has a restaurant
  hasUserRestaurant() {
    return this.getCurrentUserRestaurantSlug() !== null;
  }

  // Initialize localStorage with empty structure if not exists
  initializeStorage() {
    const storageKey = 'qr_menu_data';
    if (!localStorage.getItem(storageKey)) {
      console.log('🔍 Initializing empty storage structure');
      const defaultData = {
        restaurants: {}  // Start with empty restaurants object - each user will create their own
      };
      localStorage.setItem(storageKey, JSON.stringify(defaultData));
      console.log('✅ Empty storage structure initialized');
    } else {
      console.log('🔍 Storage already exists, skipping initialization');
    }
  }

  // Get data from localStorage
  getStorageData() {
    const data = localStorage.getItem('qr_menu_data');
    return data ? JSON.parse(data) : { restaurants: {} };
  }

  // Save data to localStorage
  saveStorageData(data) {
    localStorage.setItem('qr_menu_data', JSON.stringify(data));
  }

  // Clear all storage data (for testing/debugging)
  clearStorageData() {
    console.log('🔍 Clearing all storage data');
    localStorage.removeItem('qr_menu_data');
    this.initializeStorage(); // Reinitialize with empty structure
    console.log('✅ Storage cleared and reinitialized');
  }

  // Get public menu data for a specific restaurant
  async getPublicMenuData(restaurantSlug) {
    try {
      console.log('🔍 [menuService] getPublicMenuData called with slug:', restaurantSlug);

      // For development, use localStorage. In production, this would be a real API call
      const storageData = this.getStorageData();
      console.log('🔍 [menuService] Available restaurant slugs:', Object.keys(storageData.restaurants));

      const restaurantData = storageData.restaurants[restaurantSlug];
      console.log('🔍 [menuService] Found restaurant data:', !!restaurantData);

      if (!restaurantData) {
        console.error('❌ [menuService] Restaurant not found for slug:', restaurantSlug);
        throw new Error('RESTAURANT_NOT_FOUND');
      }

      console.log('🔍 [menuService] Restaurant isActive:', restaurantData.restaurant.isActive);
      console.log('🔍 [menuService] Full restaurant data:', restaurantData.restaurant);

      if (!restaurantData.restaurant.isActive) {
        console.error('❌ [menuService] Menu is inactive for slug:', restaurantSlug);
        throw new Error('MENU_INACTIVE');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ [menuService] Returning active menu data for slug:', restaurantSlug);
      return restaurantData;
    } catch (error) {
      console.error('❌ [menuService] Error fetching public menu data:', error);
      throw error;
    }
  }

  // Get menu data for preview (bypasses active status check)
  async getPreviewMenuData(restaurantSlug) {
    try {
      // For development, use localStorage. In production, this would be a real API call
      const storageData = this.getStorageData();
      const restaurantData = storageData.restaurants[restaurantSlug];

      if (!restaurantData) {
        throw new Error('RESTAURANT_NOT_FOUND');
      }

      // No active status check for preview - allow viewing draft menus

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return restaurantData;
    } catch (error) {
      console.error('Error fetching preview menu data:', error);
      throw error;
    }
  }

  // Get menu data for dashboard (authenticated)
  async getMenuData(restaurantSlug = null) {
    console.log('🔍 menuService.getMenuData called with slug:', restaurantSlug);

    try {
      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();
      console.log('🔍 Target slug determined:', targetSlug);

      if (!targetSlug) {
        console.error('❌ No target slug - USER_NO_RESTAURANT');
        throw new Error('USER_NO_RESTAURANT');
      }

      // For development, use localStorage. In production, this would be a real API call
      const storageData = this.getStorageData();
      console.log('🔍 All storage data keys:', Object.keys(storageData.restaurants));

      let restaurantData = storageData.restaurants[targetSlug];
      console.log('🔍 Restaurant data found for slug:', targetSlug, !!restaurantData);

      // If restaurant not found, create it with default data for the user
      if (!restaurantData) {
        console.log('🔍 Creating default restaurant data for:', targetSlug);
        restaurantData = this.createDefaultRestaurantData(targetSlug);
        storageData.restaurants[targetSlug] = restaurantData;
        this.saveStorageData(storageData);
        console.log('🔍 Default data created and saved');
      }

      console.log('🔍 Final restaurant data to return:', restaurantData);
      console.log('🔍 Menu sections in data:', restaurantData?.menu?.sections?.length || 0);
      console.log('🔍 Menu sections detail:', restaurantData?.menu?.sections);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return restaurantData;
    } catch (error) {
      console.error('❌ Error fetching menu data:', error);
      throw error;
    }
  }

  // Create default restaurant data
  createDefaultRestaurantData(slug) {
    return {
      restaurant: {
        id: Date.now(),
        name: 'Yeni Restaurant',
        slug: slug,
        address: 'İstanbul, Türkiye',
        phone: '+90 212 555 0123',
        hours: '09:00 - 23:00',
        isActive: false
      },
      branding: {
        logo: null,
        colors: {
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          accentColor: '#8b5cf6'
        }
      },
      menu: {
        sections: [
          {
            id: 'section-1',
            title: 'Başlangıçlar',
            description: 'Lezzetli başlangıç yemekleri',
            image: null,
            order: 1,
            items: [
              {
                id: 'item-1',
                title: 'Örnek Ürün',
                description: 'Ürün açıklaması buraya gelecek',
                price: '25.00',
                image: null,
                order: 1,
                isAvailable: true
              }
            ]
          }
        ]
      }
    };
  }

  // Save menu content
  async saveMenuContent(restaurantSlug = null, menuData) {
    console.log('🔍 menuService.saveMenuContent called');
    console.log('🔍 Input slug:', restaurantSlug);
    console.log('🔍 Menu data to save:', menuData);

    try {
      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();
      console.log('🔍 Target slug for saving:', targetSlug);

      if (!targetSlug) {
        console.error('❌ No target slug for saving - USER_NO_RESTAURANT');
        throw new Error('USER_NO_RESTAURANT');
      }

      const storageData = this.getStorageData();
      console.log('🔍 Current storage restaurants:', Object.keys(storageData.restaurants));

      if (!storageData.restaurants[targetSlug]) {
        console.error('❌ Restaurant not found for slug:', targetSlug);
        throw new Error('Restaurant not found');
      }

      console.log('🔍 Updating menu data for restaurant:', targetSlug);
      console.log('🔍 Previous menu data:', storageData.restaurants[targetSlug].menu);

      // Update menu data
      storageData.restaurants[targetSlug].menu = menuData;

      console.log('🔍 New menu data set:', storageData.restaurants[targetSlug].menu);

      // Save to localStorage
      this.saveStorageData(storageData);
      console.log('✅ Menu data saved to localStorage');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Menu content saved successfully' };
    } catch (error) {
      console.error('❌ Error saving menu content:', error);
      throw error;
    }
  }

  // Save design customization
  async saveDesignCustomization(restaurantSlug = null, designData) {
    try {
      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();

      if (!targetSlug) {
        throw new Error('USER_NO_RESTAURANT');
      }

      const storageData = this.getStorageData();

      if (!storageData.restaurants[targetSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update branding data
      storageData.restaurants[targetSlug].branding = designData;

      // Save to localStorage
      this.saveStorageData(storageData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Design customization saved successfully' };
    } catch (error) {
      console.error('Error saving design customization:', error);
      throw error;
    }
  }

  // Update menu status (active/inactive)
  async updateMenuStatus(restaurantSlug = null, isActive) {
    try {
      console.log('🔄 [menuService] updateMenuStatus called');
      console.log('🔄 [menuService] restaurantSlug:', restaurantSlug);
      console.log('🔄 [menuService] isActive:', isActive);

      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();
      console.log('🔄 [menuService] targetSlug (final):', targetSlug);

      if (!targetSlug) {
        console.error('❌ [menuService] No restaurant slug available');
        throw new Error('USER_NO_RESTAURANT');
      }

      const storageData = this.getStorageData();
      console.log('🔄 [menuService] Current storage data:', storageData);

      if (!storageData.restaurants[targetSlug]) {
        console.error('❌ [menuService] Restaurant not found in storage:', targetSlug);
        console.log('🔄 [menuService] Available restaurants:', Object.keys(storageData.restaurants));
        throw new Error('Restaurant not found');
      }

      console.log('🔄 [menuService] Current restaurant data before update:', storageData.restaurants[targetSlug].restaurant);

      // Update restaurant status
      storageData.restaurants[targetSlug].restaurant.isActive = isActive;
      console.log('🔄 [menuService] Updated restaurant data:', storageData.restaurants[targetSlug].restaurant);

      // Save to localStorage
      this.saveStorageData(storageData);
      console.log('✅ [menuService] Data saved to localStorage');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = { success: true, message: 'Menu status updated successfully', isActive };
      console.log('✅ [menuService] Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ [menuService] Error updating menu status:', error);
      throw error;
    }
  }

  // Save restaurant settings (currency, social media)
  async saveRestaurantSettings(restaurantSlug = null, settings) {
    try {
      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();

      if (!targetSlug) {
        throw new Error('USER_NO_RESTAURANT');
      }

      const storageData = this.getStorageData();

      if (!storageData.restaurants[targetSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update restaurant settings
      storageData.restaurants[targetSlug].restaurant.currency = settings.currency;
      storageData.restaurants[targetSlug].restaurant.socialMedia = settings.socialMedia;

      // Save to localStorage
      this.saveStorageData(storageData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Restaurant settings saved successfully' };
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      throw error;
    }
  }

  // Upload image (logo, section image, item image)
  async uploadImage(file, type = 'general') {
    try {
      // Create a data URL for the image (for development purposes)
      const dataUrl = await this.fileToDataUrl(file);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = {
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: dataUrl,
        fileName: file.name
      };

      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Helper function to convert file to data URL
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Check if restaurant name is unique (for validation)
  async checkRestaurantNameUnique(name, excludeSlug = null) {
    try {
      const storageData = this.getStorageData();
      const currentUserSlug = this.getCurrentUserRestaurantSlug();

      // Check all restaurants for name conflicts
      for (const [slug, restaurantData] of Object.entries(storageData.restaurants)) {
        // Skip the current user's restaurant if excludeSlug is provided
        if (excludeSlug && slug === excludeSlug) continue;
        if (excludeSlug && slug === currentUserSlug) continue;

        // Case-insensitive name comparison
        if (restaurantData.restaurant.name.toLowerCase() === name.toLowerCase()) {
          return false; // Name is not unique
        }
      }

      return true; // Name is unique
    } catch (error) {
      console.error('Error checking restaurant name uniqueness:', error);
      return false; // Assume not unique on error for safety
    }
  }

  // Update restaurant name with uniqueness validation
  async updateRestaurantName(newName) {
    try {
      const currentSlug = this.getCurrentUserRestaurantSlug();

      if (!currentSlug) {
        throw new Error('USER_NO_RESTAURANT');
      }

      // Check if name is unique
      const isUnique = await this.checkRestaurantNameUnique(newName, currentSlug);
      if (!isUnique) {
        throw new Error('RESTAURANT_NAME_EXISTS');
      }

      const storageData = this.getStorageData();

      if (!storageData.restaurants[currentSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update restaurant name
      storageData.restaurants[currentSlug].restaurant.name = newName;

      // Save to localStorage
      this.saveStorageData(storageData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Restaurant name updated successfully' };
    } catch (error) {
      console.error('Error updating restaurant name:', error);
      throw error;
    }
  }

  // Get authentication token from localStorage or context
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }
}

// Create singleton instance
const menuService = new MenuService();

export default menuService;

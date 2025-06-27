// Menu Service - Handles all menu-related API calls and data management
class MenuService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.menuCache = new Map(); // Simple caching mechanism
    this.initializeStorage();
  }

  // Get current user's restaurant slug (now supports custom slugs)
  getCurrentUserRestaurantSlug() {
    console.log('🔍 [menuService] Getting current user restaurant slug...');
    try {
      const authUser = localStorage.getItem('authUser');
      console.log('🔍 [menuService] Raw authUser from localStorage:', authUser);

      if (authUser) {
        const user = JSON.parse(authUser);
        console.log('🔍 [menuService] Parsed user object:', user);
        console.log('🔍 [menuService] User ID:', user.id);
        console.log('🔍 [menuService] User restaurant_id:', user.restaurant_id);

        // Get restaurant ID
        let restaurantId = null;
        if (user.restaurant_id) {
          restaurantId = user.restaurant_id;
        } else if (user.id) {
          restaurantId = user.id;
        }

        if (restaurantId) {
          const storageData = this.getStorageData();

          // PHASE 2: First, try to find restaurant by user ID in any storage key
          for (const [storageKey, data] of Object.entries(storageData.restaurants)) {
            if (data.restaurant && data.restaurant.id === restaurantId) {
              console.log('🔍 [menuService] Found restaurant by ID, using slug:', data.restaurant.slug);
              return data.restaurant.slug; // Return the custom slug
            }
          }

          // Fallback: use old format if no custom slug found
          const fallbackSlug = `restaurant-${restaurantId}`;
          console.log('🔍 [menuService] No custom slug found, using fallback:', fallbackSlug);

          // Auto-create restaurant data if missing
          if (!storageData.restaurants[fallbackSlug]) {
            console.warn('⚠️ [menuService] Creating missing restaurant data...');
            this.ensureRestaurantDataExists(fallbackSlug, user);
          }

          return fallbackSlug;
        } else {
          console.warn('⚠️ [menuService] User has no restaurant_id or id');
        }
      } else {
        console.warn('⚠️ [menuService] No authUser found in localStorage');
      }
    } catch (error) {
      console.error('❌ [menuService] Error getting user restaurant slug:', error);
    }
    console.log('🔍 [menuService] Returning null - no valid restaurant slug found');
    return null;
  }

  // Ensure restaurant data exists for the user
  ensureRestaurantDataExists(slug, user) {
    console.log('🔧 [menuService] Ensuring restaurant data exists for slug:', slug);
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[slug]) {
        console.log('🔧 [menuService] Creating missing restaurant data...');

        // Create default restaurant data
        const defaultData = this.createDefaultRestaurantData(slug);

        // Enhance with user information if available
        if (user.email) {
          defaultData.restaurant.name = user.email.split('@')[0] + ' Restaurant';
        }

        storageData.restaurants[slug] = defaultData;
        this.saveStorageData(storageData);

        console.log('✅ [menuService] Created restaurant data for slug:', slug);
        return true;
      }

      console.log('✅ [menuService] Restaurant data already exists for slug:', slug);
      return true;
    } catch (error) {
      console.error('❌ [menuService] Error ensuring restaurant data:', error);
      return false;
    }
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

  // Debug function to inspect storage data
  debugStorageData() {
    console.log('🔍 [DEBUG] Storage Data Inspection:');
    const storageData = this.getStorageData();
    console.log('🔍 [DEBUG] Full storage data:', storageData);
    console.log('🔍 [DEBUG] Available restaurant slugs:', Object.keys(storageData.restaurants));

    Object.keys(storageData.restaurants).forEach(slug => {
      const restaurant = storageData.restaurants[slug];
      console.log(`🔍 [DEBUG] Restaurant ${slug}:`, {
        name: restaurant.restaurant?.name,
        isActive: restaurant.restaurant?.isActive,
        slug: restaurant.restaurant?.slug
      });
    });

    const currentUserSlug = this.getCurrentUserRestaurantSlug();
    console.log('🔍 [DEBUG] Current user slug:', currentUserSlug);
    console.log('🔍 [DEBUG] Current user data exists:', !!storageData.restaurants[currentUserSlug]);

    return storageData;
  }

  // Fix slug mismatch by ensuring data exists under the correct slug
  fixSlugMismatch() {
    console.log('🔧 [menuService] Attempting to fix slug mismatch...');
    const storageData = this.getStorageData();
    const expectedSlug = this.getCurrentUserRestaurantSlug();

    if (!expectedSlug) {
      console.error('❌ [menuService] No expected slug found');
      return false;
    }

    console.log('🔧 [menuService] Expected slug:', expectedSlug);
    console.log('🔧 [menuService] Available slugs:', Object.keys(storageData.restaurants));

    // If expected slug doesn't exist, try to find user's data under a different slug
    if (!storageData.restaurants[expectedSlug]) {
      console.log('🔧 [menuService] Expected slug not found, searching for user data...');

      // Look for any restaurant data that might belong to this user
      const availableSlugs = Object.keys(storageData.restaurants);
      if (availableSlugs.length > 0) {
        console.log('🔧 [menuService] Found existing data, migrating to correct slug...');

        // Take the first available restaurant data and move it to the correct slug
        const existingSlug = availableSlugs[0];
        const existingData = storageData.restaurants[existingSlug];

        // Update the slug in the restaurant object
        existingData.restaurant.slug = expectedSlug;

        // Move data to correct slug
        storageData.restaurants[expectedSlug] = existingData;

        // Remove old slug entry
        delete storageData.restaurants[existingSlug];

        // Save updated data
        this.saveStorageData(storageData);

        console.log('✅ [menuService] Data migrated from', existingSlug, 'to', expectedSlug);
        return true;
      } else {
        console.log('🔧 [menuService] No existing data found, creating new...');
        // Create new data under correct slug
        const newData = this.createDefaultRestaurantData(expectedSlug);
        storageData.restaurants[expectedSlug] = newData;
        this.saveStorageData(storageData);
        console.log('✅ [menuService] New data created under slug:', expectedSlug);
        return true;
      }
    } else {
      console.log('✅ [menuService] Slug already exists correctly');
      return true;
    }
  }

  // Simple function to check if restaurant name is unique
  isRestaurantNameUnique(name) {
    try {
      const allData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');
      const normalizedName = name.toLowerCase().trim();

      // Get current user to exclude their current restaurant
      const authUser = localStorage.getItem('authUser');
      let currentUserSlug = null;
      if (authUser) {
        const user = JSON.parse(authUser);
        // Find current user's restaurant slug
        for (const [slug, data] of Object.entries(allData)) {
          if (data.userId === user.id) {
            currentUserSlug = slug;
            break;
          }
        }
      }

      // Check all restaurants for name conflicts
      for (const [slug, data] of Object.entries(allData)) {
        if (slug === currentUserSlug) continue; // Skip current user's restaurant

        if (data.name && data.name.toLowerCase().trim() === normalizedName) {
          return false; // Name already exists
        }
      }

      return true; // Name is unique
    } catch (error) {
      console.error('Error checking restaurant name uniqueness:', error);
      return false;
    }
  }

  // PHASE 2: Generate URL-friendly slug from restaurant name
  generateSlugFromName(restaurantName) {
    console.log('🔍 [menuService] Generating slug from name:', restaurantName);

    try {
      // Convert to lowercase and handle Turkish characters
      let slug = restaurantName
        .toLowerCase()
        .trim()
        // Replace Turkish characters
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        // Replace spaces and special characters with hyphens
        .replace(/[^a-z0-9]/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '');

      // Ensure slug is not empty
      if (!slug) {
        slug = 'restaurant';
      }

      // Ensure slug is unique by checking existing slugs
      const originalSlug = slug;
      let counter = 1;

      while (this.isSlugTaken(slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }

      console.log('✅ [menuService] Generated unique slug:', slug);
      return slug;
    } catch (error) {
      console.error('❌ [menuService] Error generating slug:', error);
      return 'restaurant-' + Date.now(); // Fallback
    }
  }

  // PHASE 2: Check if a slug is already taken
  isSlugTaken(slug) {
    try {
      const storageData = this.getStorageData();

      // Check if slug exists as a storage key
      if (storageData.restaurants[slug]) {
        return true;
      }

      // Check if slug exists in any restaurant.slug field
      for (const data of Object.values(storageData.restaurants)) {
        if (data.restaurant && data.restaurant.slug === slug) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ [menuService] Error checking slug availability:', error);
      return true; // Err on the side of caution
    }
  }

  // Simple function to update restaurant settings
  async updateRestaurantSettings(name, slug, otherSettings) {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const user = JSON.parse(authUser);
      const allData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');

      // Find current user's restaurant data
      let oldSlug = null;
      for (const [existingSlug, data] of Object.entries(allData)) {
        if (data.userId === user.id) {
          oldSlug = existingSlug;
          break;
        }
      }

      // Create new restaurant data
      const restaurantData = {
        userId: user.id,
        name: name,
        slug: slug,
        status: oldSlug ? allData[oldSlug].status : 'draft', // Keep existing status or default to draft
        address: otherSettings.address || '',
        phone: otherSettings.phone || '',
        hours: otherSettings.hours || '',
        menu: oldSlug ? allData[oldSlug].menu : {
          sections: [
            {
              id: 'section-1',
              title: 'Başlangıçlar',
              items: [
                {
                  id: 'item-1',
                  title: 'Örnek Ürün',
                  description: 'Lezzetli örnek ürün açıklaması',
                  price: 25.00
                }
              ]
            }
          ]
        }
      };

      // Save under new slug
      allData[slug] = restaurantData;

      // Remove old data if slug changed
      if (oldSlug && oldSlug !== slug) {
        delete allData[oldSlug];
      }

      localStorage.setItem('qr_menu_data', JSON.stringify(allData));

      return restaurantData;
    } catch (error) {
      console.error('Error updating restaurant settings:', error);
      throw error;
    }
  }

  // Very simple function to get public menu data
  async getPublicMenuData(slugFromUrl) {
    try {
      // Get all data from localStorage
      const allData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');

      // Look directly for the slug
      const restaurantData = allData[slugFromUrl];

      if (!restaurantData) {
        return null; // Restaurant not found
      }

      // Check if status is 'active'
      if (restaurantData.status !== 'active') {
        return null; // Menu is not active
      }

      // Return the restaurant data
      return restaurantData;

    } catch (error) {
      console.error('Error getting public menu data:', error);
      return null;
    }
  }

  // Simple function to update menu status
  async updateMenuStatus(status) {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const user = JSON.parse(authUser);
      const allData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');

      // Find current user's restaurant
      for (const [slug, data] of Object.entries(allData)) {
        if (data.userId === user.id) {
          data.status = status;
          localStorage.setItem('qr_menu_data', JSON.stringify(allData));
          return true;
        }
      }

      throw new Error('Restaurant not found');
    } catch (error) {
      console.error('Error updating menu status:', error);
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
    console.log('🔍 [menuService] Creating default restaurant data for slug:', slug);

    // Extract restaurant ID from slug if it follows old format
    let restaurantId = Date.now();
    const slugMatch = slug.match(/^restaurant-(\d+)$/);
    if (slugMatch) {
      restaurantId = parseInt(slugMatch[1]);
    }

    return {
      restaurant: {
        id: restaurantId,
        name: 'Yeni Restaurant',
        slug: slug, // CRITICAL: Ensure slug is stored in restaurant object
        address: 'İstanbul, Türkiye',
        phone: '+90 212 555 0123',
        hours: '09:00 - 23:00',
        isActive: false // Start as inactive, user must activate
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

      // CRITICAL: Ensure restaurant data exists before updating
      console.log('🔄 [menuService] Ensuring restaurant data exists before status update...');
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      this.ensureRestaurantDataExists(targetSlug, currentUser);
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
        console.log('🔄 [menuService] Creating missing restaurant data...');

        // Create default data if missing
        storageData.restaurants[targetSlug] = this.createDefaultRestaurantData(targetSlug);
        console.log('✅ [menuService] Created default restaurant data for:', targetSlug);
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

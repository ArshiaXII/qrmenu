class MenuService {
  constructor() {
    this.storageKey = 'qr_menu_data';
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      const authUser = localStorage.getItem('authUser');
      return authUser ? JSON.parse(authUser) : null;
    } catch (error) {
      return null;
    }
  }

  // Get all restaurant data from localStorage
  getAllRestaurantData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  // Save all restaurant data to localStorage
  saveAllRestaurantData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Generate URL-friendly slug from restaurant name
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Get current user's restaurant data
  getCurrentUserRestaurant() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const storageData = this.getStorageData();

    // Find current user's restaurant by userId in the new structure
    for (const [slug, data] of Object.entries(storageData.restaurants || {})) {
      if (data.restaurant && data.restaurant.userId === currentUser.id) {
        console.log('✅ [menuService] Found restaurant data for user:', currentUser.id);
        return {
          ...data.restaurant,
          menu: data.menu,
          branding: data.branding
        };
      }
    }

    console.log('⚠️ [menuService] No restaurant data found for user:', currentUser.id);
    console.log('🔧 [menuService] Auto-creating restaurant data...');

    // Auto-create restaurant data if it doesn't exist
    const restaurantSlug = currentUser.restaurantSlug || `restaurant-${currentUser.id}`;
    this.ensureRestaurantDataExists(restaurantSlug, currentUser);

    // Try to get the data again after creation
    const updatedStorageData = this.getStorageData();
    if (updatedStorageData.restaurants[restaurantSlug]) {
      const data = updatedStorageData.restaurants[restaurantSlug];
      console.log('✅ [menuService] Auto-created and returning restaurant data');
      return {
        ...data.restaurant,
        menu: data.menu,
        branding: data.branding
      };
    }

    return null;
  }

  // Get current user's restaurant slug
  getCurrentUserRestaurantSlug() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const storageData = this.getStorageData();

    // Find current user's restaurant slug
    for (const [slug, data] of Object.entries(storageData.restaurants || {})) {
      if (data.restaurant && data.restaurant.userId === currentUser.id) {
        console.log('✅ [menuService] Found restaurant slug for user:', slug);
        return slug;
      }
    }

    // If no restaurant found, generate a default slug
    const defaultSlug = `restaurant-${currentUser.id}`;
    console.log('⚠️ [menuService] No restaurant slug found, using default:', defaultSlug);
    return defaultSlug;
  }

  // Removed duplicate function - using the more complete version below

  // Save restaurant name and generate new slug
  async saveRestaurantName(name) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const allData = this.getAllRestaurantData();
    const newSlug = this.generateSlug(name);
    
    // Find and update current user's restaurant
    let currentRestaurantSlug = null;
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        currentRestaurantSlug = slug;
        break;
      }
    }

    if (currentRestaurantSlug) {
      // Update existing restaurant
      const restaurantData = allData[currentRestaurantSlug];
      restaurantData.name = name;
      restaurantData.slug = newSlug;
      
      // If slug changed, move data to new key
      if (currentRestaurantSlug !== newSlug) {
        delete allData[currentRestaurantSlug];
        allData[newSlug] = restaurantData;
      }
    } else {
      // Create new restaurant
      allData[newSlug] = {
        userId: currentUser.id,
        name: name,
        slug: newSlug,
        status: 'draft',
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

    // Save the updated data to localStorage
    const saved = this.saveAllRestaurantData(allData);
    if (saved) {
      return { success: true, slug: newSlug, name: name };
    } else {
      throw new Error('Failed to save restaurant data to localStorage');
    }
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

      // CRITICAL: Ensure restaurant data exists before updating
      console.log('🔄 [menuService] Ensuring restaurant data exists before status update...');
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      this.ensureRestaurantDataExists(targetSlug, currentUser);

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

      // Also update the user's restaurantSlug in authUser for consistency
      const authUser = this.getCurrentUser();
      if (authUser) {
        authUser.restaurantSlug = targetSlug;
        localStorage.setItem('authUser', JSON.stringify(authUser));
        console.log('🔄 [menuService] Updated authUser with restaurantSlug:', targetSlug);
      }

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

  // Helper method to convert file to data URL
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Check if restaurant name is unique
  async checkRestaurantNameUnique(name, excludeSlug = null) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const normalizedName = name.toLowerCase().trim();
      const allData = this.getAllRestaurantData();

      // Check if any restaurant has the same name (case-insensitive)
      for (const [slug, restaurantData] of Object.entries(allData)) {
        // Skip current user's restaurant if excludeSlug is provided
        if (excludeSlug && slug === excludeSlug) continue;

        // Skip current user's restaurant by userId
        if (restaurantData.userId === currentUser.id) continue;

        if (restaurantData.name && restaurantData.name.toLowerCase().trim() === normalizedName) {
          return false; // Name already exists
        }
      }

      return true; // Name is unique
    } catch (error) {
      console.error('Error checking restaurant name uniqueness:', error);
      return false; // Return false on error to be safe
    }
  }

  // Update restaurant name
  async updateRestaurantName(newName, restaurantSlug = null) {
    try {
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();

      if (!targetSlug) {
        throw new Error('USER_NO_RESTAURANT');
      }

      // Check if name is unique
      const isUnique = await this.checkRestaurantNameUnique(newName, targetSlug);
      if (!isUnique) {
        throw new Error('RESTAURANT_NAME_EXISTS');
      }

      const storageData = this.getStorageData();

      if (!storageData.restaurants[targetSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update restaurant name
      storageData.restaurants[targetSlug].restaurant.name = newName;

      // Save to localStorage
      this.saveStorageData(storageData);

      return { success: true, message: 'Restaurant name updated successfully' };
    } catch (error) {
      console.error('Error updating restaurant name:', error);
      throw error;
    }
  }

  // Ensure restaurant data exists for a user
  ensureRestaurantDataExists(slug, user) {
    console.log('🔧 [menuService] ensureRestaurantDataExists called for:', slug);

    const storageData = this.getStorageData();

    if (!storageData.restaurants) {
      storageData.restaurants = {};
    }

    if (!storageData.restaurants[slug]) {
      console.log('🔧 [menuService] Creating missing restaurant data for:', slug);
      storageData.restaurants[slug] = this.createDefaultRestaurantData(slug, user);
      this.saveStorageData(storageData);
      console.log('✅ [menuService] Created and saved restaurant data for:', slug);
    }
  }

  // Create default restaurant data structure
  createDefaultRestaurantData(slug, user = null) {
    console.log('🔧 [menuService] createDefaultRestaurantData called for:', slug);

    const currentUser = user || this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user provided for creating restaurant data');
    }

    return {
      restaurant: {
        userId: currentUser.id,
        name: currentUser.name || 'Yeni Restaurant',
        slug: slug,
        address: 'İstanbul, Türkiye',
        phone: '+90 212 555 0123',
        hours: '09:00 - 23:00',
        isActive: false, // Default to inactive
        onboarding_completed: false // Default to not completed
      },
      menu: {
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
      },
      branding: {
        colors: {
          accentColor: '#8b5cf6',
          textColor: '#1f2937',
          backgroundColor: '#ffffff'
        },
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
        fontFamily: 'Inter'
      }
    };
  }

  // Get storage data with new structure
  getStorageData() {
    try {
      const data = localStorage.getItem('qr_menu_storage');
      return data ? JSON.parse(data) : { restaurants: {} };
    } catch (error) {
      console.error('Error reading storage data:', error);
      return { restaurants: {} };
    }
  }

  // Save storage data with new structure
  saveStorageData(data) {
    try {
      localStorage.setItem('qr_menu_storage', JSON.stringify(data));
      console.log('✅ [menuService] Storage data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ [menuService] Error saving storage data:', error);
      return false;
    }
  }

  // Get menu data for preview (bypasses status check)
  async getPreviewMenuData(slug) {
    try {
      console.log('🔍 [menuService] getPreviewMenuData called with slug:', slug);

      const storageData = this.getStorageData();
      console.log('🔍 [menuService] Available restaurant slugs:', Object.keys(storageData.restaurants));

      if (!storageData.restaurants[slug]) {
        console.log('❌ [menuService] Restaurant not found for preview slug:', slug);
        return null;
      }

      const restaurantData = storageData.restaurants[slug];
      console.log('✅ [menuService] Found restaurant data for preview:', restaurantData.restaurant.name);

      // Return the complete restaurant data for preview (regardless of status)
      return {
        ...restaurantData.restaurant,
        menu: restaurantData.menu,
        branding: restaurantData.branding
      };
    } catch (error) {
      console.error('❌ [menuService] Error in getPreviewMenuData:', error);
      return null;
    }
  }

  // Get public menu data (checks if menu is active)
  async getPublicMenuData(slug) {
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[slug]) {
        return null;
      }

      const restaurantData = storageData.restaurants[slug];

      // Check if menu is active for public access
      if (!restaurantData.restaurant.isActive) {
        return null;
      }

      return {
        ...restaurantData.restaurant,
        menu: restaurantData.menu,
        branding: restaurantData.branding
      };
    } catch (error) {
      console.error('Error loading public menu:', error);
      return null;
    }
  }



  // Save or update restaurant data (unified function for menu, branding, etc.)
  async saveOrUpdateRestaurantData(restaurantSlug, dataToUpdate) {
    try {
      console.log('🔄 [menuService] saveOrUpdateRestaurantData called');
      console.log('🔄 [menuService] restaurantSlug:', restaurantSlug);
      console.log('🔄 [menuService] dataToUpdate:', dataToUpdate);

      // Use current user's restaurant slug if not provided
      const targetSlug = restaurantSlug || this.getCurrentUserRestaurantSlug();
      console.log('🔄 [menuService] targetSlug (final):', targetSlug);

      if (!targetSlug) {
        console.error('❌ [menuService] No restaurant slug available');
        throw new Error('USER_NO_RESTAURANT');
      }

      // Ensure restaurant data exists
      const currentUser = this.getCurrentUser();
      this.ensureRestaurantDataExists(targetSlug, currentUser);

      const storageData = this.getStorageData();
      console.log('🔄 [menuService] Current storage data:', Object.keys(storageData.restaurants));

      if (!storageData.restaurants[targetSlug]) {
        console.error('❌ [menuService] Restaurant not found in storage:', targetSlug);
        throw new Error('Restaurant not found');
      }

      // Update the restaurant data with the provided updates
      const restaurantData = storageData.restaurants[targetSlug];

      // Merge the updates into the existing data
      if (dataToUpdate.menu) {
        restaurantData.menu = { ...restaurantData.menu, ...dataToUpdate.menu };
        console.log('🔄 [menuService] Updated menu data');
      }

      if (dataToUpdate.branding) {
        restaurantData.branding = { ...restaurantData.branding, ...dataToUpdate.branding };
        console.log('🔄 [menuService] Updated branding data');
      }

      if (dataToUpdate.restaurant) {
        restaurantData.restaurant = { ...restaurantData.restaurant, ...dataToUpdate.restaurant };
        console.log('🔄 [menuService] Updated restaurant data');
      }

      // Save to localStorage
      this.saveStorageData(storageData);
      console.log('✅ [menuService] Restaurant data saved successfully');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = { success: true, message: 'Restaurant data updated successfully' };
      console.log('✅ [menuService] Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ [menuService] Error saving restaurant data:', error);
      throw error;
    }
  }
}

const menuService = new MenuService();
export default menuService;

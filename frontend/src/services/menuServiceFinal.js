// QR Menu Platform - Menu Service - COMPLETE FINAL IMPLEMENTATION
// Simple, direct implementation for restaurant management and public menu access

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
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get all restaurant data from localStorage
  getAllRestaurantData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting restaurant data:', error);
      return {};
    }
  }

  // Save all restaurant data to localStorage
  saveAllRestaurantData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving restaurant data:', error);
      return false;
    }
  }

  // Generate URL-friendly slug from restaurant name
  generateSlugFromName(name) {
    return name
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
  }

  // Check if restaurant name is unique (excluding current user's restaurant)
  isRestaurantNameUnique(name) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const allData = this.getAllRestaurantData();
    const normalizedName = name.toLowerCase().trim();

    // Check all restaurants for name conflicts
    for (const [slug, restaurantData] of Object.entries(allData)) {
      // Skip current user's restaurant
      if (restaurantData.userId === currentUser.id) continue;
      
      if (restaurantData.name && restaurantData.name.toLowerCase().trim() === normalizedName) {
        return false; // Name already exists
      }
    }

    return true; // Name is unique
  }

  // Get current user's restaurant data
  getCurrentUserRestaurant() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const allData = this.getAllRestaurantData();

    // Find current user's restaurant
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        console.log('✅ [menuService] Found restaurant data for user:', currentUser.id);
        return restaurantData;
      }
    }

    console.log('⚠️ [menuService] No restaurant data found for user:', currentUser.id);
    console.log('🔧 [menuService] Creating default restaurant data...');

    // Create default restaurant data for new user
    return this.createDefaultRestaurantData(currentUser);
  }

  // Create default restaurant data for a user
  createDefaultRestaurantData(user) {
    const slug = `restaurant-${user.id}`;
    const defaultData = {
      userId: user.id,
      name: user.name || 'Yeni Restaurant',
      slug: slug,
      address: 'İstanbul, Türkiye',
      phone: '+90 212 555 0123',
      hours: '09:00 - 23:00',
      status: 'draft',
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
      }
    };

    // Save the new restaurant data
    const allData = this.getAllRestaurantData();
    allData[slug] = defaultData;

    if (this.saveAllRestaurantData(allData)) {
      console.log('✅ [menuService] Created default restaurant data for user:', user.id);
      return defaultData;
    } else {
      console.error('❌ [menuService] Failed to save default restaurant data');
      return null;
    }
  }

  // Save/Update restaurant settings (name, slug, etc.)
  async saveRestaurantSettings(name, address = '', phone = '', hours = '') {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Check if name is unique
    if (!this.isRestaurantNameUnique(name)) {
      throw new Error('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
    }

    const allData = this.getAllRestaurantData();
    const newSlug = this.generateSlugFromName(name);

    // Find and remove current user's old restaurant data
    let oldSlug = null;
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        oldSlug = slug;
        break;
      }
    }

    // Create new restaurant data
    const restaurantData = {
      userId: currentUser.id,
      name: name,
      slug: newSlug,
      status: oldSlug ? allData[oldSlug].status : 'inactive', // Keep existing status or default to inactive
      address: address,
      phone: phone,
      hours: hours,
      menu: oldSlug ? allData[oldSlug].menu : {
        sections: [
          {
            id: 'section-1',
            name: 'Ana Yemekler',
            items: [
              {
                id: 'item-1',
                name: 'Örnek Yemek',
                description: 'Lezzetli örnek yemek açıklaması',
                price: 25.00
              }
            ]
          }
        ]
      }
    };

    // Save under new slug
    allData[newSlug] = restaurantData;

    // Remove old data if slug changed
    if (oldSlug && oldSlug !== newSlug) {
      delete allData[oldSlug];
    }

    // Save to localStorage
    if (this.saveAllRestaurantData(allData)) {
      return restaurantData;
    } else {
      throw new Error('Ayarlar kaydedilirken bir hata oluştu.');
    }
  }

  // Update menu status (active/inactive)
  async updateMenuStatus(status) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const allData = this.getAllRestaurantData();

    // Find current user's restaurant
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        restaurantData.status = status;
        
        if (this.saveAllRestaurantData(allData)) {
          return true;
        } else {
          throw new Error('Menü durumu güncellenirken bir hata oluştu.');
        }
      }
    }

    throw new Error('Restaurant not found');
  }

  // Get public menu data by slug (for public access)
  async getPublicMenuData(slug) {
    console.log('🔍 [menuService] getPublicMenuData called with slug:', slug);
    console.log('🔍 [menuService] User agent:', navigator.userAgent);

    try {
      const allData = this.getAllRestaurantData();
      console.log('🔍 [menuService] All data keys:', Object.keys(allData));

      const restaurantData = allData[slug];
      console.log('🔍 [menuService] Restaurant data for slug:', restaurantData);

      if (!restaurantData) {
        console.log('❌ [menuService] Restaurant not found for slug:', slug);
        return null; // Restaurant not found
      }

      console.log('🔍 [menuService] Restaurant status:', restaurantData.status);

      if (restaurantData.status !== 'active') {
        console.log('❌ [menuService] Restaurant is not active');
        return null; // Menu is not active
      }

      console.log('✅ [menuService] Returning active restaurant data');
      return restaurantData; // Return the restaurant data
    } catch (error) {
      console.error('❌ [menuService] Error in getPublicMenuData:', error);
      return null;
    }
  }

  // Get menu data for preview (bypasses status check)
  async getPreviewMenuData(slug) {
    const allData = this.getAllRestaurantData();
    return allData[slug] || null;
  }
}

// Export a single instance
const menuService = new MenuService();
export default menuService;

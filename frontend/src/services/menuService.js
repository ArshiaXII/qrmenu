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

    const allData = this.getAllRestaurantData();
    
    // Find current user's restaurant by userId
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        return restaurantData;
      }
    }

    return null;
  }

  // Check if restaurant name is unique (case-insensitive)
  async checkRestaurantNameUnique(name) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const normalizedName = name.toLowerCase().trim();
    const allData = this.getAllRestaurantData();

    for (const [slug, restaurantData] of Object.entries(allData)) {
      // Skip current user's restaurant
      if (restaurantData.userId === currentUser.id) continue;
      
      if (restaurantData.name && restaurantData.name.toLowerCase().trim() === normalizedName) {
        return false; // Name already exists
      }
    }

    return true; // Name is unique
  }

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
    }

    if (this.saveAllRestaurantData(allData)) {
      return { name, slug: newSlug };
    } else {
      throw new Error('Kaydetme işlemi başarısız');
    }
  }

  // Update menu status
  async updateMenuStatus(status) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const allData = this.getAllRestaurantData();

    // Find and update current user's restaurant status
    for (const [slug, restaurantData] of Object.entries(allData)) {
      if (restaurantData.userId === currentUser.id) {
        restaurantData.status = status;
        
        if (this.saveAllRestaurantData(allData)) {
          return true;
        } else {
          throw new Error('Status güncellenemedi');
        }
      }
    }

    throw new Error('Restaurant not found');
  }

  // Get public menu data by slug (for public access)
  async getPublicMenuData(slug) {
    const allData = this.getAllRestaurantData();
    const restaurantData = allData[slug];

    if (!restaurantData) {
      return null; // Restaurant not found
    }

    if (restaurantData.status !== 'active') {
      return null; // Menu is not active
    }

    return restaurantData; // Return the restaurant data
  }

  // Get menu data for preview (bypasses status check)
  async getPreviewMenuData(slug) {
    const allData = this.getAllRestaurantData();
    return allData[slug] || null;
  }
}

export default new MenuService();

// Menu Service - Handles all menu-related API calls and data management
class MenuService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.menuCache = new Map(); // Simple caching mechanism
    this.initializeStorage();
  }

  // Initialize localStorage with default data if not exists
  initializeStorage() {
    const storageKey = 'qr_menu_data';
    if (!localStorage.getItem(storageKey)) {
      const defaultData = {
        restaurants: {
          'lezzet-restaurant': {
            restaurant: {
              id: 1,
              name: 'Lezzet Restaurant',
              slug: 'lezzet-restaurant',
              address: 'İstanbul, Türkiye',
              phone: '+90 212 555 0123',
              hours: '09:00 - 23:00',
              isActive: true,
              currency: 'TRY',
              socialMedia: {
                instagram: '',
                facebook: '',
                twitter: ''
              }
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
                      title: 'Humus',
                      description: 'Geleneksel Türk humusu, taze sebzeler ile servis edilir',
                      price: '25.00',
                      image: null,
                      order: 1,
                      isAvailable: true
                    },
                    {
                      id: 'item-2',
                      title: 'Çoban Salatası',
                      description: 'Taze domates, salatalık, soğan ve peynir ile hazırlanmış',
                      price: '30.00',
                      image: null,
                      order: 2,
                      isAvailable: true
                    }
                  ]
                },
                {
                  id: 'section-2',
                  title: 'Ana Yemekler',
                  description: 'Özenle hazırlanmış ana yemeklerimiz',
                  image: null,
                  order: 2,
                  items: [
                    {
                      id: 'item-3',
                      title: 'Izgara Köfte',
                      description: 'Özel baharatlarla marine edilmiş köfte, pilav ve salata ile',
                      price: '65.00',
                      image: null,
                      order: 1,
                      isAvailable: true
                    },
                    {
                      id: 'item-4',
                      title: 'Tavuk Şiş',
                      description: 'Izgara tavuk şiş, sebzeler ve pilav ile servis edilir',
                      price: '55.00',
                      image: null,
                      order: 2,
                      isAvailable: true
                    }
                  ]
                },
                {
                  id: 'section-3',
                  title: 'Tatlılar',
                  description: 'Ev yapımı tatlılarımız',
                  image: null,
                  order: 3,
                  items: [
                    {
                      id: 'item-5',
                      title: 'Baklava',
                      description: 'Geleneksel baklava, antep fıstığı ile',
                      price: '35.00',
                      image: null,
                      order: 1,
                      isAvailable: true
                    }
                  ]
                }
              ]
            }
          }
        }
      };
      localStorage.setItem(storageKey, JSON.stringify(defaultData));
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

  // Get public menu data for a specific restaurant
  async getPublicMenuData(restaurantSlug) {
    try {
      // For development, use localStorage. In production, this would be a real API call
      const storageData = this.getStorageData();
      const restaurantData = storageData.restaurants[restaurantSlug];

      if (!restaurantData) {
        throw new Error('RESTAURANT_NOT_FOUND');
      }

      if (!restaurantData.restaurant.isActive) {
        throw new Error('MENU_INACTIVE');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return restaurantData;
    } catch (error) {
      console.error('Error fetching public menu data:', error);
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
  async getMenuData(restaurantSlug = 'lezzet-restaurant') {
    try {
      // For development, use localStorage. In production, this would be a real API call
      const storageData = this.getStorageData();
      let restaurantData = storageData.restaurants[restaurantSlug];

      // If restaurant not found, create it with default data
      if (!restaurantData) {
        restaurantData = this.createDefaultRestaurantData(restaurantSlug);
        storageData.restaurants[restaurantSlug] = restaurantData;
        this.saveStorageData(storageData);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return restaurantData;
    } catch (error) {
      console.error('Error fetching menu data:', error);
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
  async saveMenuContent(restaurantSlug = 'lezzet-restaurant', menuData) {
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[restaurantSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update menu data
      storageData.restaurants[restaurantSlug].menu = menuData;

      // Save to localStorage
      this.saveStorageData(storageData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Menu content saved successfully' };
    } catch (error) {
      console.error('Error saving menu content:', error);
      throw error;
    }
  }

  // Save design customization
  async saveDesignCustomization(restaurantSlug = 'lezzet-restaurant', designData) {
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[restaurantSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update branding data
      storageData.restaurants[restaurantSlug].branding = designData;

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
  async updateMenuStatus(restaurantSlug = 'lezzet-restaurant', isActive) {
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[restaurantSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update restaurant status
      storageData.restaurants[restaurantSlug].restaurant.isActive = isActive;

      // Save to localStorage
      this.saveStorageData(storageData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true, message: 'Menu status updated successfully', isActive };
    } catch (error) {
      console.error('Error updating menu status:', error);
      throw error;
    }
  }

  // Save restaurant settings (currency, social media)
  async saveRestaurantSettings(restaurantSlug = 'lezzet-restaurant', settings) {
    try {
      const storageData = this.getStorageData();

      if (!storageData.restaurants[restaurantSlug]) {
        throw new Error('Restaurant not found');
      }

      // Update restaurant settings
      storageData.restaurants[restaurantSlug].restaurant.currency = settings.currency;
      storageData.restaurants[restaurantSlug].restaurant.socialMedia = settings.socialMedia;

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

  // Get authentication token from localStorage or context
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }
}

// Create singleton instance
const menuService = new MenuService();

export default menuService;

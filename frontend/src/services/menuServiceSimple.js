// SIMPLIFIED menuService.js - Only two functions for basic public menu access

class MenuService {
  
  // Function 1: Save data to localStorage
  saveData(data) {
    console.log('💾 [menuService] saveData called with:', data);
    try {
      localStorage.setItem('qr_menu_data', JSON.stringify(data));
      console.log('✅ [menuService] Data saved successfully to localStorage');
      return true;
    } catch (error) {
      console.error('❌ [menuService] Error saving data:', error);
      return false;
    }
  }

  // Function 2: Get public menu data by slug
  async getPublicMenuData(slug) {
    console.log('🔍 [menuService] getPublicMenuData called with slug:', slug);
    
    try {
      // Step 1: Get data from localStorage
      console.log('🔍 [menuService] Step 1: Getting data from localStorage...');
      const rawData = localStorage.getItem('qr_menu_data');
      console.log('🔍 [menuService] Raw data from localStorage:', rawData);
      
      if (!rawData) {
        console.log('❌ [menuService] No data found in localStorage');
        return null;
      }
      
      // Step 2: Parse the data
      console.log('🔍 [menuService] Step 2: Parsing data...');
      const allData = JSON.parse(rawData);
      console.log('🔍 [menuService] Parsed data:', allData);
      console.log('🔍 [menuService] Available restaurants:', Object.keys(allData.restaurants || {}));
      
      // Step 3: Look for restaurant by slug
      console.log('🔍 [menuService] Step 3: Looking for restaurant with slug:', slug);
      const restaurantData = allData.restaurants ? allData.restaurants[slug] : null;
      console.log('🔍 [menuService] Found restaurant data:', restaurantData);
      
      if (!restaurantData) {
        console.log('❌ [menuService] No restaurant found for slug:', slug);
        return null;
      }
      
      // Step 4: Check if restaurant is active
      console.log('🔍 [menuService] Step 4: Checking restaurant status...');
      const status = restaurantData.restaurant ? restaurantData.restaurant.isActive : false;
      console.log('🔍 [menuService] Restaurant status (isActive):', status);
      
      if (!status) {
        console.log('❌ [menuService] Restaurant is not active');
        return null;
      }
      
      // Step 5: Return the data
      console.log('✅ [menuService] Restaurant is active, returning data');
      console.log('🔍 [menuService] Returning restaurant data:', restaurantData);
      return restaurantData;
      
    } catch (error) {
      console.error('❌ [menuService] Error in getPublicMenuData:', error);
      return null;
    }
  }
}

// Export a single instance
const menuService = new MenuService();
export default menuService;

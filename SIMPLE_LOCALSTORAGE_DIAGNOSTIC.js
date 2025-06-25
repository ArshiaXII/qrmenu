// 🔍 SIMPLE LOCALSTORAGE DIAGNOSTIC SCRIPT
// Paste this into browser console on ANY page after logging in

console.log('🔍 === SIMPLE LOCALSTORAGE DIAGNOSTIC ===');

try {
    // Get authentication data
    const authUser = localStorage.getItem('authUser');
    const parsedAuthUser = authUser ? JSON.parse(authUser) : null;
    
    console.log('👤 AUTH USER DATA:');
    console.log('   Raw authUser:', authUser);
    console.log('   Parsed authUser:', parsedAuthUser);
    console.log('   Restaurant ID:', parsedAuthUser?.restaurant_id);
    console.log('   Expected slug:', parsedAuthUser?.restaurant_id ? `restaurant-${parsedAuthUser.restaurant_id}` : 'NONE');
    
    // Get menu data
    const qrMenuData = localStorage.getItem('qr_menu_data');
    const parsedMenuData = qrMenuData ? JSON.parse(qrMenuData) : null;
    
    console.log('\n📊 MENU STORAGE DATA:');
    console.log('   Raw qr_menu_data:', qrMenuData);
    console.log('   Parsed qr_menu_data:', parsedMenuData);
    
    if (parsedMenuData && parsedMenuData.restaurants) {
        const availableSlugs = Object.keys(parsedMenuData.restaurants);
        console.log('   Available restaurant slugs:', availableSlugs);
        console.log('   Restaurant count:', availableSlugs.length);
        
        // Show detailed data for each restaurant
        availableSlugs.forEach(slug => {
            const data = parsedMenuData.restaurants[slug];
            console.log(`\n🏪 RESTAURANT [${slug}]:`);
            console.log('     Name:', data.restaurant?.name);
            console.log('     Slug (in data):', data.restaurant?.slug);
            console.log('     Active:', data.restaurant?.isActive);
            console.log('     Has menu:', !!data.menu);
            console.log('     Menu sections:', data.menu?.sections?.length || 0);
            if (data.menu?.sections?.length > 0) {
                console.log('     Section titles:', data.menu.sections.map(s => s.title || s.title?.tr || 'Unnamed'));
            }
        });
        
        // Check slug matching
        const expectedSlug = parsedAuthUser?.restaurant_id ? `restaurant-${parsedAuthUser.restaurant_id}` : null;
        if (expectedSlug) {
            console.log(`\n🔍 SLUG ANALYSIS:`);
            console.log('   Expected slug:', expectedSlug);
            console.log('   Direct match exists:', !!parsedMenuData.restaurants[expectedSlug]);
            
            // Check for cross-references
            const crossRefs = [];
            availableSlugs.forEach(storageSlug => {
                const data = parsedMenuData.restaurants[storageSlug];
                if (data.restaurant?.slug === expectedSlug) {
                    crossRefs.push(storageSlug);
                }
            });
            console.log('   Cross-reference matches:', crossRefs);
            
            // Generate QR URL
            const baseURL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : `http://${window.location.hostname}`;
            const qrURL = `${baseURL}/menu/${expectedSlug}`;
            console.log('   Generated QR URL:', qrURL);
        }
        
    } else {
        console.log('   ❌ NO MENU DATA FOUND');
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('   Auth user exists:', !!parsedAuthUser);
    console.log('   Menu data exists:', !!parsedMenuData);
    console.log('   Restaurant count:', parsedMenuData?.restaurants ? Object.keys(parsedMenuData.restaurants).length : 0);
    
    if (parsedAuthUser?.restaurant_id) {
        const expectedSlug = `restaurant-${parsedAuthUser.restaurant_id}`;
        const directMatch = parsedMenuData?.restaurants?.[expectedSlug];
        const hasActiveMenu = directMatch?.restaurant?.isActive;
        
        console.log('   Expected slug:', expectedSlug);
        console.log('   Direct match:', !!directMatch);
        console.log('   Menu active:', hasActiveMenu);
        
        if (directMatch && hasActiveMenu) {
            console.log('   ✅ QR SHOULD WORK');
        } else if (directMatch && !hasActiveMenu) {
            console.log('   ⚠️ MENU EXISTS BUT INACTIVE');
        } else {
            console.log('   ❌ SLUG MISMATCH OR NO DATA');
        }
    }
    
    console.log('\n🔍 === END DIAGNOSTIC ===');
    
} catch (error) {
    console.error('❌ Diagnostic script failed:', error);
}

// Return key data for easy access
const result = {
    authUser: JSON.parse(localStorage.getItem('authUser') || 'null'),
    menuData: JSON.parse(localStorage.getItem('qr_menu_data') || 'null'),
    timestamp: new Date().toISOString()
};

console.log('\n📤 RESULT OBJECT (copy this if needed):', result);
result; 
// 🚨 EMERGENCY QR MENU DIAGNOSTIC SCRIPT
// Run this in browser console if Enhanced Storage Debugger isn't working

console.log('🚨 EMERGENCY QR MENU DIAGNOSTIC SCRIPT STARTING...');

// Emergency function to diagnose QR menu issues
function emergencyQRDiagnostics() {
    console.log('🔍 === EMERGENCY QR MENU DIAGNOSTICS ===');
    
    const result = {
        timestamp: new Date().toISOString(),
        authCheck: null,
        storageCheck: null,
        slugAnalysis: null,
        qrUrlGeneration: null,
        recommendations: []
    };
    
    try {
        // 1. Check Authentication
        console.log('🔍 [Test 1] Checking authentication...');
        const authUser = localStorage.getItem('authUser');
        const parsedAuthUser = authUser ? JSON.parse(authUser) : null;
        
        result.authCheck = {
            hasAuth: !!authUser,
            restaurantId: parsedAuthUser?.restaurant_id,
            expectedSlug: parsedAuthUser?.restaurant_id ? `restaurant-${parsedAuthUser.restaurant_id}` : null
        };
        
        console.log('🔍 [Test 1] Auth Result:', result.authCheck);
        
        // 2. Check Storage Data
        console.log('🔍 [Test 2] Checking storage data...');
        const qrMenuData = localStorage.getItem('qr_menu_data');
        const parsedMenuData = qrMenuData ? JSON.parse(qrMenuData) : null;
        const availableSlugs = parsedMenuData ? Object.keys(parsedMenuData.restaurants || {}) : [];
        
        result.storageCheck = {
            hasMenuData: !!qrMenuData,
            availableSlugs: availableSlugs,
            restaurantCount: availableSlugs.length,
            restaurants: {}
        };
        
        if (parsedMenuData && parsedMenuData.restaurants) {
            availableSlugs.forEach(slug => {
                const data = parsedMenuData.restaurants[slug];
                result.storageCheck.restaurants[slug] = {
                    name: data.restaurant?.name,
                    slug: data.restaurant?.slug,
                    isActive: data.restaurant?.isActive,
                    hasMenu: !!data.menu,
                    menuSections: data.menu?.sections?.length || 0
                };
            });
        }
        
        console.log('🔍 [Test 2] Storage Result:', result.storageCheck);
        
        // 3. Analyze Slug Matching
        console.log('🔍 [Test 3] Analyzing slug matching...');
        const expectedSlug = result.authCheck.expectedSlug;
        const directMatch = expectedSlug && availableSlugs.includes(expectedSlug);
        
        result.slugAnalysis = {
            expectedSlug: expectedSlug,
            directMatch: directMatch,
            crossReferences: [],
            needsSlugFix: false
        };
        
        // Check for cross-references if no direct match
        if (expectedSlug && !directMatch && parsedMenuData) {
            availableSlugs.forEach(slug => {
                const data = parsedMenuData.restaurants[slug];
                if (data.restaurant?.slug === expectedSlug) {
                    result.slugAnalysis.crossReferences.push({
                        storageSlug: slug,
                        restaurantSlug: data.restaurant.slug
                    });
                }
            });
            
            result.slugAnalysis.needsSlugFix = result.slugAnalysis.crossReferences.length === 0 && availableSlugs.length > 0;
        }
        
        console.log('🔍 [Test 3] Slug Analysis Result:', result.slugAnalysis);
        
        // 4. Generate QR URL
        console.log('🔍 [Test 4] Generating QR URL...');
        if (expectedSlug) {
            const baseURL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : `http://${window.location.hostname}`;
            const qrURL = `${baseURL}/menu/${expectedSlug}`;
            
            result.qrUrlGeneration = {
                success: true,
                url: qrURL,
                baseURL: baseURL,
                slug: expectedSlug
            };
            
            console.log('🔍 [Test 4] Generated QR URL:', qrURL);
        } else {
            result.qrUrlGeneration = {
                success: false,
                error: 'No expected slug found'
            };
        }
        
        // 5. Generate Recommendations
        console.log('🔍 [Test 5] Generating recommendations...');
        
        if (!result.authCheck.hasAuth) {
            result.recommendations.push('❌ No authentication found - please log in');
        }
        
        if (!result.storageCheck.hasMenuData) {
            result.recommendations.push('❌ No menu data found - please create/save menu content');
        }
        
        if (result.authCheck.hasAuth && !result.authCheck.expectedSlug) {
            result.recommendations.push('❌ Auth user has no restaurant_id - check user data');
        }
        
        if (result.slugAnalysis.needsSlugFix) {
            result.recommendations.push('🔧 Slug mismatch detected - run slug fix function');
        }
        
        if (result.slugAnalysis.crossReferences.length > 0) {
            result.recommendations.push('✅ Cross-reference found - data exists but under different slug');
        }
        
        if (result.storageCheck.restaurantCount > 0 && result.authCheck.expectedSlug) {
            const restaurantData = result.storageCheck.restaurants[result.authCheck.expectedSlug] || 
                                 Object.values(result.storageCheck.restaurants)[0];
            
            if (restaurantData && !restaurantData.isActive) {
                result.recommendations.push('⚠️ Menu exists but is INACTIVE - activate menu in dashboard');
            }
            
            if (restaurantData && restaurantData.isActive) {
                result.recommendations.push('✅ Menu exists and is ACTIVE - QR code should work');
            }
        }
        
        if (result.recommendations.length === 0) {
            result.recommendations.push('✅ No obvious issues found - QR code should work');
        }
        
        // Final Report
        console.log('🎯 === FINAL DIAGNOSTIC REPORT ===');
        console.log('📊 Full Results:', result);
        console.log('🔧 Recommendations:');
        result.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
        
        if (result.qrUrlGeneration.success) {
            console.log('🔗 QR URL to test:', result.qrUrlGeneration.url);
            
            // Safe clipboard handling with fallback for HTTP environments
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(result.qrUrlGeneration.url).then(() => {
                    console.log('📋 QR URL copied to clipboard!');
                }).catch((clipboardError) => {
                    console.warn('⚠️ Clipboard API failed:', clipboardError);
                    console.log('📋 Could not copy to clipboard, but URL is logged above');
                });
            } else {
                console.warn('⚠️ Clipboard API not available (likely HTTP environment)');
                console.log('📋 Clipboard unavailable on HTTP - URL logged above for manual copy');
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Emergency diagnostics failed:', error);
        return { error: error.message, timestamp: new Date().toISOString() };
    }
}

// Emergency slug fix function
function emergencySlugFix() {
    console.log('🔧 === EMERGENCY SLUG FIX ===');
    
    try {
        const authUser = localStorage.getItem('authUser');
        const parsedAuthUser = authUser ? JSON.parse(authUser) : null;
        
        if (!parsedAuthUser?.restaurant_id) {
            console.error('❌ No valid auth user found');
            return false;
        }
        
        const expectedSlug = `restaurant-${parsedAuthUser.restaurant_id}`;
        console.log('🔧 Expected slug:', expectedSlug);
        
        const qrMenuData = localStorage.getItem('qr_menu_data');
        const parsedMenuData = qrMenuData ? JSON.parse(qrMenuData) : { restaurants: {} };
        
        const availableSlugs = Object.keys(parsedMenuData.restaurants);
        console.log('🔧 Available slugs:', availableSlugs);
        
        if (parsedMenuData.restaurants[expectedSlug]) {
            console.log('✅ Expected slug already exists correctly');
            return true;
        }
        
        if (availableSlugs.length === 1) {
            const oldSlug = availableSlugs[0];
            const restaurantData = parsedMenuData.restaurants[oldSlug];
            
            console.log('🔧 Migrating data from', oldSlug, 'to', expectedSlug);
            
            // Update restaurant slug in the data
            restaurantData.restaurant.slug = expectedSlug;
            
            // Move data to correct slug
            parsedMenuData.restaurants[expectedSlug] = restaurantData;
            delete parsedMenuData.restaurants[oldSlug];
            
            // Save back to localStorage
            localStorage.setItem('qr_menu_data', JSON.stringify(parsedMenuData));
            
            console.log('✅ Slug fix completed successfully');
            return true;
        }
        
        console.log('⚠️ Multiple or no restaurants found, manual intervention needed');
        return false;
        
    } catch (error) {
        console.error('❌ Emergency slug fix failed:', error);
        return false;
    }
}

// Emergency menu activation function
function emergencyActivateMenu() {
    console.log('🔧 === EMERGENCY MENU ACTIVATION ===');
    
    try {
        const authUser = localStorage.getItem('authUser');
        const parsedAuthUser = authUser ? JSON.parse(authUser) : null;
        
        if (!parsedAuthUser?.restaurant_id) {
            console.error('❌ No valid auth user found');
            return false;
        }
        
        const expectedSlug = `restaurant-${parsedAuthUser.restaurant_id}`;
        const qrMenuData = localStorage.getItem('qr_menu_data');
        const parsedMenuData = qrMenuData ? JSON.parse(qrMenuData) : null;
        
        if (!parsedMenuData?.restaurants?.[expectedSlug]) {
            console.error('❌ No restaurant data found for slug:', expectedSlug);
            return false;
        }
        
        // Activate the menu
        parsedMenuData.restaurants[expectedSlug].restaurant.isActive = true;
        
        // Save back to localStorage
        localStorage.setItem('qr_menu_data', JSON.stringify(parsedMenuData));
        
        console.log('✅ Menu activated successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Emergency menu activation failed:', error);
        return false;
    }
}

// Run initial diagnostics
const diagnosticsResult = emergencyQRDiagnostics();

// Make functions available globally
window.emergencyQRDiagnostics = emergencyQRDiagnostics;
window.emergencySlugFix = emergencySlugFix;
window.emergencyActivateMenu = emergencyActivateMenu;

console.log('🚨 EMERGENCY SCRIPT LOADED - Available functions:');
console.log('   emergencyQRDiagnostics() - Run full diagnostics');
console.log('   emergencySlugFix() - Fix slug mismatch');
console.log('   emergencyActivateMenu() - Activate menu');

// Return initial result
diagnosticsResult; 
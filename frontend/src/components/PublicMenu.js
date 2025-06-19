import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

// Import Template Components
import ModernDarkTemplate from './templates/ModernDarkTemplate'; // Premium
import ElegantLightTemplate from './templates/ElegantLightTemplate'; // Premium
import DefaultFallbackTemplate from './templates/DefaultFallbackTemplate';
import CafeCasualTemplate from './templates/CafeCasualTemplate';
import ElegantDarkBaseTemplate from './templates/ElegantDarkBaseTemplate';
import SimpleLightTemplate from './templates/SimpleLightTemplate';
import ModernMinimalBaseTemplate from './templates/ModernMinimalBaseTemplate';


// Placeholder icons (can be moved or removed if templates handle their own icons)
const SwapIcon = () => ( // This might not be needed here anymore if templates handle nav
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);
// SearchIcon might be part of a specific template's functionality or a global search bar
// const SearchIcon = () => ( ... );


// Helper to parse settings safely (can be moved to a utils file)
const parseSettings = (settingsString) => {
  try {
    return JSON.parse(settingsString || '{}');
  } catch (e) {
    console.error("Error parsing template settings in PublicMenu:", e);
    return {};
  }
};

const PublicMenu = () => {
    const { restaurantSlug } = useParams();
    const [menuData, setMenuData] = useState(null); // Will store { restaurant, menu, template }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [activeCategory, setActiveCategory] = useState(null); // Template will handle its own navigation state
    // const [searchTerm, setSearchTerm] = useState(''); // Template will handle search
    // const [selectedLang, setSelectedLang] = useState('en'); 
    const [currentVisitId, setCurrentVisitId] = useState(null);
    const visitLoggedRef = useRef(false); // Ref to track if visit has been logged

    // --- Data Fetching & Visit Logging ---
    useEffect(() => {
        const fetchMenuData = async () => {
            if (!restaurantSlug) { setError('Restaurant identifier is missing.'); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const response = await api.get(`/public/menu/${restaurantSlug}`);
                if (response.data?.restaurant && response.data?.menu && response.data?.template) {
                    // Ensure customization_settings is an object
                    let templateData = response.data.template;
                    if (templateData && typeof templateData.customization_settings === 'string') {
                        templateData.customization_settings = parseSettings(templateData.customization_settings);
                    } else if (templateData && !templateData.customization_settings) {
                        templateData.customization_settings = {}; // Ensure it's an object
                    }
                    
                    setMenuData({ ...response.data, template: templateData });
                    
                    // Log visit only once per component mount/load
                    if (!visitLoggedRef.current) {
                        try {
                            console.log("[PublicMenu] Attempting to log menu visit...");
                            const visitResponse = await api.post('/analytics/log-visit', {
                                menuId: response.data.menu.id,
                                restaurantId: response.data.restaurant.id
                            });
                            setCurrentVisitId(visitResponse.data?.visitId || null);
                            visitLoggedRef.current = true; // Mark as logged
                            console.log("[PublicMenu] Menu visit logged successfully, visit ID:", visitResponse.data?.visitId);
                        } catch (logError) { 
                            console.error("Failed to log menu visit:", logError); 
                            // Still set ref to true to prevent retries on this load even if logging failed
                            visitLoggedRef.current = true; 
                        }
                    }
                } else { throw new Error("Invalid menu data structure from API."); }
            } catch (err) { setError(err.response?.data?.message || 'Failed to load menu.'); }
            finally { setLoading(false); }
        };
        fetchMenuData();
    }, [restaurantSlug]);

    // Item view logging can remain here or be moved to individual templates if they handle item visibility differently
    useEffect(() => {
        if (currentVisitId && !loading && !error && menuData?.menu) {
            const allItemIds = [
                ...(menuData.menu.categories?.flatMap(cat => cat.items?.map(item => item.id)) || []),
                ...(menuData.menu.uncategorizedItems?.map(item => item.id) || [])
            ].filter(id => id != null);

            if (allItemIds.length > 0) {
                allItemIds.forEach(itemId => {
                    api.post('/analytics/log-item-view', { itemId, visitId: currentVisitId })
                       .catch(err => console.error(`[PublicMenu] Failed to log view for item ${itemId}:`, err));
                });
            }
        }
    }, [currentVisitId, loading, error, menuData]);


    // --- Render Logic ---
    // Loading State
    if (loading) { /* ... loading UI ... */ }
    if (error) { /* ... error UI ... */ }
    if (!menuData || !menuData.restaurant || !menuData.menu || !menuData.template) { 
        // This check should ideally catch the issue, but let's add one more safeguard
        console.error("[PublicMenu] Render attempted with invalid menuData structure:", menuData);
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Menu Data Error</h2>
                <p className="text-gray-600">Could not load complete menu information.</p>
            </div>
        );
     }

    // --- If we reach here, menuData and its core properties should be valid ---
    const { restaurant, menu, template } = menuData; 
    
    // Ensure customization_settings is an object before accessing identifier
    const customSettings = template?.customization_settings || {}; 
    console.log("[PublicMenu] Parsed customSettings:", customSettings); // Log the parsed settings
    const templateIdentifier = customSettings?.identifier || 'default-template'; // Fallback identifier
    console.log("[PublicMenu] Determined templateIdentifier:", templateIdentifier); // Log the identifier

    // Pass necessary data to the chosen template
    const templateProps = {
        menuData: menu, // Pass the menu object directly
        restaurantData: restaurant,
        templateData: template, // Pass the full template object
        baseApiUrl: api.defaults.baseURL.replace('/api', ''), // Construct and pass base URL
        // Common props that templates might need:
        // selectedLang, 
        // handleLangChange, 
        // searchTerm, 
        // handleSearch,
        // activeCategory,
        // handleCategoryClick,
        // categoryRefs,
    };
    
    // --- Render Selected Template ---
    switch (templateIdentifier) {
        case 'modern-dark':
            return <ModernDarkTemplate {...templateProps} />;
        case 'elegant-light': // Premium
            return <ElegantLightTemplate {...templateProps} />;
        case 'cafe-casual':
            return <CafeCasualTemplate {...templateProps} />;
        case 'elegant-dark': // Non-premium dark
            return <ElegantDarkBaseTemplate {...templateProps} />;
        case 'simple-light':
            return <SimpleLightTemplate {...templateProps} />;
        case 'modern-minimal':
            return <ModernMinimalBaseTemplate {...templateProps} />;
        // Add cases for 'classic-light', 'classic-dark' if/when components are created
        default:
            console.warn(`[PublicMenu] Template identifier "${templateIdentifier}" not found or component not implemented. Using DefaultFallbackTemplate.`);
            return <DefaultFallbackTemplate {...templateProps} />;
    }
};

export default PublicMenu;

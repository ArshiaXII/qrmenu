// import React from 'react'; // Not needed in React 17+
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// i18n
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout
// import DashboardLayout from './components/Layout/DashboardLayout'; // Old layout
// import NewDashboardLayout from './components/Layout/NewDashboardLayout'; // Use New basic layout
import DashboardLayout from './components/Layout/DashboardLayout'; // Use the new layout
import ProtectedRouteWrapper from './components/ProtectedRouteWrapper';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import DashboardOverview from './pages/DashboardOverview'; // Not used anymore
// import ManageMenu from './pages/ManageMenu'; // Old one
// import NewManageMenuPage from './pages/NewManageMenuPage'; // Replaced by MenuManagementPage
import MenuEditorPage from './pages/MenuEditorPage';
import ManageTemplates from './pages/ManageTemplates'; // This will be 'Appearance'
import ManageQrCode from './pages/ManageQrCode';
// import ViewAnalytics from './pages/ViewAnalytics'; // Not used anymore
import ManageBilling from './pages/ManageBilling';
// import RestaurantSettings from './pages/RestaurantSettings'; // Old restaurant settings
import RestaurantSettings from './components/RestaurantSettings/RestaurantSettings'; // PHASE 2: New restaurant settings with custom slugs
// import PublicMenu from './components/PublicMenu'; // Not used anymore
// Import new placeholder pages
import ReportsPage from './pages/ReportsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import OrdersPage from './pages/OrdersPage';
import OrderSettingsPage from './pages/OrderSettingsPage';
import ReservationsPage from './pages/ReservationsPage';
import ReservationSettingsPage from './pages/ReservationSettingsPage';
import CustomersPage from './pages/CustomersPage';
import PromotionsPage from './pages/PromotionsPage';
import DiscountCodesPage from './pages/DiscountCodesPage';
import InteractionSettingsPage from './pages/InteractionSettingsPage';
import ReviewsPage from './pages/ReviewsPage';
import FeedbackPage from './pages/FeedbackPage';
import TranslationCenterPage from './pages/TranslationCenterPage';
import MarketplacePage from './pages/MarketplacePage';
import MenuCreationPage from './components/MenuCreation/MenuCreationPage';
import MenuCreationDemo from './pages/MenuCreationDemo';
import DesignCustomizationPage from './components/DesignCustomization/DesignCustomizationPage';
import DesignCustomizationDemo from './pages/DesignCustomizationDemo';
import DashboardPage from './components/Dashboard/DashboardPage';
import PublicMenuView from './components/PublicMenu/PublicMenuView';
import MenuManagementPage from './pages/MenuManagementPage';
import { MenuProvider } from './contexts/MenuContext';
// import Sidebar from './components/Layout/Sidebar'; // Ensure this is commented out or removed if not used globally

// Protected Route using AuthContext (for basic auth check)
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Helper component for root redirect logic
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  return isAuthenticated ? (
    <Navigate to="/dashboard/overview" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <AuthProvider>
          <MenuProvider>
            <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/menu/:restaurantSlug" element={<PublicMenuView />} />
          <Route path="/demo/menu-creation" element={<MenuCreationDemo />} />
          <Route path="/demo/design-customization" element={<DesignCustomizationDemo />} />
          <Route path="/demo/dashboard" element={<DashboardPage />} />
          <Route path="/demo/public-menu" element={<PublicMenuView />} />

          {/* Protected Dashboard Routes - Use the Wrapper */}
          <Route element={<ProtectedRoute />}> {/* Basic auth check */}
            <Route element={<ProtectedRouteWrapper />}> {/* Onboarding/profile check */}
              {/* Use NewDashboardLayout for all routes under /dashboard */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<DashboardPage />} /> {/* FineDine main dashboard */}
                <Route path="reports" element={<ReportsPage />} />
                <Route path="suggestions" element={<SuggestionsPage />} />

                <Route path="orders/all" element={<OrdersPage />} />
                <Route path="orders/settings" element={<OrderSettingsPage />} />
                {/* Optional: redirect for base /orders */}
                <Route path="orders" element={<Navigate to="all" replace />} />

                <Route path="reservations/all" element={<ReservationsPage />} />
                <Route path="reservations/settings" element={<ReservationSettingsPage />} />
                <Route path="reservations" element={<Navigate to="all" replace />} />

                <Route path="interaction/customers" element={<CustomersPage />} />
                <Route path="interaction/promotions" element={<PromotionsPage />} />
                <Route path="interaction/discounts" element={<DiscountCodesPage />} />
                <Route path="interaction/settings" element={<InteractionSettingsPage />} />
                <Route path="interaction" element={<Navigate to="customers" replace />} />

                <Route path="reviews" element={<ReviewsPage />} />
                {/* Main Menu Management Dashboard */}
                <Route path="menu-management" element={<MenuManagementPage />} />
                {/* Menu Creation & Editing Routes */}
                <Route path="menu/create" element={<MenuCreationPage />} />
                <Route path="menu/customize" element={<DesignCustomizationPage />} />
                <Route path="menu/:menuId/edit" element={<MenuEditorPage />} />
                {/* Legacy route redirect */}
                <Route path="menu" element={<Navigate to="menu-management" replace />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="translation" element={<TranslationCenterPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />

                {/* Settings Sub-routes - existing pages are reused where logical */}
                <Route path="settings/templates" element={<ManageTemplates />} /> {/* Appearance */}
                <Route path="settings/restaurant" element={<RestaurantSettings />} /> {/* Specific Restaurant Settings */}
                <Route path="settings/billing" element={<ManageBilling />} />
                <Route path="settings/qrcode" element={<ManageQrCode />} />
                 {/* Redirect for base /settings to a default settings page, e.g., restaurant settings */}
                <Route path="settings" element={<Navigate to="restaurant" replace />} />

                {/* Old direct routes - keep or remove based on sidebar structure */}
                {/* <Route path="templates" element={<ManageTemplates />} /> */}
                {/* <Route path="qrcode" element={<ManageQrCode />} /> */}
                {/* <Route path="analytics" element={<ViewAnalytics />} /> */}
                {/* <Route path="billing" element={<ManageBilling />} /> */}

              </Route>
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="/" element={<RootRedirect />} />
          {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
          </Routes>
            </Router>
          </MenuProvider>
        </AuthProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}

export default App;

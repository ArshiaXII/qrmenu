import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout Components
import DashboardLayout from './components/Layout/DashboardLayout';

// Page Components
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardOverview from './pages/DashboardOverview';
import RestaurantSettings from './pages/RestaurantSettings';

// Dashboard Content Components
import MenuManagementContent from './components/Dashboard/MenuManagementContent';
import MenuCreationPage from './components/MenuCreation/MenuCreationPage';
import DesignCustomizationPage from './components/DesignCustomization/DesignCustomizationPage';

// Public Components
import PublicMenuView from './components/PublicMenu/PublicMenuView';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteWrapper from './components/ProtectedRouteWrapper';

// Utility Components
import RootRedirect from './components/RootRedirect';

// i18n
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function App() {
  return (
    <HelmetProvider>
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

                  {/* Protected Dashboard Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<ProtectedRouteWrapper />}>
                      <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<DashboardOverview />} />

                        {/* Menu Management */}
                        <Route path="menu-management" element={<MenuManagementContent />} />
                        <Route path="menu/create" element={<MenuCreationPage />} />
                        <Route path="menu/customize" element={<DesignCustomizationPage />} />

                        {/* Settings */}
                        <Route path="settings" element={<Navigate to="restaurant" replace />} />
                        <Route path="settings/restaurant" element={<RestaurantSettings />} />
                      </Route>
                    </Route>
                  </Route>

                  {/* Root Redirect */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </MenuProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;

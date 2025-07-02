import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/NewAuthContext';
import RestaurantSettings from './components/RestaurantSettings';
import MenuCreationPage from './components/MenuCreation/NewMenuCreationPage';
import PublicMenuView from './components/PublicMenu/NewPublicMenuView';

const TestApp = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="test-app">
          <nav className="test-nav">
            <Link to="/settings">Restaurant Settings</Link>
            <Link to="/menu-editor">Menu Editor</Link>
            <Link to="/menu/test-restaurant">Public Menu (Test)</Link>
          </nav>

          <main className="test-content">
            <Routes>
              <Route path="/settings" element={<RestaurantSettings />} />
              <Route path="/menu-editor" element={<MenuCreationPage />} />
              <Route path="/menu/:slug" element={<PublicMenuView />} />
              <Route path="/" element={
                <div className="test-home">
                  <h1>QR Menu Platform - Test System</h1>
                  <p>This is a simplified test system following the three absolute rules:</p>
                  <ol>
                    <li><strong>RULE 1:</strong> Unique restaurant names with slug-based URLs</li>
                    <li><strong>RULE 2:</strong> User data isolation</li>
                    <li><strong>RULE 3:</strong> Dashboard changes reflect on public menu</li>
                  </ol>
                  <div className="test-actions">
                    <Link to="/settings" className="test-button">Start with Restaurant Settings</Link>
                  </div>
                </div>
              } />
            </Routes>
          </main>

          <style jsx>{`
            .test-app {
              min-height: 100vh;
              background: #f9fafb;
            }

            .test-nav {
              background: white;
              padding: 16px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              gap: 24px;
            }

            .test-nav a {
              color: #8b5cf6;
              text-decoration: none;
              font-weight: 500;
            }

            .test-nav a:hover {
              text-decoration: underline;
            }

            .test-content {
              padding: 20px;
            }

            .test-home {
              max-width: 600px;
              margin: 0 auto;
              text-align: center;
              padding: 40px 20px;
            }

            .test-home h1 {
              color: #374151;
              margin-bottom: 16px;
            }

            .test-home p {
              color: #6b7280;
              margin-bottom: 24px;
            }

            .test-home ol {
              text-align: left;
              max-width: 400px;
              margin: 0 auto 32px;
              color: #374151;
            }

            .test-home li {
              margin-bottom: 8px;
            }

            .test-button {
              display: inline-block;
              background: #8b5cf6;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
            }

            .test-button:hover {
              background: #7c3aed;
            }
          `}</style>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default TestApp;

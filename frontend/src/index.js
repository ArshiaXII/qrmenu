import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global styles
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { HelmetProvider } from 'react-helmet-async'; // Import HelmetProvider
import ErrorBoundary from './components/ErrorBoundary';

// Fix for Web3/Ethereum extension conflicts
// Prevent browser extensions from breaking the app
try {
  // Store original defineProperty method
  const originalDefineProperty = Object.defineProperty;

  // Override defineProperty to catch ethereum redefinition attempts
  Object.defineProperty = function(obj, prop, descriptor) {
    if (obj === window && prop === 'ethereum') {
      console.warn('🔧 Preventing ethereum property redefinition by browser extension');
      // Allow the extension to set ethereum but don't throw error
      try {
        return originalDefineProperty.call(this, obj, prop, {
          ...descriptor,
          configurable: true,
          writable: true
        });
      } catch (e) {
        console.warn('⚠️ Ethereum property conflict handled gracefully');
        return obj;
      }
    }
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };

  // Restore original defineProperty after a short delay
  setTimeout(() => {
    Object.defineProperty = originalDefineProperty;
    console.log('🔧 Restored original Object.defineProperty');
  }, 2000);

} catch (error) {
  console.warn('⚠️ Web3 extension conflict prevention failed, continuing anyway:', error.message);
}

// Global error handler for Web3/Ethereum extension errors
window.addEventListener('error', function(event) {
  if (event.error && event.error.message && event.error.message.includes('ethereum')) {
    console.warn('🔧 Caught and suppressed Web3/Ethereum extension error:', event.error.message);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Handle unhandled promise rejections from Web3 extensions
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message && event.reason.message.includes('ethereum')) {
    console.warn('🔧 Caught and suppressed Web3/Ethereum promise rejection:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider> {/* Wrap App with HelmetProvider */}
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register(); // Register the service worker

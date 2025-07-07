import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import menuService from '../services/menuService';

// Define steps
const STEPS = {
  WELCOME: 1,
  RESTAURANT_DETAILS: 2,
  // LOGO_UPLOAD: 3, // Combine with details for simplicity?
  // FIRST_ITEMS: 4, // Can be skipped, user can do this later
  // TEMPLATE_CHOICE: 5, // Can be skipped, default is fine
  FINISH: 3, 
};

const OnboardingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // State for Restaurant Details step
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    currency_code: 'USD',
    // logo_path will be handled separately if we add upload here
  });

  // Name validation states (like Instagram username validation)
  const [nameValidation, setNameValidation] = useState({ isValid: true, message: '' });
  const [isCheckingName, setIsCheckingName] = useState(false);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleRestaurantDetailsChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData({ ...restaurantData, [name]: value });

    // Real-time name validation (like Instagram)
    if (name === 'name') {
      setError(''); // Clear general error

      if (!value.trim()) {
        setNameValidation({ isValid: true, message: '' });
        setIsCheckingName(false);
        return;
      }

      // Show checking state
      setIsCheckingName(true);
      setNameValidation({ isValid: true, message: '' });

      // Debounce validation check (like Instagram)
      setTimeout(async () => {
        try {
          const isUnique = await menuService.checkRestaurantNameUnique(value.trim());
          if (!isUnique) {
            setNameValidation({
              isValid: false,
              message: 'Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.'
            });
          } else {
            setNameValidation({ isValid: true, message: 'Bu ad kullanılabilir!' });
          }
        } catch (error) {
          console.error('Error checking name uniqueness:', error);
          setNameValidation({
            isValid: false,
            message: 'Ad kontrolü yapılırken hata oluştu.'
          });
        } finally {
          setIsCheckingName(false);
        }
      }, 500); // 500ms debounce
    }
  };

  const handleSaveRestaurantDetails = async () => {
    setIsLoading(true);
    setError('');

    // Validation checks
    if (!restaurantData.name.trim()) {
      setError('Restaurant name is required.');
      setIsLoading(false);
      return;
    }

    // Check if name validation failed
    if (!nameValidation.isValid) {
      setError('Please fix the restaurant name issue before continuing.');
      setIsLoading(false);
      return;
    }

    // Double-check name uniqueness before saving
    try {
      const isUnique = await menuService.checkRestaurantNameUnique(restaurantData.name.trim());
      if (!isUnique) {
        setError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setError('Name validation failed. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Onboarding: Saving restaurant details to localStorage...");

      // Create restaurant data for localStorage
      const restaurantInfo = {
        name: restaurantData.name.trim(),
        description: restaurantData.description || '',
        currency: restaurantData.currency_code || 'TRY',
        status: 'active',
        userId: user.id,
        onboarding_completed: true
      };

      // Save using menuService
      const result = await menuService.saveRestaurantName(restaurantInfo.name);

      if (result) {
        console.log("Onboarding: Restaurant details saved successfully.");
        handleNext(); // Move to finish step
      } else {
        throw new Error('Failed to save restaurant details');
      }
    } catch (err) {
      console.error("Error saving restaurant details during onboarding:", err);
      setError(err.message || 'Failed to save details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Call the onComplete prop which should likely reload or redirect
    if (onComplete) {
      onComplete(); 
    } else {
        // Fallback: reload the page if no handler provided
        window.location.reload(); 
    }
  };


  // --- Render Steps ---

  const renderWelcomeStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to QR Menu!</h2>
      <p className="text-gray-600 mb-8">Let's get your restaurant set up quickly.</p>
      <button 
        onClick={handleNext}
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Get Started
      </button>
    </div>
  );

  const renderRestaurantDetailsStep = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Tell us about your restaurant</h2>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); handleSaveRestaurantDetails(); }} className="space-y-4">
         <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Restaurant Name *
              <span className="text-xs text-gray-500">(This will be your unique URL)</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={restaurantData.name}
              onChange={handleRestaurantDetailsChange}
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                !nameValidation.isValid
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : nameValidation.message && nameValidation.isValid
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="e.g., Lezzet Durağı"
            />

            {/* Validation Messages (Instagram-style) */}
            {isCheckingName && (
              <div className="mt-1 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-2"></div>
                Checking availability...
              </div>
            )}
            {!isCheckingName && nameValidation.message && (
              <div className={`mt-1 text-sm ${nameValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {nameValidation.isValid ? '✅' : '❌'} {nameValidation.message}
              </div>
            )}
            {restaurantData.name && !isCheckingName && nameValidation.isValid && (
              <div className="mt-1 text-xs text-gray-500">
                Your URL will be: <span className="font-mono bg-gray-100 px-1 rounded">
                  /menu/{restaurantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                </span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description (Optional)</label>
            <textarea name="description" id="description" value={restaurantData.description} onChange={handleRestaurantDetailsChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
           <div>
            <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700">Default Currency</label>
            <select id="currency_code" name="currency_code" value={restaurantData.currency_code} onChange={handleRestaurantDetailsChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="RUB">RUB (₽)</option>
            </select>
            </div>
            {/* TODO: Add Logo Upload Step later if desired */}
         <div className="pt-4 flex justify-end">
             <button
               type="submit"
               disabled={isLoading || !nameValidation.isValid || isCheckingName || !restaurantData.name.trim()}
               className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
              {isLoading ? 'Saving...' : isCheckingName ? 'Checking...' : 'Next'}
            </button>
         </div>
      </form>
    </div>
  );

   const renderFinishStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Complete!</h2>
      <p className="text-gray-600 mb-8">Your basic restaurant profile is saved. You can now start adding menu items and customizing your templates.</p>
      <button 
        onClick={handleFinish}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Go to Dashboard
      </button>
    </div>
  );


  return (
     <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
            {/* Progress Indicator (Optional) */}
            {/* <div className="mb-6">Progress... {currentStep} / {Object.keys(STEPS).length}</div> */}

            {currentStep === STEPS.WELCOME && renderWelcomeStep()}
            {currentStep === STEPS.RESTAURANT_DETAILS && renderRestaurantDetailsStep()}
            {currentStep === STEPS.FINISH && renderFinishStep()}
            
        </div>
     </div>
  );
};

export default OnboardingWizard;

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import menuService from '../services/menuService';

// Define steps
const STEPS = {
  WELCOME: 1,
  RESTAURANT_DETAILS: 2,
  CONTACT_INFO: 3,
  DEMO_MENU: 4,
  FINISH: 5,
};

const OnboardingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoNavCountdown, setAutoNavCountdown] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for Restaurant Details step
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    currency_code: 'USD',
    // logo_path will be handled separately if we add upload here
  });

  // State for Contact Info step
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    address: ''
  });

  // State for Demo Menu step
  const [demoMenuCreated, setDemoMenuCreated] = useState(false);

  // Name validation states (like Instagram username validation)
  const [nameValidation, setNameValidation] = useState({ isValid: true, message: '' });
  const [isCheckingName, setIsCheckingName] = useState(false);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });
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
        email: contactData.email || '',
        phone: contactData.phone || '',
        address: contactData.address || '',
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

  const handleSaveContactInfo = () => {
    // Contact info is optional, just move to next step
    handleNext();
  };

  const handleCreateDemoMenu = async () => {
    setIsLoading(true);
    try {
      // Create a demo menu with sample items
      const demoMenu = {
        sections: [
          {
            id: 'section-1',
            title: 'Ana Yemekler',
            description: 'Lezzetli ana yemeklerimiz',
            order: 1,
            items: [
              {
                id: 'item-1',
                title: 'Izgara Köfte',
                description: 'Özel baharatlarla hazırlanmış lezzetli köfte',
                price: '45.00',
                order: 1,
                isAvailable: true
              },
              {
                id: 'item-2',
                title: 'Tavuk Şiş',
                description: 'Marine edilmiş tavuk göğsü',
                price: '38.00',
                order: 2,
                isAvailable: true
              }
            ]
          },
          {
            id: 'section-2',
            title: 'İçecekler',
            description: 'Serinletici içecekler',
            order: 2,
            items: [
              {
                id: 'item-3',
                title: 'Ayran',
                description: 'Ev yapımı ayran',
                price: '8.00',
                order: 1,
                isAvailable: true
              }
            ]
          }
        ]
      };

      // Save demo menu (this would be implemented in menuService)
      console.log('Demo menu created:', demoMenu);
      setDemoMenuCreated(true);
      handleNext();
    } catch (error) {
      console.error('Error creating demo menu:', error);
      setError('Demo menü oluşturulurken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      console.log("Onboarding: Completing onboarding and saving completion status...");

      // Get current user and ensure restaurant data exists
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const restaurantSlug = currentUser.restaurantSlug || `restaurant-${currentUser.id}`;

      console.log("Onboarding: Current user:", currentUser);
      console.log("Onboarding: Using restaurant slug:", restaurantSlug);

      // Ensure restaurant data exists
      menuService.ensureRestaurantDataExists(restaurantSlug, currentUser);

      // Get current restaurant data (should exist now)
      const currentRestaurant = menuService.getCurrentUserRestaurant();
      console.log("Onboarding: Restaurant data after creation:", currentRestaurant);

      if (currentRestaurant) {
        // Update the restaurant data to mark onboarding as completed
        const storageData = menuService.getStorageData();
        const actualSlug = currentRestaurant.slug;

        if (storageData.restaurants[actualSlug]) {
          storageData.restaurants[actualSlug].restaurant.onboarding_completed = true;
          menuService.saveStorageData(storageData);
          console.log("Onboarding: Completion status saved successfully");
        } else {
          console.error("Onboarding: Restaurant data still not found after creation");
        }
      } else {
        console.error("Onboarding: Failed to create restaurant data");
      }

      // DIRECT NAVIGATION - Use window.location since it works reliably
      console.log("Onboarding: Navigating directly to dashboard using window.location...");

      // Use window.location.replace for immediate navigation (same as auto-timer)
      window.location.replace('/dashboard/overview');

    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Even if there's an error, still navigate to dashboard using reliable method
      console.log("Onboarding: Error occurred, but still navigating to dashboard...");
      window.location.replace('/dashboard/overview');
    }
  };

  // Auto-navigation timer with countdown
  useEffect(() => {
    if (currentStep === STEPS.FINISH) {
      console.log("Finish step reached, setting up auto-navigation timer...");
      setAutoNavCountdown(10);

      const countdownInterval = setInterval(() => {
        setAutoNavCountdown(prev => {
          if (prev <= 1) {
            console.log("Auto-navigation timer triggered - forcing navigation to dashboard");
            window.location.replace('/dashboard/overview');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [currentStep]);

  // --- Render Steps ---

  const renderWelcomeStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to QR Menu!</h2>
      <p className="text-gray-600 mb-8">Let's get your restaurant set up quickly.</p>

      <div className="space-y-4">
        <button
          onClick={handleNext}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Restaurant
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/login'}
          className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Login to Existing Account
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Don't have an account?
          <button
            onClick={() => window.location.href = '/register'}
            className="ml-1 text-indigo-600 hover:text-indigo-500 underline"
          >
            Sign up here
          </button>
        </p>
      </div>
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

  const renderContactInfoStep = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h2>
      <p className="text-gray-600 mb-6">Add your contact details so customers can reach you (optional)</p>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); handleSaveContactInfo(); }} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            id="email"
            value={contactData.email}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="restaurant@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={contactData.phone}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="+90 212 555 0123"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            id="address"
            value={contactData.address}
            onChange={handleContactInfoChange}
            rows="2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Restaurant address..."
          />
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(STEPS.RESTAURANT_DETAILS)}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );

  const renderDemoMenuStep = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Your First Menu</h2>
      <p className="text-gray-600 mb-6">We'll create a demo menu with sample items to get you started</p>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Demo Menu Preview</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-gray-800">Ana Yemekler</h4>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Izgara Köfte - Özel baharatlarla hazırlanmış</span>
                <span className="font-medium">₺45.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tavuk Şiş - Marine edilmiş tavuk göğsü</span>
                <span className="font-medium">₺38.00</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-gray-800">İçecekler</h4>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Ayran - Ev yapımı ayran</span>
                <span className="font-medium">₺8.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(STEPS.CONTACT_INFO)}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back
        </button>
        <button
          onClick={handleCreateDemoMenu}
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Menu...' : 'Create Demo Menu'}
        </button>
      </div>
    </div>
  );

   const renderFinishStep = () => {
     return (
       <div className="text-center">
           <div className="mb-6">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
               <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Complete!</h2>
             <p className="text-gray-600 mb-8">
               Your restaurant profile has been created successfully. You can now start building your digital menu and customizing your QR menu experience.
             </p>
           </div>

           <div className="space-y-4">
             <button
               onClick={handleFinish}
               className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
             >
               Go to Dashboard
             </button>

             {autoNavCountdown > 0 && (
               <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                 <p className="text-sm text-blue-800">
                   Automatically redirecting in <strong>{autoNavCountdown}</strong> seconds...
                 </p>
               </div>
             )}
           </div>
         </div>
     );
   };


  return (
     <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
            {/* Progress Indicator (Optional) */}
            {/* <div className="mb-6">Progress... {currentStep} / {Object.keys(STEPS).length}</div> */}

            {currentStep === STEPS.WELCOME && renderWelcomeStep()}
            {currentStep === STEPS.RESTAURANT_DETAILS && renderRestaurantDetailsStep()}
            {currentStep === STEPS.CONTACT_INFO && renderContactInfoStep()}
            {currentStep === STEPS.DEMO_MENU && renderDemoMenuStep()}
            {currentStep === STEPS.FINISH && renderFinishStep()}
            
        </div>
     </div>
  );
};

export default OnboardingWizard;

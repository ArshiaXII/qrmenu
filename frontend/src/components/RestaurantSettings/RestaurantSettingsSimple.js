import React, { useState, useEffect } from 'react';
import menuService from '../../services/menuServiceSimple';

const RestaurantSettings = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load current restaurant name
  useEffect(() => {
    const currentData = menuService.getCurrentUserRestaurant();
    if (currentData) {
      setRestaurantName(currentData.name || '');
    }
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      showMessage('Restoran adı gereklidir.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Check if name is unique
      const isUnique = await menuService.checkRestaurantNameUnique(restaurantName.trim());
      
      if (!isUnique) {
        showMessage('Bu isim zaten kullanılıyor.', 'error');
        setIsLoading(false);
        return;
      }

      // Save the restaurant name (this will generate the slug automatically)
      await menuService.saveRestaurantName(restaurantName.trim());
      
      showMessage('Restoran adı başarıyla kaydedildi!', 'success');
    } catch (error) {
      showMessage('Kaydetme sırasında bir hata oluştu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Restoran Ayarları</h1>
      
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="restaurantName" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Restoran Adı *
          </label>
          <input
            type="text"
            id="restaurantName"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Restoran adınızı girin"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantSettings;

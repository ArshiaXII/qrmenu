import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/NewAuthContext';
import menuService from '../services/menuService';
import './RestaurantSettings/RestaurantSettings.css';

const RestaurantSettings = () => {
  const { user, currentRestaurant, updateRestaurant } = useAuth();
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current restaurant name
  useEffect(() => {
    if (currentRestaurant) {
      setRestaurantName(currentRestaurant.name);
    }
  }, [currentRestaurant]);

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      setError('Restoran adı gereklidir');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // RULE 1: Check if name is taken by another restaurant
      const currentSlug = currentRestaurant?.slug;
      const isNameUnique = await menuService.checkRestaurantNameUnique(restaurantName.trim(), currentSlug);

      if (!isNameUnique) {
        setError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
        setLoading(false);
        return;
      }

      // If no current restaurant, create new one
      if (!currentRestaurant) {
        const newRestaurant = menuService.createDefaultRestaurant(user.id, restaurantName.trim());
        const result = menuService.updateRestaurant(null, newRestaurant);
        
        if (result.success) {
          // Load the updated restaurant data
          const updatedRestaurant = menuService.getRestaurantForUser(user.id);
          updateRestaurant(updatedRestaurant);
          setSuccess('Restoran başarıyla oluşturuldu!');
        }
      } else {
        // Update existing restaurant
        const updatedData = { ...currentRestaurant, name: restaurantName.trim() };
        const result = menuService.updateRestaurant(currentRestaurant.slug, updatedData);
        
        if (result.success) {
          // Load the updated restaurant data
          const updatedRestaurant = menuService.getRestaurantForUser(user.id);
          updateRestaurant(updatedRestaurant);
          setSuccess('Restoran adı başarıyla güncellendi!');
        }
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      setError('Restoran kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewUrl = () => {
    if (!restaurantName.trim()) return '';
    const slug = menuService.generateSlug(restaurantName.trim());
    return `${window.location.origin}/menu/${slug}`;
  };

  return (
    <div className="restaurant-settings">
      <div className="settings-card">
        <h2>Restoran Ayarları</h2>
        
        <div className="form-group">
          <label htmlFor="restaurantName">Restoran Adı *</label>
          <input
            type="text"
            id="restaurantName"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Restoran adınızı girin"
            disabled={loading}
          />
          <small className="help-text">
            Bu ad benzersiz olmalıdır ve herkese açık menü URL'inizde kullanılacaktır.
          </small>
        </div>

        {restaurantName.trim() && (
          <div className="url-preview">
            <label>Herkese Açık Menü URL'niz:</label>
            <div className="url-display">
              <code>{generatePreviewUrl()}</code>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={loading || !restaurantName.trim()}
            className="save-button"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        {currentRestaurant && (
          <div className="current-info">
            <h3>Mevcut Bilgiler</h3>
            <p><strong>Restoran Adı:</strong> {currentRestaurant.name}</p>
            <p><strong>URL Slug:</strong> {currentRestaurant.slug}</p>
            <p><strong>Durum:</strong> {currentRestaurant.status === 'active' ? 'Aktif' : 'Taslak'}</p>
            <p><strong>Herkese Açık URL:</strong> 
              <a href={`/menu/${currentRestaurant.slug}`} target="_blank" rel="noopener noreferrer">
                {window.location.origin}/menu/{currentRestaurant.slug}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSettings;

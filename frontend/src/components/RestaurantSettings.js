import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/NewAuthContext';
import menuService from '../services/menuService';

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
      const isNameTaken = menuService.isNameTaken(restaurantName.trim(), currentSlug);
      
      if (isNameTaken) {
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

      <style jsx>{`
        .restaurant-settings {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .settings-card {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
        }

        input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .help-text {
          display: block;
          margin-top: 4px;
          color: #6b7280;
          font-size: 14px;
        }

        .url-preview {
          margin-bottom: 20px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .url-display {
          margin-top: 8px;
        }

        .url-display code {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          font-family: monospace;
          word-break: break-all;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        .success-message {
          background: #f0fdf4;
          color: #16a34a;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #bbf7d0;
        }

        .save-button {
          background: #8b5cf6;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-button:hover:not(:disabled) {
          background: #7c3aed;
        }

        .save-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .current-info {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .current-info h3 {
          margin-bottom: 16px;
          color: #374151;
        }

        .current-info p {
          margin-bottom: 8px;
          color: #6b7280;
        }

        .current-info a {
          color: #8b5cf6;
          text-decoration: none;
        }

        .current-info a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RestaurantSettings;

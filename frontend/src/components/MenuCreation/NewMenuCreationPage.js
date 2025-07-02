import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/NewAuthContext';
import menuService from '../../services/menuService';

const MenuCreationPage = () => {
  const { currentRestaurant, updateRestaurant } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current menu data
  useEffect(() => {
    if (currentRestaurant?.menu?.sections) {
      setSections(currentRestaurant.menu.sections);
    }
  }, [currentRestaurant]);

  // Add new section
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'Yeni Bölüm',
      description: 'Bölüm açıklaması',
      items: []
    };
    setSections([...sections, newSection]);
  };

  // Update section
  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, [field]: value }
        : section
    ));
  };

  // Delete section
  const deleteSection = (sectionId) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  // Add new item to section
  const addItem = (sectionId) => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: 'Yeni Ürün',
      description: 'Ürün açıklaması',
      price: '0.00',
      isAvailable: true
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, items: [...(section.items || []), newItem] }
        : section
    ));
  };

  // Update item
  const updateItem = (sectionId, itemId, field, value) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: (section.items || []).map(item =>
              item.id === itemId
                ? { ...item, [field]: value }
                : item
            )
          }
        : section
    ));
  };

  // Delete item
  const deleteItem = (sectionId, itemId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, items: (section.items || []).filter(item => item.id !== itemId) }
        : section
    ));
  };

  // Save menu
  const saveMenu = async () => {
    if (!currentRestaurant) {
      setError('Restoran bulunamadı');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const menuData = { sections };
      const result = menuService.saveMenuContent(menuData);
      
      if (result.success) {
        // Update restaurant in context
        const updatedRestaurant = menuService.getRestaurantForUser(currentRestaurant.ownerId);
        updateRestaurant(updatedRestaurant);
        setSuccess('Menü başarıyla kaydedildi!');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      setError('Menü kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="menu-creation-error">
        <h2>Restoran Bulunamadı</h2>
        <p>Menü oluşturmak için önce restoran ayarlarınızı tamamlayın.</p>
      </div>
    );
  }

  return (
    <div className="menu-creation-page">
      <div className="page-header">
        <h1>Menü Düzenle</h1>
        <p>Restoran: <strong>{currentRestaurant.name}</strong></p>
      </div>

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

      <div className="menu-editor">
        {sections.map((section) => (
          <div key={section.id} className="section-editor">
            <div className="section-header">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                placeholder="Bölüm başlığı"
                className="section-title-input"
              />
              <button
                onClick={() => deleteSection(section.id)}
                className="delete-section-btn"
              >
                Sil
              </button>
            </div>

            <textarea
              value={section.description}
              onChange={(e) => updateSection(section.id, 'description', e.target.value)}
              placeholder="Bölüm açıklaması"
              className="section-description-input"
            />

            <div className="items-list">
              {(section.items || []).map((item) => (
                <div key={item.id} className="item-editor">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)}
                    placeholder="Ürün adı"
                    className="item-title-input"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                    placeholder="Ürün açıklaması"
                    className="item-description-input"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(section.id, item.id, 'price', e.target.value)}
                    placeholder="Fiyat"
                    step="0.01"
                    min="0"
                    className="item-price-input"
                  />
                  <button
                    onClick={() => deleteItem(section.id, item.id)}
                    className="delete-item-btn"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addItem(section.id)}
              className="add-item-btn"
            >
              Ürün Ekle
            </button>
          </div>
        ))}

        <button onClick={addSection} className="add-section-btn">
          Bölüm Ekle
        </button>
      </div>

      <div className="page-actions">
        <button
          onClick={saveMenu}
          disabled={loading}
          className="save-menu-btn"
        >
          {loading ? 'Kaydediliyor...' : 'Menüyü Kaydet'}
        </button>
      </div>

      <style jsx>{`
        .menu-creation-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin-bottom: 8px;
          color: #374151;
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

        .section-editor {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .section-title-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 18px;
          font-weight: 600;
        }

        .section-description-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 16px;
          resize: vertical;
          min-height: 60px;
        }

        .item-editor {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr auto auto;
          gap: 12px;
          align-items: start;
        }

        .item-title-input,
        .item-description-input,
        .item-price-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .item-description-input {
          grid-column: 1 / -2;
          resize: vertical;
          min-height: 40px;
        }

        .delete-section-btn,
        .delete-item-btn,
        .add-item-btn,
        .add-section-btn,
        .save-menu-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .delete-section-btn,
        .delete-item-btn {
          background: #dc2626;
          color: white;
        }

        .add-item-btn,
        .add-section-btn {
          background: #8b5cf6;
          color: white;
        }

        .save-menu-btn {
          background: #16a34a;
          color: white;
          padding: 12px 24px;
          font-size: 16px;
        }

        .save-menu-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .page-actions {
          text-align: center;
          margin-top: 32px;
        }
      `}</style>
    </div>
  );
};

export default MenuCreationPage;

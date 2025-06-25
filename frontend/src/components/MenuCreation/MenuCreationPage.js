import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  PlusIcon,
  TrashIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuService';
import MultiLanguageInput from './MultiLanguageInput';
import './MenuCreationPage.css';
import './MultiLanguageInput.css';

// Supported languages configuration
const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const DEFAULT_LANGUAGE = 'tr';

// Utility functions for multi-language data
const normalizeToMultiLanguage = (value, defaultLang = DEFAULT_LANGUAGE) => {
  if (typeof value === 'string') {
    return { [defaultLang]: value };
  }
  return value || {};
};

const getDisplayText = (multiLangValue, preferredLang = DEFAULT_LANGUAGE) => {
  if (typeof multiLangValue === 'string') {
    return multiLangValue;
  }
  if (!multiLangValue || typeof multiLangValue !== 'object') {
    return '';
  }
  return multiLangValue[preferredLang] ||
         multiLangValue[DEFAULT_LANGUAGE] ||
         Object.values(multiLangValue)[0] || '';
};

const MenuCreationPage = () => {
  const navigate = useNavigate();
  const {
    currentMenu,
    currentRestaurant,
    loadDashboardMenuData,
    saveMenuContent,
    isLoading
  } = useMenu();

  const [primaryLanguage, setPrimaryLanguage] = useState('tr'); // Primary language for the menu
  const [activeTab, setActiveTab] = useState(0);
  const [sections, setSections] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // TEMPORARY: Test function to save menu data
  const testSaveMenuData = async () => {
    console.log('🔍 Testing menu save...');
    const testMenuData = {
      sections: [
        {
          id: 'test-section-1',
          title: 'Test Section for User 456',
          description: 'This is test data for restaurant_id 456',
          items: [
            {
              id: 'test-item-1',
              title: 'Test Item',
              description: 'Test item description',
              price: '99.99'
            }
          ]
        }
      ]
    };

    try {
      await saveMenuContent(testMenuData);
      console.log('✅ Test menu data saved successfully');

      // Show current storage state
      const storageData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');
      console.log('🔍 Current storage state:', storageData);
      console.log('🔍 Restaurant keys in storage:', Object.keys(storageData.restaurants || {}));
    } catch (error) {
      console.error('❌ Failed to save test menu data:', error);
    }
  };

  // TEMPORARY: Function to show current storage state
  const showStorageState = () => {
    const storageData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    console.log('🔍 Current auth user:', authUser);
    console.log('🔍 Current storage state:', storageData);
    console.log('🔍 Restaurant keys in storage:', Object.keys(storageData.restaurants || {}));

    // Create detailed summary
    const restaurants = storageData.restaurants || {};
    let summary = `=== DATA ISOLATION TEST RESULTS ===\n\n`;
    summary += `Current User: ${authUser.email || 'Unknown'} (Restaurant ID: ${authUser.restaurant_id})\n\n`;
    summary += `Storage Keys Found: ${Object.keys(restaurants).length}\n`;

    Object.keys(restaurants).forEach(key => {
      const restaurant = restaurants[key];
      const sectionsCount = restaurant?.menu?.sections?.length || 0;
      summary += `\n📍 ${key}:\n`;
      summary += `   - Name: ${restaurant?.restaurant?.name || 'Unknown'}\n`;
      summary += `   - Sections: ${sectionsCount}\n`;
      if (sectionsCount > 0) {
        summary += `   - Section Titles: ${restaurant.menu.sections.map(s => s.title).join(', ')}\n`;
      }
    });

    alert(summary);
  };

  // TEMPORARY: Switch to different test users
  const switchToUser = (userId, restaurantId) => {
    const testUser = {
      id: userId,
      email: `user${userId}@example.com`,
      restaurant_id: restaurantId
    };
    localStorage.setItem('authUser', JSON.stringify(testUser));
    console.log('🔍 Switched to user:', testUser);
    // Reload the page to see the new user's data
    window.location.reload();
  };

  // Load existing menu data when component mounts
  useEffect(() => {
    console.log('🔍 MenuCreationPage: Component mounted, calling loadDashboardMenuData');
    console.log('🔍 MenuCreationPage: localStorage authUser:', localStorage.getItem('authUser'));
    console.log('🔍 MenuCreationPage: localStorage qr_menu_data:', localStorage.getItem('qr_menu_data'));

    // TEMPORARY: Clear storage to test fresh start (DISABLED for testing persistence)
    // menuService.clearStorageData();

    // TEMPORARY: Create test user for debugging
    const testUser = {
      id: 1,
      email: 'test@example.com',
      restaurant_id: 456  // Changed to different restaurant_id to test isolation
    };
    localStorage.setItem('authUser', JSON.stringify(testUser));
    console.log('🔍 Created test user:', testUser);

    loadDashboardMenuData();
  }, [loadDashboardMenuData]);

  // Update local sections when menu data loads
  useEffect(() => {
    if (currentMenu && currentMenu.sections) {
      const sectionsWithUI = currentMenu.sections.map(section => ({
        ...section,
        // Convert old string format to multi-language format
        title: normalizeToMultiLanguage(section.title),
        description: normalizeToMultiLanguage(section.description),
        expanded: true,
        imagePreview: section.image, // Use existing image URL as preview
        items: section.items.map(item => ({
          ...item,
          // Convert old string format to multi-language format
          title: normalizeToMultiLanguage(item.title),
          description: normalizeToMultiLanguage(item.description),
          imagePreview: item.image // Use existing image URL as preview
        }))
      }));
      setSections(sectionsWithUI);
    }
  }, [currentMenu]);

  // Save menu data to backend
  const saveMenuData = async () => {
    try {
      // Convert sections to the format expected by the backend
      const menuData = {
        sections: sections.map((section, index) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          image: section.image && typeof section.image === 'string' ? section.image : section.imagePreview,
          order: index + 1,
          items: section.items.map((item, itemIndex) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            image: item.image && typeof item.image === 'string' ? item.image : item.imagePreview,
            order: itemIndex + 1,
            isAvailable: item.isAvailable !== false
          }))
        }))
      };

      await saveMenuContent(menuData);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Failed to save menu:', error);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: { [DEFAULT_LANGUAGE]: 'Yeni Bölüm' },
      description: { [DEFAULT_LANGUAGE]: 'Bölüm açıklaması' },
      expanded: true,
      image: null,
      imagePreview: null,
      items: []
    };
    setSections([...sections, newSection]);
    setHasUnsavedChanges(true);
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, [field]: value }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter(section => section.id !== sectionId));
    setHasUnsavedChanges(true);
  };

  const toggleSection = (sectionId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const addItem = (sectionId) => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: { [DEFAULT_LANGUAGE]: 'Yeni Ürün' },
      description: { [DEFAULT_LANGUAGE]: 'Ürün açıklaması' },
      price: '0.00',
      image: null,
      imagePreview: null,
      isAvailable: true
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, items: [...section.items, newItem] }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const updateItem = (sectionId, itemId, field, value) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId
                ? { ...item, [field]: value }
                : item
            )
          }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const deleteItem = (sectionId, itemId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, items: section.items.filter(item => item.id !== itemId) }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      setSections(newSections);
    } else if (type === 'item') {
      const sectionId = source.droppableId;
      const section = sections.find(s => s.id === sectionId);
      const newItems = Array.from(section.items);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      
      setSections(sections.map(s => 
        s.id === sectionId 
          ? { ...s, items: newItems }
          : s
      ));
    }
  };

  // Image handling functions
  const handleSectionImageUpload = async (sectionId, file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Upload image and get URL
        const uploadResult = await menuService.uploadImage(file, 'section');
        const imageUrl = uploadResult.imageUrl;

        setSections(sections.map(section =>
          section.id === sectionId
            ? { ...section, image: imageUrl, imagePreview: imageUrl }
            : section
        ));
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to upload section image:', error);
        // Fallback to local preview
        const imageUrl = URL.createObjectURL(file);
        setSections(sections.map(section =>
          section.id === sectionId
            ? { ...section, image: file, imagePreview: imageUrl }
            : section
        ));
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleSectionImageRemove = (sectionId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, image: null, imagePreview: null }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const handleItemImageUpload = async (sectionId, itemId, file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Upload image and get URL
        const uploadResult = await menuService.uploadImage(file, 'item');
        const imageUrl = uploadResult.imageUrl;

        setSections(sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map(item =>
                  item.id === itemId
                    ? { ...item, image: imageUrl, imagePreview: imageUrl }
                    : item
                )
              }
            : section
        ));
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to upload item image:', error);
        // Fallback to local preview
        const imageUrl = URL.createObjectURL(file);
        setSections(sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map(item =>
                  item.id === itemId
                    ? { ...item, image: file, imagePreview: imageUrl }
                    : item
                )
              }
            : section
        ));
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleItemImageRemove = (sectionId, itemId) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId
                ? { ...item, image: null, imagePreview: null }
                : item
            )
          }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const handleAutomaticCreate = () => {
    // Placeholder for automatic menu creation
    alert('Otomatik menü oluşturma özelliği yakında gelecek!');
  };

  return (
    <div className="menu-creation-page">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="progress-step active">
          <span className="step-number">1</span>
          <span className="step-text">Menü Oluştur</span>
        </div>
        <div className="progress-step">
          <span className="step-number">2</span>
          <span className="step-text">Tasarımı Özelleştir</span>
        </div>
      </div>

      {/* TEMPORARY: Test button for debugging */}
      <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', borderRadius: '5px' }}>
        <div style={{ marginBottom: '10px' }}>
          <button onClick={testSaveMenuData} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
            🧪 Test Save Menu Data
          </button>
          <button onClick={showStorageState} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
            📊 Show Storage State
          </button>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => switchToUser(1, 123)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
            👤 Switch to User 1 (Restaurant 123)
          </button>
          <button onClick={() => switchToUser(2, 456)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
            👤 Switch to User 2 (Restaurant 456)
          </button>
          <button onClick={() => switchToUser(3, 789)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
            👤 Switch to User 3 (Restaurant 789)
          </button>
        </div>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Debug: Testing data isolation - Current user has restaurant_id 456
        </span>
      </div>

      <div className="menu-creation-content">
        {/* Left Column - Menu Editor */}
        <div className="menu-editor">
          <div className="editor-header">
            <h1>Merhaba arshia amerika! Menünüzü oluşturalım</h1>
            <p>
              Menünüze hayata geçirin. Kategorilerinizi ve ürünlerinizi resimler, isimler, açıklamalar ve fiyatlar 
              ile tanımlayın. Endişelenmeyin, daha sonra daha fazla kategori ve ürün ekleyebilirsiniz.
            </p>
          </div>

          <div className="editor-controls">
            <div className="language-selector">
              <label>Ana Dil:</label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="language-dropdown"
                title="Menünüzün ana dili - önizlemede bu dil gösterilir"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="automatic-create-btn" onClick={handleAutomaticCreate}>
              ✨ Otomatik Oluştur
            </button>
          </div>

          <div className="example-hint">
            Örnek: Kategoriler: "Başlangıçlar", "Salatalar", "Ürünler", "Humus", "Gazpacho", "Peynir Tabağı"
          </div>

          {/* Conditional rendering to fix drag-and-drop timing issue */}
          {isLoading ? (
            <div className="loading-sections">
              <p>Menü yükleniyor...</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <div 
                    className="sections-container"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {sections.map((section, index) => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        index={index}
                        onUpdateSection={updateSection}
                        onDeleteSection={deleteSection}
                        onToggleSection={toggleSection}
                        onAddItem={addItem}
                        onUpdateItem={updateItem}
                        onDeleteItem={deleteItem}
                        onImageUpload={handleSectionImageUpload}
                        onImageRemove={handleSectionImageRemove}
                        onItemImageUpload={handleItemImageUpload}
                        onItemImageRemove={handleItemImageRemove}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          <button className="add-section-btn" onClick={addSection}>
            <PlusIcon className="w-5 h-5" />
            Yeni Bölüm Ekle
          </button>

          <div className="navigation-buttons">
            <button
              className="back-btn"
              onClick={() => navigate('/dashboard/menu-management')}
            >
              Geri
            </button>
            <button
              className="next-btn"
              onClick={async () => {
                // Save menu data before navigating
                await saveMenuData();
                // Set referrer so Design Customization knows we came from Menu Creation
                sessionStorage.setItem('designCustomizationReferrer', 'menu-creation');
                navigate('/dashboard/menu/customize');
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Kaydediliyor...' : 'Sonraki'}
            </button>
          </div>
        </div>

        {/* Right Column - Mobile Preview */}
        <div className="mobile-preview">
          <div className="phone-frame">
            <div className="phone-header">
              <div className="status-bar">
                <span className="time">15:55</span>
                <div className="status-icons">
                  <div className="signal-bars"></div>
                  <div className="wifi-icon"></div>
                  <div className="battery-icon"></div>
                </div>
              </div>
              <div className="app-header">
                <span className="restaurant-name">{currentRestaurant?.name || 'Restaurant Adı'}</span>
                <Bars3Icon className="menu-icon" />
              </div>
            </div>

            <div className="phone-content">
              <h2 className="menu-title">Menü</h2>
              
              <div className="search-bar">
                <MagnifyingGlassIcon className="search-icon" />
                <input type="text" placeholder="Arama" />
                <AdjustmentsHorizontalIcon className="filter-icon" />
              </div>

              <div className="category-tabs">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    className={`category-tab ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {getDisplayText(section.title, primaryLanguage)}
                  </button>
                ))}
              </div>

              <div className="menu-content">
                {sections.map((section) => (
                  <div key={section.id} className="preview-section">
                    <div className="section-header">
                      <div className="section-image-container">
                        {section.imagePreview ? (
                          <>
                            <img
                              src={section.imagePreview}
                              alt={getDisplayText(section.title, primaryLanguage)}
                              className="section-preview-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="section-image-placeholder" style={{ display: 'none' }}>
                              <PhotoIcon className="placeholder-icon" />
                            </div>
                          </>
                        ) : (
                          <div className="section-image-placeholder">
                            <PhotoIcon className="placeholder-icon" />
                          </div>
                        )}
                      </div>
                      <div className="section-info">
                        <h3>{getDisplayText(section.title, primaryLanguage)}</h3>
                        <p>{getDisplayText(section.description, primaryLanguage)}</p>
                      </div>
                    </div>

                    {section.items.map((item) => (
                      <div key={item.id} className="preview-item">
                        <div className="item-info">
                          <h4>{getDisplayText(item.title, primaryLanguage)}</h4>
                          <p>{getDisplayText(item.description, primaryLanguage)}</p>
                          <span className="item-price">₺{item.price}</span>
                        </div>
                        <div className="item-image-container">
                          {item.imagePreview ? (
                            <>
                              <img
                                src={item.imagePreview}
                                alt={getDisplayText(item.title, primaryLanguage)}
                                className="item-preview-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="item-image-placeholder" style={{ display: 'none' }}>
                                <PhotoIcon className="placeholder-icon" />
                              </div>
                            </>
                          ) : (
                            <div className="item-image-placeholder">
                              <PhotoIcon className="placeholder-icon" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Editor Component
const SectionEditor = ({
  section,
  index,
  onUpdateSection,
  onDeleteSection,
  onToggleSection,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onImageUpload,
  onImageRemove,
  onItemImageUpload,
  onItemImageRemove
}) => {
  const fileInputRef = useRef(null);
  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`section-editor ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="section-header" {...provided.dragHandleProps}>
            <div className="section-image-upload">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) onImageUpload(section.id, file);
                }}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {section.imagePreview ? (
                <div className="section-image-preview">
                  <img src={section.imagePreview} alt="Section" />
                  <button
                    onClick={() => onImageRemove(section.id)}
                    className="remove-image-btn"
                    type="button"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-image-btn"
                  type="button"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span>Add Image</span>
                </button>
              )}
            </div>
            <div className="section-inputs">
              <MultiLanguageInput
                value={section.title}
                onChange={(value) => onUpdateSection(section.id, 'title', value)}
                placeholder="Bölüm başlığı"
                label="Bölüm Başlığı"
                required={true}
                className="section-title-input"
              />
              <MultiLanguageInput
                value={section.description}
                onChange={(value) => onUpdateSection(section.id, 'description', value)}
                placeholder="Bölüm açıklaması"
                label="Bölüm Açıklaması"
                type="textarea"
                className="section-description-input"
              />
            </div>
            <div className="section-controls">
              <button
                onClick={() => onToggleSection(section.id)}
                className="toggle-btn"
              >
                {section.expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => onDeleteSection(section.id)}
                className="delete-btn"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {section.expanded && (
            <div className="section-items">
              <Droppable droppableId={section.id} type="item">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="items-container"
                  >
                    {section.items.map((item, itemIndex) => (
                      <ItemEditor
                        key={item.id}
                        item={item}
                        index={itemIndex}
                        sectionId={section.id}
                        onUpdateItem={onUpdateItem}
                        onDeleteItem={onDeleteItem}
                        onImageUpload={onItemImageUpload}
                        onImageRemove={onItemImageRemove}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              <button 
                className="add-item-btn"
                onClick={() => onAddItem(section.id)}
              >
                <PlusIcon className="w-4 h-4" />
                Ürün Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Item Editor Component
const ItemEditor = ({ item, index, sectionId, onUpdateItem, onDeleteItem, onImageUpload, onImageRemove }) => {
  const itemFileInputRef = useRef(null);
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`item-editor ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="item-inputs">
            <MultiLanguageInput
              value={item.title}
              onChange={(value) => onUpdateItem(sectionId, item.id, 'title', value)}
              placeholder="Ürün adı"
              label="Ürün Adı"
              required={true}
              className="item-title-input"
            />
            <MultiLanguageInput
              value={item.description}
              onChange={(value) => onUpdateItem(sectionId, item.id, 'description', value)}
              placeholder="Ürün açıklaması"
              label="Ürün Açıklaması"
              type="textarea"
              className="item-description-input"
            />
          </div>
          <div className="item-price-container">
            <span className="currency">₺</span>
            <input
              type="number"
              value={item.price}
              onChange={(e) => onUpdateItem(sectionId, item.id, 'price', e.target.value)}
              className="item-price-input"
              step="0.01"
              min="0"
            />
          </div>
          <div className="item-image-upload">
            <input
              type="file"
              ref={itemFileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) onImageUpload(sectionId, item.id, file);
              }}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {item.imagePreview ? (
              <div className="item-image-preview">
                <img src={item.imagePreview} alt="Item" />
                <button
                  onClick={() => onImageRemove(sectionId, item.id)}
                  className="remove-image-btn"
                  type="button"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => itemFileInputRef.current?.click()}
                className="upload-image-btn small"
                type="button"
              >
                <PhotoIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => onDeleteItem(sectionId, item.id)}
            className="delete-item-btn"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default MenuCreationPage;

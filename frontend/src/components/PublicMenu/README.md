# PublicMenuView Component

A comprehensive React component for displaying restaurant menus to customers. This is a read-only, mobile-first view that dynamically applies restaurant branding and displays menu content created by restaurant owners.

## Features

### ✨ **Core Functionality**
- **Mobile-first design**: Optimized for QR code scanning on mobile devices
- **Dynamic branding**: Applies restaurant's custom colors and logo
- **Responsive layout**: Works seamlessly on desktop and mobile
- **Read-only interface**: No admin controls, pure customer experience

### 🎨 **Dynamic Branding Integration**
- **Background color**: Uses restaurant's 'Arka Plan Rengi'
- **Text color**: Uses restaurant's 'Metin Rengi' for all text elements
- **Accent color**: Uses restaurant's 'Vurgu Rengi' for highlights and buttons
- **Logo display**: Shows uploaded restaurant logo or placeholder

### 📱 **Component Structure**

```
PublicMenu/
├── PublicMenuView.js        # Main component (300 lines)
├── MenuItemCard.js          # Individual menu item display
├── SectionTab.js            # Category navigation tabs
├── PublicMenuView.css       # Complete styling (300+ lines)
└── README.md                # Documentation
```

## Component Details

### 🏠 **PublicMenuView (Main Component)**

#### **Props Interface:**
```javascript
{
  restaurantMenuData: {
    sections: [
      {
        id: string,
        title: string,
        description: string,
        image: string | null,
        items: [
          {
            id: string,
            title: string,
            description: string,
            price: string,
            image: string | null
          }
        ]
      }
    ]
  },
  restaurantBrandingData: {
    logo: string | null,
    colors: {
      textColor: string,
      backgroundColor: string,
      accentColor: string
    }
  },
  restaurantInfo: {
    name: string,
    address: string,
    phone: string,
    hours: string
  }
}
```

#### **State Management:**
- **Active section tracking**: Highlights current menu section
- **Search functionality**: Real-time menu item filtering
- **Language selection**: Multi-language support
- **Scroll position**: Smooth navigation between sections

### 🎯 **Page Structure**

#### **1. Header Area:**
- ✅ **Restaurant logo**: Displays uploaded logo or placeholder
- ✅ **Restaurant name**: Prominent display with custom text color
- ✅ **Restaurant details**: Address, hours, phone with icons
- ✅ **Language selector**: Dropdown for multi-language support
- ✅ **Sticky positioning**: Remains visible while scrolling

#### **2. Search Bar:**
- ✅ **Search input**: "Menüde ara..." placeholder
- ✅ **Search icon**: Magnifying glass indicator
- ✅ **Clear button**: X button to clear search
- ✅ **Real-time filtering**: Instant results as user types
- ✅ **Cross-section search**: Searches across all menu sections

#### **3. Category Navigation:**
- ✅ **Horizontal scrollable tabs**: Section titles as navigation
- ✅ **Active state highlighting**: Uses accent color for active tab
- ✅ **Smooth scrolling**: Animated navigation to sections
- ✅ **Sticky positioning**: Remains accessible while browsing
- ✅ **Mobile-optimized**: Touch-friendly scrollable interface

#### **4. Menu Content Area:**
- ✅ **Section headers**: Title, description, and optional image
- ✅ **Menu items**: Cards with image, title, description, price
- ✅ **Search results**: Dedicated view for filtered items
- ✅ **No results state**: Helpful message when search yields no results

#### **5. Footer:**
- ✅ **Powered by FineDine**: Subtle branding attribution

### 🍽️ **MenuItemCard Component**

#### **Features:**
- **Flexible layout**: Adapts to with/without images
- **Section tagging**: Shows section name in search results
- **Price formatting**: Consistent currency display (₺)
- **Image handling**: Graceful fallback for missing images
- **Hover effects**: Subtle interaction feedback

#### **Layout:**
- **Desktop**: Side-by-side image and content
- **Mobile**: Stacked layout with image on top

### 🏷️ **SectionTab Component**

#### **Features:**
- **Active state management**: Visual highlighting
- **Custom styling**: Uses restaurant's accent color
- **Touch-friendly**: Optimized for mobile interaction
- **Smooth transitions**: Animated state changes

## Key Features

### 🔍 **Search Functionality**

#### **Search Capabilities:**
- **Item title search**: Matches menu item names
- **Description search**: Searches item descriptions
- **Case-insensitive**: User-friendly search experience
- **Real-time results**: Instant filtering as user types
- **Cross-section results**: Shows items from all sections

#### **Search Results Display:**
- **Result count**: Shows number of matching items
- **Section tags**: Indicates which section each item belongs to
- **No results state**: Helpful message when no matches found
- **Clear functionality**: Easy way to return to full menu

### 🎨 **Dynamic Styling**

#### **CSS Custom Properties:**
```css
.public-menu-view {
  --text-color: /* Restaurant's text color */;
  --bg-color: /* Restaurant's background color */;
  --accent-color: /* Restaurant's accent color */;
}
```

#### **Branding Application:**
- **Background**: Page background uses restaurant's background color
- **Text**: All text elements use restaurant's text color
- **Accents**: Buttons, active states, prices use accent color
- **Consistency**: Unified color scheme throughout interface

### 📱 **Responsive Design**

#### **Mobile (< 768px):**
- **Stacked header**: Logo and info in column layout
- **Full-width search**: Optimized for mobile keyboards
- **Scrollable tabs**: Horizontal category navigation
- **Stacked item cards**: Image above content
- **Touch-optimized**: Larger touch targets

#### **Tablet (768px - 1024px):**
- **Flexible layout**: Adapts to medium screens
- **Maintained functionality**: All features accessible
- **Optimized spacing**: Comfortable viewing experience

#### **Desktop (1024px+):**
- **Side-by-side layout**: Image and content horizontal
- **Hover effects**: Enhanced interaction feedback
- **Larger content area**: More information visible

### 🎯 **Navigation Features**

#### **Section Navigation:**
- **Smooth scrolling**: Animated transitions between sections
- **Active tracking**: Highlights current section in tabs
- **Scroll offset**: Accounts for sticky headers
- **Touch-friendly**: Optimized for mobile interaction

#### **URL Integration:**
- **Restaurant slug**: `/menu/{restaurant_slug}` routing
- **Deep linking**: Direct links to specific restaurants
- **SEO-friendly**: Proper URL structure

## Usage

### **Basic Implementation:**
```jsx
import PublicMenuView from './components/PublicMenu/PublicMenuView';

function App() {
  return (
    <PublicMenuView
      restaurantMenuData={menuData}
      restaurantBrandingData={brandingData}
      restaurantInfo={restaurantInfo}
    />
  );
}
```

### **With URL Parameters:**
```jsx
// Route: /menu/:restaurantSlug
// Component automatically extracts restaurantSlug from URL
```

### **Access Routes:**
- **Public menu**: `/menu/{restaurant-slug}`
- **Demo version**: `/demo/public-menu`

## Mock Data Structure

### **Menu Data Example:**
```javascript
{
  sections: [
    {
      id: 'section-1',
      title: 'Başlangıçlar',
      description: 'Lezzetli başlangıç yemekleri',
      image: null,
      items: [
        {
          id: 'item-1',
          title: 'Humus',
          description: 'Geleneksel Türk humusu...',
          price: '25.00',
          image: null
        }
      ]
    }
  ]
}
```

### **Branding Data Example:**
```javascript
{
  logo: null,
  colors: {
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    accentColor: '#8b5cf6'
  }
}
```

## Performance Optimizations

### **Efficient Rendering:**
- **Component memoization**: Prevents unnecessary re-renders
- **Optimized search**: Debounced search functionality
- **Image lazy loading**: Loads images as needed
- **Smooth animations**: 60fps scrolling and transitions

### **Mobile Optimizations:**
- **Touch-friendly**: Large touch targets
- **Fast scrolling**: Optimized scroll performance
- **Minimal data usage**: Efficient image handling
- **Battery-friendly**: Optimized animations

## Accessibility

### **WCAG Compliance:**
- **Keyboard navigation**: Full keyboard support
- **Screen reader**: Proper ARIA labels and roles
- **Color contrast**: Meets accessibility standards
- **Focus management**: Clear focus indicators

### **Mobile Accessibility:**
- **Touch targets**: Minimum 44px touch areas
- **Zoom support**: Scales properly with device zoom
- **Voice control**: Compatible with voice navigation
- **High contrast**: Supports system accessibility settings

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive enhancement**: Graceful degradation for older browsers
- **Touch support**: Full touch and gesture support

## Future Enhancements

- **Offline support**: PWA capabilities for offline viewing
- **Print styles**: Optimized printing layout
- **Social sharing**: Share menu items on social media
- **Favorites**: Customer favorite items (with local storage)
- **Nutritional info**: Display dietary information
- **Multi-language**: Full internationalization support
- **Voice search**: Voice-activated menu search
- **AR integration**: Augmented reality menu viewing

## Integration Points

- **QR code generation**: Links to this component
- **Analytics tracking**: Customer interaction metrics
- **Order integration**: Connect to ordering systems
- **Payment processing**: Link to payment gateways
- **Reservation system**: Integration with booking systems

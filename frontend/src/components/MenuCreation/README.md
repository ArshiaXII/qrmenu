# Menu Creation Component

A comprehensive React component for creating restaurant menus with live mobile preview and image upload capabilities, based on the FineDine design.

## Features

### ✨ **Core Functionality**
- **Two-column layout**: Menu editor (left) + Live mobile preview (right)
- **Progress indicator**: Shows current step in menu creation process
- **Language selection**: Dropdown for menu language (default: Turkish)
- **Automatic creation**: Placeholder for AI-powered menu generation
- **Image upload**: Full support for section and item images with live preview

### 🏗️ **Menu Structure Management**
- **Sections (Categories)**:
  - Add/delete sections
  - Edit section title and description
  - **Image upload**: Upload, preview, and remove section images
  - Drag-and-drop reordering
  - Expand/collapse functionality

- **Items (Menu Items)**:
  - Add/delete items within sections
  - Edit item title, description, and price
  - **Image upload**: Upload, preview, and remove item images
  - Drag-and-drop reordering within sections
  - Currency symbol (₺) with price formatting

### 📱 **Live Mobile Preview**
- **Real-time updates**: All changes reflect immediately in preview
- **Image preview**: Uploaded images appear instantly in mobile view
- **Mobile phone simulation**: Realistic mobile interface
- **Interactive category tabs**: Click to filter/highlight sections
- **Search bar**: Visual search interface
- **Scrollable content**: Full menu preview with proper scrolling

### 🎨 **UI/UX Features**
- **Modern design**: Clean, professional interface
- **Image upload**: Intuitive file selection with drag-and-drop support
- **Image preview**: Instant thumbnail previews with remove functionality
- **Drag-and-drop**: Smooth reordering with visual feedback
- **Responsive layout**: Adapts to different screen sizes
- **Hover effects**: Interactive button states
- **Form validation**: Real-time input handling

### 📸 **Image Management**
- **File upload**: Support for all common image formats (JPEG, PNG, GIF, WebP)
- **Live preview**: Instant preview generation using blob URLs
- **Image removal**: One-click image deletion with confirmation
- **Responsive sizing**: Automatic image scaling for different contexts
- **Memory management**: Proper cleanup of blob URLs to prevent memory leaks

## Usage

### Basic Implementation
```jsx
import MenuCreationPage from './components/MenuCreation/MenuCreationPage';

function App() {
  return <MenuCreationPage />;
}
```

### Accessing the Component
- **Within Dashboard**: `/dashboard/menu/create`
- **Standalone Demo**: `/demo/menu-creation`

## Component Structure

```
MenuCreationPage/
├── MenuCreationPage.js     # Main component
├── MenuCreationPage.css    # Styling
└── README.md              # Documentation
```

### Key Components
- **MenuCreationPage**: Main container component
- **SectionEditor**: Individual section management
- **ItemEditor**: Individual item management
- **Mobile Preview**: Live preview simulation

## State Management

The component uses React's `useState` for local state management:

```javascript
const [sections, setSections] = useState([
  {
    id: 'section-1',
    title: 'Section Title',
    description: 'Section Description',
    expanded: true,
    items: [
      {
        id: 'item-1',
        title: 'Item Title',
        description: 'Item Description',
        price: '0.00'
      }
    ]
  }
]);
```

## Dependencies

- **react-beautiful-dnd**: Drag-and-drop functionality
- **@heroicons/react**: Icon components
- **React 18+**: Core framework

## Styling

The component uses CSS modules with:
- **Flexbox/Grid layouts**: Responsive design
- **CSS transitions**: Smooth animations
- **Custom properties**: Consistent theming
- **Mobile-first approach**: Responsive breakpoints

## Key Interactions

### Drag and Drop
- **Sections**: Reorder between positions
- **Items**: Reorder within their section
- **Visual feedback**: Rotation and shadow effects during drag

### Live Preview
- **Real-time sync**: Changes appear instantly
- **Category filtering**: Click tabs to highlight sections
- **Mobile simulation**: Accurate mobile interface

### Form Handling
- **Inline editing**: Click to edit titles/descriptions
- **Price formatting**: Automatic currency formatting
- **Validation**: Real-time input validation

## Customization

### Styling
Modify `MenuCreationPage.css` to customize:
- Colors and themes
- Layout dimensions
- Animation timings
- Mobile preview styling

### Functionality
Extend the component by:
- Adding image upload for sections/items
- Implementing backend integration
- Adding more form fields
- Customizing drag-and-drop behavior

## Future Enhancements

- **Backend Integration**: Save/load menu data
- **Image Upload**: Section and item images
- **Template System**: Pre-built menu templates
- **Export Options**: PDF/print menu generation
- **Multi-language**: Full internationalization
- **Validation**: Form validation and error handling

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile responsive**: iOS Safari, Chrome Mobile
- **Drag-and-drop**: Full support in modern browsers

## Performance

- **Optimized rendering**: Efficient state updates
- **Lazy loading**: Components load as needed
- **Smooth animations**: 60fps drag-and-drop
- **Memory efficient**: Proper cleanup and optimization

# Design Customization Component

A comprehensive React component for customizing restaurant brand appearance with live mobile preview, based on the FineDine design. This is the second step in the menu setup flow.

## Features

### ✨ **Core Functionality**
- **Two-column layout**: Customization controls (left) + Live mobile preview (right)
- **Progress indicator**: Shows step 2 as active, step 1 as completed
- **Brand customization**: Logo upload and color scheme selection
- **Real-time preview**: All changes reflect immediately in mobile simulation

### 🎨 **Customization Options**

#### **Logo Upload**
- **File selection**: Click to upload logo files
- **Supported formats**: .jpg, .jpeg, .png
- **Live preview**: Instant logo display in editor and mobile preview
- **Remove functionality**: One-click logo removal
- **File validation**: Only image files accepted

#### **Color Customization**
- **Text Color (Metin Rengi)**: Controls text color throughout the interface
- **Background Color (Arka Plan Rengi)**: Controls main background color
- **Accent Color (Vurgu Rengi)**: Controls buttons and highlight elements
- **Color picker**: Native HTML5 color input with hex display
- **Color swatches**: Visual representation of selected colors
- **Hex values**: Display current color codes

### 📱 **Live Mobile Preview**
- **Real-time updates**: All customizations reflect immediately
- **Mobile simulation**: Realistic iPhone-style interface
- **Logo display**: Shows uploaded logo or placeholder
- **Color application**: Dynamic color changes across all elements
- **Interactive elements**: Buttons and links with custom styling

### 🎯 **UI Elements Affected by Customization**

#### **Text Color Applied To:**
- Restaurant name
- Menu links text
- Language selector text
- Button text (when appropriate)

#### **Background Color Applied To:**
- Main content area background
- Overall mobile preview background

#### **Accent Color Applied To:**
- Main "Menüye Giriş" button background
- Menu link icons
- Interactive element highlights

## Usage

### Basic Implementation
```jsx
import DesignCustomizationPage from './components/DesignCustomization/DesignCustomizationPage';

function App() {
  return <DesignCustomizationPage />;
}
```

### Accessing the Component
- **Within Dashboard**: `/dashboard/menu/customize`
- **Standalone Demo**: `/demo/design-customization`
- **From Menu Creation**: Click "Next" on Menu Creation page

## Component Structure

```
DesignCustomization/
├── DesignCustomizationPage.js     # Main component
├── DesignCustomizationPage.css    # Styling
└── README.md                      # Documentation
```

## State Management

The component uses React's `useState` for local state management:

```javascript
// Logo state
const [logo, setLogo] = useState(null);           // File object
const [logoPreview, setLogoPreview] = useState(null); // Blob URL

// Color state
const [colors, setColors] = useState({
  textColor: '#1f2937',      // Default dark gray
  backgroundColor: '#ffffff', // Default white
  accentColor: '#8b5cf6'     // Default purple
});
```

## Key Interactions

### Logo Upload Flow
1. **Click upload area** → File picker opens
2. **Select image file** → Validation and preview generation
3. **Logo appears** → Instantly in both editor and mobile preview
4. **Remove option** → X button to delete logo

### Color Customization Flow
1. **Click color picker** → Native color selector opens
2. **Select color** → Immediate update in preview
3. **View changes** → Real-time application across mobile interface
4. **See hex value** → Current color code displayed

### Navigation Flow
- **Back button** → Returns to Menu Creation page
- **Next button** → Proceeds to next step (menu management)
- **Skip link** → Bypasses customization, goes to menu management

## Styling Features

### Modern Design
- **Clean interface**: Professional customization controls
- **Visual feedback**: Color swatches and previews
- **Responsive layout**: Adapts to different screen sizes
- **Smooth transitions**: Animated state changes

### Mobile Preview Accuracy
- **Realistic phone frame**: iPhone-style design
- **Status bar simulation**: Time, signal, battery indicators
- **Proper proportions**: Accurate mobile dimensions
- **Scrollable content**: Full mobile experience simulation

## File Handling

### Logo Upload
- **File validation**: Only image formats accepted
- **Preview generation**: Blob URL creation for instant preview
- **Memory management**: Proper cleanup of blob URLs
- **Error handling**: Invalid file type prevention

### Supported Image Formats
- **JPEG**: .jpg, .jpeg
- **PNG**: .png (with transparency support)
- **File size**: No explicit limit (browser dependent)

## Color Management

### Color Picker Integration
- **Native HTML5**: Uses browser's built-in color picker
- **Hex format**: All colors stored as hex values
- **Real-time sync**: Immediate preview updates
- **Accessibility**: Proper color contrast considerations

### Default Color Scheme
- **Text**: #1f2937 (Dark gray)
- **Background**: #ffffff (White)
- **Accent**: #8b5cf6 (Purple)

## Navigation Integration

### Progress Tracking
- **Step 1**: Menu Creation (marked as completed ✓)
- **Step 2**: Design Customization (marked as active)
- **Visual progress**: Clear step indication

### Route Integration
- **Back navigation**: Returns to `/dashboard/menu/create`
- **Forward navigation**: Proceeds to `/dashboard/menu`
- **Skip option**: Direct navigation to menu management

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Color picker**: Native support in all modern browsers
- **File upload**: Standard HTML5 file input support
- **Mobile responsive**: Touch-friendly interface

## Future Enhancements

- **Font selection**: Typography customization
- **Theme templates**: Pre-built color schemes
- **Advanced logo options**: Logo positioning and sizing
- **Export options**: Download customized preview
- **Brand guidelines**: Color accessibility checking
- **Multiple logos**: Different logos for different contexts

## Performance

- **Optimized rendering**: Efficient state updates
- **Image optimization**: Proper file handling
- **Memory efficient**: Blob URL cleanup
- **Smooth animations**: 60fps color transitions

## Accessibility

- **Color contrast**: Proper text/background contrast
- **Keyboard navigation**: Full keyboard support
- **Screen reader**: Proper ARIA labels
- **Focus management**: Clear focus indicators

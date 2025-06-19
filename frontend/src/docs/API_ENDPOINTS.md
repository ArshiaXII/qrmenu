# QR Menu Platform - API Endpoints Documentation

This document outlines the required backend API endpoints for the QR Menu Platform to function with dynamic data.

## Base URL
```
Production: https://api.finedine.app
Development: http://localhost:5000/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Public Endpoints (No Authentication Required)

### 1. Get Public Menu Data
**Endpoint:** `GET /restaurants/{restaurantSlug}/public-menu`

**Description:** Retrieves public menu data for display to customers

**Parameters:**
- `restaurantSlug` (string): Unique restaurant identifier (URL-friendly)

**Response (200 OK):**
```json
{
  "restaurant": {
    "id": 1,
    "name": "Lezzet Restaurant",
    "slug": "lezzet-restaurant",
    "address": "İstanbul, Türkiye",
    "phone": "+90 212 555 0123",
    "hours": "09:00 - 23:00",
    "isActive": true
  },
  "branding": {
    "logo": "https://cdn.finedine.app/logos/restaurant-1.jpg",
    "colors": {
      "textColor": "#1f2937",
      "backgroundColor": "#ffffff",
      "accentColor": "#8b5cf6"
    }
  },
  "menu": {
    "sections": [
      {
        "id": "section-1",
        "title": "Başlangıçlar",
        "description": "Lezzetli başlangıç yemekleri",
        "image": "https://cdn.finedine.app/sections/section-1.jpg",
        "order": 1,
        "items": [
          {
            "id": "item-1",
            "title": "Humus",
            "description": "Geleneksel Türk humusu, taze sebzeler ile servis edilir",
            "price": "25.00",
            "image": "https://cdn.finedine.app/items/item-1.jpg",
            "order": 1,
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: Restaurant not found
- `403 Forbidden`: Menu is inactive/draft

## Authenticated Endpoints (Dashboard)

### 2. Get Dashboard Menu Data
**Endpoint:** `GET /restaurants/{restaurantId}/menu`

**Description:** Retrieves complete menu data for dashboard management

**Parameters:**
- `restaurantId` (integer): Restaurant ID

**Response (200 OK):**
```json
{
  "restaurant": {
    "id": 1,
    "name": "Lezzet Restaurant",
    "slug": "lezzet-restaurant",
    "address": "İstanbul, Türkiye",
    "phone": "+90 212 555 0123",
    "hours": "09:00 - 23:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "branding": {
    "logo": "https://cdn.finedine.app/logos/restaurant-1.jpg",
    "colors": {
      "textColor": "#1f2937",
      "backgroundColor": "#ffffff",
      "accentColor": "#8b5cf6"
    }
  },
  "menu": {
    "sections": [
      {
        "id": "section-1",
        "title": "Başlangıçlar",
        "description": "Lezzetli başlangıç yemekleri",
        "image": "https://cdn.finedine.app/sections/section-1.jpg",
        "order": 1,
        "items": [
          {
            "id": "item-1",
            "title": "Humus",
            "description": "Geleneksel Türk humusu, taze sebzeler ile servis edilir",
            "price": "25.00",
            "image": "https://cdn.finedine.app/items/item-1.jpg",
            "order": 1,
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

### 3. Update Menu Content
**Endpoint:** `PUT /restaurants/{restaurantId}/menu`

**Description:** Updates menu sections and items

**Request Body:**
```json
{
  "sections": [
    {
      "id": "section-1",
      "title": "Başlangıçlar",
      "description": "Lezzetli başlangıç yemekleri",
      "image": "https://cdn.finedine.app/sections/section-1.jpg",
      "order": 1,
      "items": [
        {
          "id": "item-1",
          "title": "Humus",
          "description": "Geleneksel Türk humusu, taze sebzeler ile servis edilir",
          "price": "25.00",
          "image": "https://cdn.finedine.app/items/item-1.jpg",
          "order": 1,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu updated successfully",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### 4. Update Design Customization
**Endpoint:** `PUT /restaurants/{restaurantId}/design`

**Description:** Updates restaurant branding and design settings

**Request Body:**
```json
{
  "logo": "https://cdn.finedine.app/logos/restaurant-1.jpg",
  "colors": {
    "textColor": "#1f2937",
    "backgroundColor": "#ffffff",
    "accentColor": "#8b5cf6"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Design updated successfully",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### 5. Update Menu Status
**Endpoint:** `PUT /restaurants/{restaurantId}/menu/status`

**Description:** Activates or deactivates the public menu

**Request Body:**
```json
{
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu status updated successfully",
  "isActive": true,
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### 6. Upload Image
**Endpoint:** `POST /upload/image`

**Description:** Uploads images for logos, sections, or items

**Request:** Multipart form data
- `image` (file): Image file
- `type` (string): Image type ("logo", "section", "item")

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://cdn.finedine.app/uploads/image-123.jpg",
  "fileName": "image-123.jpg"
}
```

## Database Schema Requirements

### Restaurants Table
```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  hours VARCHAR(100),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Restaurant_Branding Table
```sql
CREATE TABLE restaurant_branding (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  logo_url VARCHAR(500),
  text_color VARCHAR(7) DEFAULT '#1f2937',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#8b5cf6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### Menu_Sections Table
```sql
CREATE TABLE menu_sections (
  id VARCHAR(50) PRIMARY KEY,
  restaurant_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### Menu_Items Table
```sql
CREATE TABLE menu_items (
  id VARCHAR(50) PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  order_index INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE CASCADE
);
```

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details if applicable"
  }
}
```

Common HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Access denied (e.g., inactive menu)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Implementation Notes

1. **Image Storage**: Use cloud storage (AWS S3, Cloudinary) for image hosting
2. **Caching**: Implement caching for public menu data to improve performance
3. **Validation**: Validate all input data on the backend
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **CORS**: Configure CORS for frontend domain access
6. **Logging**: Log all API requests for monitoring and debugging

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `restaurants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `item_limit` INT DEFAULT 80, -- For trial plan, can be updated by subscription
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `menus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Main Menu',
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE
);

CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menu_id` INT NOT NULL,
  `parent_id` INT NULL, -- For nested categories
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image_path` VARCHAR(255) NULL,
  `is_visible` BOOLEAN DEFAULT true, -- For "Active"/"Passive"
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL -- Or ON DELETE CASCADE if subcategories should be deleted too
);

CREATE TABLE `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NULL, -- For single price
  `price_min` DECIMAL(10, 2) NULL, -- For price range start
  `price_max` DECIMAL(10, 2) NULL, -- For price range end
  `image_path` VARCHAR(255) NULL,
  `is_available` BOOLEAN DEFAULT true, -- For availability toggle
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
);

-- Example Seed Data (Optional - can be in a separate seed file)
-- INSERT INTO `users` (email, password_hash) VALUES ('owner@example.com', 'hashed_password');
-- SET @last_user_id = LAST_INSERT_ID();
-- INSERT INTO `restaurants` (user_id, name) VALUES (@last_user_id, 'My Awesome Restaurant');
-- SET @last_restaurant_id = LAST_INSERT_ID();
-- INSERT INTO `menus` (restaurant_id, name) VALUES (@last_restaurant_id, 'Dinner Menu');
-- SET @last_menu_id = LAST_INSERT_ID();

-- INSERT INTO `categories` (menu_id, name, display_order) VALUES
--   (@last_menu_id, 'Appetizers', 0),
--   (@last_menu_id, 'Main Courses', 1),
--   (@last_menu_id, 'Desserts', 2);
-- SET @appetizers_cat_id = (SELECT id FROM categories WHERE name = 'Appetizers' AND menu_id = @last_menu_id);
-- SET @main_courses_cat_id = (SELECT id FROM categories WHERE name = 'Main Courses' AND menu_id = @last_menu_id);

-- INSERT INTO `menu_items` (category_id, name, price, description, is_available, display_order) VALUES
--   (@appetizers_cat_id, 'Spring Rolls', 9.99, 'Crispy rolls with vegetable filling.', true, 0),
--   (@appetizers_cat_id, 'Garlic Bread', 6.50, 'Toasted bread with garlic butter.', true, 1),
--   (@main_courses_cat_id, 'Grilled Salmon', 22.50, 'Salmon fillet grilled to perfection.', true, 0),
--   (@main_courses_cat_id, 'Pasta Carbonara', 18.00, 'Classic pasta with creamy sauce.', false, 1);

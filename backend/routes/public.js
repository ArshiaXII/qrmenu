const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/public/menu/:restaurantSlug - Get public menu data by restaurant slug
router.get('/menu/:restaurantSlug', menuController.getPublicMenuBySlug);

module.exports = router; 
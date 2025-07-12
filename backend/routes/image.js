const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware'); // Updated import

// POST /api/image/upload - Upload an image (logo or menu item)
// Applies auth check first, then multer middleware for single file upload named 'image'
router.post('/upload', authMiddleware, uploadSingle('image'), imageController.uploadImage);

// POST /api/image/enhance - Trigger AI enhancement for an image
router.post('/enhance', authMiddleware, imageController.enhanceImage);

module.exports = router;
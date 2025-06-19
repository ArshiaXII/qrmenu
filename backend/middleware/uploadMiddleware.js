const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create uploads directory structure if it doesn't exist
const createUploadDirs = () => {
  const baseDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  const dirs = [
    baseDir,
    path.join(baseDir, 'images'),
    path.join(baseDir, 'images', 'menus'),
    path.join(baseDir, 'images', 'categories'),
    path.join(baseDir, 'images', 'items')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[Upload] Created directory: ${dir}`);
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const baseDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    let uploadPath = path.join(baseDir, 'images');

    // Determine upload path based on the route
    if (req.route.path.includes('/menus')) {
      uploadPath = path.join(uploadPath, 'menus');
    } else if (req.route.path.includes('/categories')) {
      uploadPath = path.join(uploadPath, 'categories');
    } else if (req.route.path.includes('/menu-items')) {
      uploadPath = path.join(uploadPath, 'items');
    } else {
      uploadPath = path.join(uploadPath, 'general');
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp_userId_originalname
    const uniqueSuffix = Date.now() + '_' + (req.user?.id || 'unknown');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, uniqueSuffix + '_' + name + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for single image upload
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large. Maximum size is 5MB.'
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files. Only one file allowed.'
          });
        } else {
          return res.status(400).json({
            error: 'File upload error: ' + err.message
          });
        }
      } else if (err) {
        return res.status(400).json({
          error: err.message
        });
      }

      // Add image path to request body if file was uploaded
      if (req.file) {
        // Convert absolute path to relative path for database storage
        const baseDir = path.resolve(__dirname, '..');
        const relativePath = req.file.path.replace(baseDir, '').replace(/\\/g, '/');
        req.body.image_path = relativePath;

        console.log(`[Upload] File uploaded: ${req.file.filename}`);
        console.log(`[Upload] Relative path: ${relativePath}`);
      }

      next();
    });
  };
};

// Helper function to delete uploaded file
const deleteFile = (filePath) => {
  if (filePath) {
    const baseDir = path.resolve(__dirname, '..');
    const fullPath = path.join(baseDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[Upload] Deleted file: ${fullPath}`);
    }
  }
};

module.exports = {
  upload, // Legacy export for backward compatibility
  uploadSingle,
  deleteFile
};
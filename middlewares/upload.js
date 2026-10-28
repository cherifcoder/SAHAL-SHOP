const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const uploadDir = path.join(__dirname, '../public/uploads/articles');

try {
  if (!isVercel) {
    fs.ensureDirSync(uploadDir);
  }
} catch (e) {
  // Ignorer sur Vercel
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (isVercel) {
      cb(null, '/tmp');
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers images (JPEG, JPG, PNG, GIF, WEBP) sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;

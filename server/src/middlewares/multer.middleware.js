import multer from 'multer';
import { CLOUDINARY_GAMES_FOLDER } from '../constants.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../../public/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${CLOUDINARY_GAMES_FOLDER}-${uniqueSuffix}.${fileExtension}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png, and .gif files are allowed!'));
    }
  },
});

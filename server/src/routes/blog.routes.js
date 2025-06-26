import express from 'express';
import {
  verifyAccessToken,
  verifyAdmin,
} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createBlog } from '../controllers/blog.controller.js';

const router = express.Router();

// Public routes
router.post(
  '/',
  verifyAccessToken,
  verifyAdmin,
  upload.fields([
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  createBlog
);

export default router;

import { Router } from 'express';
import {
  verifyAccessToken,
  verifyAdmin,
} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createGame } from '../controllers/game.controller.js';

const router = Router();

// SECURED ROUTES
router
  .route('/create-game')
  .post(
    verifyAccessToken,
    verifyAdmin,
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    createGame
  );

export default router;

import { Router } from 'express';
import {
  verifyAccessToken,
  verifyAdmin,
} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { pagination } from '../middlewares/pagination.middleware.js';
import {
  createGame,
  getAllGames,
  getGameByNameOrId,
} from '../controllers/game.controller.js';

const router = Router();

// SECURED ROUTES
router.route('/').get(verifyAccessToken, pagination, getAllGames);
router
  .route('/:idOrName')
  .get(verifyAccessToken, pagination, getGameByNameOrId);
router.route('/create-game').post(
  verifyAccessToken,
  verifyAdmin,
  upload.fields([
    {
      name: 'coverImage',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  createGame
);

export default router;

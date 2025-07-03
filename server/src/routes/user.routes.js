import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  reassignAccessToken,
} from '../controllers/user.controller.js';
import {
  verifyAccessToken,
  verifyRefreshToken,
} from '../middlewares/auth.middleware.js';

const router = Router();

// PUBLIC ROUTES
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// SECURED ROUTES
router.route('/logout').post(verifyAccessToken, logoutUser);
router
  .route('/refresh-user-token')
  .post(verifyRefreshToken, reassignAccessToken);

export default router;

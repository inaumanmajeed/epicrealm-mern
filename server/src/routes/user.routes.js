import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// PUBLIC ROUTES
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// SECURED ROUTES
router.route('/logout').post(verifyToken, logoutUser);

export default router;

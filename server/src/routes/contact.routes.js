import express from 'express';
import { createContact } from '../controllers/contact.controller.js';
import { contactFormMiddleware } from '../middlewares/contact.middleware.js';

const router = express.Router();

// Public routes
router.post('/', contactFormMiddleware, createContact);

export default router;

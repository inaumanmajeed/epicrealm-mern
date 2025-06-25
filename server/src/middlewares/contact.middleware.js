import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Rate limiting middleware for contact form submissions
export const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact form submissions per windowMs
  message: {
    success: false,
    message:
      'Too many contact form submissions from this IP. Please try again after 15 minutes.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Too many contact form submissions from this IP. Please try again after 15 minutes.',
      retryAfter: 15 * 60,
    });
  },
});

// Validation rules for contact form
export const validateContactForm = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters')
    .escape(), // Escape HTML entities

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .escape(), // Escape HTML entities for basic XSS prevention
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }

  next();
};

// Middleware to sanitize contact form data
export const sanitizeContactData = (req, res, next) => {
  console.log('🚀 ~ sanitizeContactData ~ req:', req.body);
  try {
    const { name, email, phone, subject, message } = req.body;

    // Additional sanitization beyond express-validator
    if (name) {
      req.body.name = name.replace(/[<>]/g, '').substring(0, 100);
    }

    if (email) {
      req.body.email = email
        .toLowerCase()
        .replace(/[<>]/g, '')
        .substring(0, 255);
    }

    if (phone) {
      req.body.phone = phone.replace(/[^0-9+\-\s()]/g, '').substring(0, 20);
    }

    if (subject) {
      req.body.subject = subject.replace(/[<>]/g, '').substring(0, 200);
    }

    if (message) {
      req.body.message = message.replace(/[<>]/g, '').substring(0, 2000);
    }

    next();
  } catch (error) {
    console.error('Error sanitizing contact data:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
  }
};

// Middleware to check for potential spam content
export const checkSpamContent = (req, res, next) => {
  try {
    const { message, subject, name } = req.body;

    // Simple spam detection patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
      /\b(click here|free money|make money fast|guaranteed)\b/i,
      /\b(urgent|immediate|limited time|act now)\b/i,
      /(http[s]?:\/\/[^\s]+)/g, // URLs in message
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, // Email addresses in message
    ];

    const textToCheck = `${message} ${subject || ''} ${name}`.toLowerCase();

    const isSpam = spamPatterns.some((pattern) => pattern.test(textToCheck));

    if (isSpam) {
      return res.status(400).json({
        success: false,
        message:
          'Your message appears to contain spam content. Please revise and try again.',
      });
    }

    next();
  } catch (error) {
    console.error('Error checking spam content:', error);
    next(); // Continue even if spam check fails
  }
};

// Combined middleware for contact form submission
export const contactFormMiddleware = [
  contactRateLimit,
  sanitizeContactData,
  validateContactForm,
  handleValidationErrors,
  checkSpamContent,
];

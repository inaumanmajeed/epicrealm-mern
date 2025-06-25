import Contact from '../models/contact.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  sendContactConfirmationEmail,
  sendContactNotificationToAdmin,
} from '../utils/nodeMailer.js';

// Create a new contact submission
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields',
      });
    }

    // Get client IP and user agent for security tracking
    const ipAddress =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const userAgent = req.get('User-Agent');

    // Create contact record
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      ipAddress,
      userAgent,
      isEmailSent: false,
    };

    const contact = new Contact(contactData);
    await contact.save();

    // Sending emails in parallel for better performance
    const emailPromises = [
      sendContactConfirmationEmail(contact.email, contact.name),
      sendContactNotificationToAdmin(contactData),
    ];

    try {
      await Promise.all(emailPromises);
      // Update contact to mark emails as sent
      contact.isEmailSent = true;
      await contact.save();
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
      // Log the error for admin review
    }

    res.status(201).json(new ApiResponse(201, 'Query submitted successfully'));
  } catch (error) {
    console.error('Error creating contact:', error);

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Handle duplicate email submissions (if you want to prevent spam)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A submission with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later.',
    });
  }
};

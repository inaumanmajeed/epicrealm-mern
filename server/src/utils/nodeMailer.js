import nodemailer from 'nodemailer';
import {
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER,
} from '../constants.js';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Epic Realm" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send confirmation email to the user who submitted the contact form
export const sendContactConfirmationEmail = async (userEmail, userName) => {
  try {
    const subject = "We've received your message - Epic Realm";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Thank you for contacting us!</h2>
          <p style="color: #555; line-height: 1.6;">Dear ${userName || 'Valued Customer'},</p>
          <p style="color: #555; line-height: 1.6;">
            We have successfully received your message and want to thank you for reaching out to us. 
            Our team will review your inquiry and respond to you as soon as possible, typically within 24-48 hours.
          </p>
          <p style="color: #555; line-height: 1.6;">
            In the meantime, feel free to explore our game collection and latest updates on our website.
          </p>
          <div style="margin: 30px 0; padding: 20px; background-color: #e8f4fd; border-left: 4px solid #3498db; border-radius: 5px;">
            <p style="margin: 0; color: #2980b9; font-weight: 500;">
              📧 This email confirms that we've received your message at ${userEmail}
            </p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            Best regards,<br>
            <strong>Epic Realm Support Team</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `;

    const text = `Dear ${userName || 'Valued Customer'},\n\nWe have successfully received your message and will respond to you as soon as possible, typically within 24-48 hours.\n\nBest regards,\nEpic Realm Support Team`;

    return await sendEmail(userEmail, subject, text, html);
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    throw error;
  }
};

// Send the user's query to the admin/support team
export const sendContactNotificationToAdmin = async (contactData) => {
  try {
    const { name, email, subject, message, phone } = contactData;
    const adminSubject = `New Contact Form Submission - ${subject || 'General Inquiry'}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #e74c3c; margin-bottom: 20px;">🔔 New Contact Form Submission</h2>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0; color: #856404;">Contact Details</h3>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 120px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">
                <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a>
              </td>
            </tr>
            ${
              phone
                ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${phone}</td>
            </tr>
            `
                : ''
            }
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${subject || 'No subject provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
              <td style="padding: 10px; color: #333; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              📅 Submitted on: ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${email}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reply to Customer
            </a>
          </div>
        </div>
      </div>
    `;

    const text = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}Subject: ${subject || 'No subject provided'}\n\nMessage:\n${message}\n\nSubmitted on: ${new Date().toLocaleString()}`;

    return await sendEmail(EMAIL_USER, adminSubject, text, html);
  } catch (error) {
    console.error('Error sending contact notification to admin:', error);
    throw error;
  }
};

import * as Yup from "yup";

export const contactValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .required("Name is required"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .max(255, "Email cannot exceed 255 characters")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .max(20, "Phone number cannot exceed 20 characters"),

  subject: Yup.string().max(200, "Subject cannot exceed 200 characters"),

  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters")
    .required("Message is required"),
});

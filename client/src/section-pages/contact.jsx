import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "aos/dist/aos.css";
import toast from "react-hot-toast";
import useContactApi from "../apis/useContactApi";
import { contactValidationSchema } from "../utils/contactValidationSchema";

export default function Contactus() {
  const { submitContact } = useContactApi();

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Show loading toast
    const loadingToast = toast.loading("Sending your message...", {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });

    try {
      const result = await submitContact.mutateAsync(values);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        // Show success toast
        toast.success(
          result.message ||
            "Your message has been sent successfully! We'll get back to you soon."
        );
        resetForm();
      } else {
        // Show error toast for unsuccessful response
        toast.error(
          result.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      console.error("Contact form error:", error);

      let errorMessage = "Failed to send message. Please try again later.";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 429) {
          errorMessage =
            data.message ||
            "Too many submissions. Please wait before trying again.";
        } else if (status === 400 && data.errors) {
          errorMessage = data.errors.map((err) => err.message).join(", ");
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#EF4444",
          color: "#fff",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div
          className="col-lg-10 offset-lg-1"
          data-aos="fade-up"
          data-aos-once="true"
          data-aos-delay="200"
          data-aos-duration="1000"
          data-aos-easing="ease"
        >
          <p className="lead">
            Please read our <a href="/faq">faq page</a> first. If you got any
            questions, please do not hesitate to send us a message.
          </p>

          <div className="contact_form_wrapper">
            <Formik
              initialValues={initialValues}
              validationSchema={contactValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values, errors, touched }) => (
                <Form
                  name="contactForm"
                  id="contact_form"
                  className="form-border"
                >
                  <div className="row">
                    <div className="col-lg-6 mb10">
                      <div className="field-set">
                        <span className="d-label">Name *</span>
                        <Field
                          type="text"
                          name="name"
                          id="name"
                          className={`form-control ${
                            errors.name && touched.name ? "is-invalid" : ""
                          }`}
                          placeholder="Your Name"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="invalid-feedback"
                          style={{
                            color: "#dc3545",
                            fontSize: "0.875em",
                            marginTop: "0.25rem",
                          }}
                        />
                      </div>

                      <div className="field-set">
                        <span className="d-label">Email *</span>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className={`form-control ${
                            errors.email && touched.email ? "is-invalid" : ""
                          }`}
                          placeholder="Your Email"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="invalid-feedback"
                          style={{
                            color: "#dc3545",
                            fontSize: "0.875em",
                            marginTop: "0.25rem",
                          }}
                        />
                      </div>

                      <div className="field-set">
                        <span className="d-label">Phone</span>
                        <Field
                          type="tel"
                          name="phone"
                          id="phone"
                          className={`form-control ${
                            errors.phone && touched.phone ? "is-invalid" : ""
                          }`}
                          placeholder="+92 300 1234567"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="invalid-feedback"
                          style={{
                            color: "#dc3545",
                            fontSize: "0.875em",
                            marginTop: "0.25rem",
                          }}
                        />
                      </div>

                      <div className="field-set">
                        <span className="d-label">Subject</span>
                        <Field
                          type="text"
                          name="subject"
                          id="subject"
                          className={`form-control ${
                            errors.subject && touched.subject
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholder="Subject of your message"
                        />
                        <ErrorMessage
                          name="subject"
                          component="div"
                          className="invalid-feedback"
                          style={{
                            color: "#dc3545",
                            fontSize: "0.875em",
                            marginTop: "0.25rem",
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="field-set">
                        <span className="d-label">Message *</span>
                        <Field
                          as="textarea"
                          name="message"
                          id="message"
                          className={`form-control ${
                            errors.message && touched.message
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholder="Your Message"
                          rows="8"
                        />
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6c757d",
                            textAlign: "right",
                            marginTop: "0.25rem",
                          }}
                        >
                          {values.message?.length || 0}/2000 characters
                        </div>
                        <ErrorMessage
                          name="message"
                          component="div"
                          className="invalid-feedback"
                          style={{
                            color: "#dc3545",
                            fontSize: "0.875em",
                            marginTop: "0.25rem",
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div id="submit" className="mt30">
                        <button
                          type="submit"
                          id="send_message"
                          className="btn-main"
                          disabled={isSubmitting || submitContact.isPending}
                          style={{
                            opacity:
                              isSubmitting || submitContact.isPending ? 0.7 : 1,
                            cursor:
                              isSubmitting || submitContact.isPending
                                ? "not-allowed"
                                : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            justifyContent: "center",
                          }}
                        >
                          {(isSubmitting || submitContact.isPending) && (
                            <span className="spinner"></span>
                          )}
                          {isSubmitting || submitContact.isPending
                            ? "Sending..."
                            : "Send Message"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

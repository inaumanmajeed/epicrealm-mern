import React, { useEffect } from "react";
import { Parallax } from "react-parallax";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";
import useAuthApi from "../apis/useAuthApi";
import { useFormik } from "formik";
import registerValidationSchema from "../utils/registerValidationSchema.js";

const image1 = "./img/background/5.webp";

const GlobalStyles = createGlobalStyle`
  .react-parallax-bgimage {
    transform: translate3d(-50%, 0, 0px) !important;
  }
`;

export default function Home() {
  const { register } = useAuthApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loader = document.getElementById("mainpreloader");
      if (loader)
        setTimeout(() => {
          loader.classList.add("fadeOut");
          loader.style.display = "none";
        }, 600);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      userName: "",
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      rePassword: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        await register.mutateAsync(values);
        navigate("/login");
      } catch (error) {
        console.error("Register error:", error);
      }
    },
  });

  return (
    <>
      {/* HEAD */}
      <link className="logo__img" rel="icon" href="./img/icon.png" />
      <title>EpicRealm - Premium Game Hosting Solutions</title>
      <GlobalStyles />

      {/* LOADER */}
      <div id="mainpreloader">
        <Preloader />
      </div>

      {/* MENU */}
      <div className="home dark-scheme">
        <header id="header-wrap">
          <Navbar />
        </header>

        {/* section */}
        <Parallax className="" bgImage={image1} strength={5}>
          <div className="de-gradient-edge-top"></div>
          <div className="de-gradient-edge-bottom"></div>
          <section className="no-bg">
            <div className="container z-9">
              <div className="row align-items-center">
                <div className="col-lg-8 offset-lg-2">
                  <div
                    className="p-5 rounded-10 shadow-soft bg-dark-1"
                    id="login"
                  >
                    <form
                      name="contactForm"
                      id="contact_form"
                      className="form-border"
                      onSubmit={formik.handleSubmit}
                    >
                      <h4>Don&apos;t have an account? Register now.</h4>
                      <p>
                        Welcome to Epic Realm. We&apos;re excited to have you on
                        board. By creating an account with us, you&apos;ll gain
                        access to a range of benefits and convenient features
                        that will enhance your car rental experience.
                      </p>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Name:</label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.name}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                              <div className="text-danger">
                                {formik.errors.name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Email Address:</label>
                            <input
                              type="text"
                              name="email"
                              id="email"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.email}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.email && formik.errors.email && (
                              <div className="text-danger">
                                {formik.errors.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Choose a Username:</label>
                            <input
                              type="text"
                              name="userName"
                              id="userName"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.userName}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.userName &&
                              formik.errors.userName && (
                                <div className="text-danger">
                                  {formik.errors.userName}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Phone:</label>
                            <input
                              type="text"
                              name="phoneNumber"
                              id="phoneNumber"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.phoneNumber}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.phoneNumber &&
                              formik.errors.phoneNumber && (
                                <div className="text-danger">
                                  {formik.errors.phoneNumber}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Password:</label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.password}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.password &&
                              formik.errors.password && (
                                <div className="text-danger">
                                  {formik.errors.password}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="field-set">
                            <label>Re-enter Password:</label>
                            <input
                              type="password"
                              name="rePassword"
                              id="re-password"
                              className="form-control"
                              onChange={formik.handleChange}
                              value={formik.values.rePassword}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.rePassword &&
                              formik.errors.rePassword && (
                                <div className="text-danger">
                                  {formik.errors.rePassword}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="col-lg-6 offset-lg-3 text-center my-3">
                          <div id="submit">
                            <input
                              type="submit"
                              id="send_message"
                              value={
                                register.isLoading
                                  ? "Registering..."
                                  : "Register Now"
                              }
                              className="btn-main color-2"
                              disabled={register.isLoading}
                            />
                          </div>
                          {register.isError && (
                            <div className="text-danger mt-2">
                              {register.error?.response?.data?.message ||
                                "Registration failed"}
                            </div>
                          )}
                          {register.isSuccess && (
                            <div className="text-success mt-2">
                              Registration successful!
                            </div>
                          )}
                        </div>

                        <div className="col-lg-6 offset-lg-3">
                          <div className="title-line">
                            Or&nbsp;sign&nbsp;up&nbsp;with
                          </div>
                          <div className="row g-2">
                            <div className="col-lg-6">
                              <Link
                                className="btn-sc btn-fullwidth mb10"
                                to="/"
                              >
                                <img src="./img/svg/google_icon.svg" alt="" />
                                Google
                              </Link>
                            </div>
                            <div className="col-lg-6">
                              <Link
                                className="btn-sc btn-fullwidth mb10"
                                to="/"
                              >
                                <img src="./img/svg/facebook_icon.svg" alt="" />
                                Facebook
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Parallax>

        {/* footer */}
        <Footer />
      </div>
      <ScrollToTopBtn />
    </>
  );
}

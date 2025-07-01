import React, { useEffect } from "react";
import { Parallax } from "react-parallax";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAuthApi from "../apis/useAuthApi";
import { useAuth } from "../context/AuthContext";
import { isEmail } from "validator";

const image1 = "./img/background/2.webp";

const GlobalStyles = createGlobalStyle`
  .react-parallax-bgimage {
    transform: translate3d(-50%, 0, 0px) !important;
  }
  .h-100{
    height: 100vh !important;
  }
`;

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required("Email or username is required"),
  password: Yup.string().required("Password is required"),
});

export default function Home() {
  const { login: loginMutation } = useAuthApi();
  const { login: authLogin } = useAuth();
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
          <section className="no-bg h-100">
            <div className="container z-9">
              <div className="row align-items-center">
                <div className="col-lg-4 offset-lg-4">
                  <div
                    className="padding40 rounded-10 shadow-soft bg-dark-1"
                    id="login"
                  >
                    <div className="text-center">
                      <h4>Sign in to your account</h4>
                    </div>
                    <div className="spacer-10"></div>
                    <Formik
                      initialValues={{
                        identifier: "",
                        password: "",
                        remember: false,
                      }}
                      validationSchema={LoginSchema}
                      onSubmit={async (
                        values,
                        { setSubmitting, setStatus }
                      ) => {
                        setStatus(null);
                        const payload = isEmail(values.identifier)
                          ? {
                              email: values.identifier,
                              password: values.password,
                            }
                          : {
                              userName: values.identifier,
                              password: values.password,
                            };
                        try {
                          const response = await loginMutation.mutateAsync(
                            payload
                          );
                          console.log("Login response:", response);

                          if (response?.status === 200) {
                            // Update auth context with user data and tokens
                            authLogin(response.data.user, {
                              accessToken: response.data.accessToken,
                              refreshToken: response.data.refreshToken,
                            });

                            // Navigate to home
                            navigate("/");
                          }
                        } catch (error) {
                          console.error("Login error:", error);
                          setStatus(
                            error?.response?.data?.message || "Login failed"
                          );
                        }
                        setSubmitting(false);
                      }}
                    >
                      {({ isSubmitting, status }) => (
                        <Form className="form-border">
                          <div className="field-set">
                            <label>Email or Username</label>
                            <Field
                              type="text"
                              name="identifier"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="identifier"
                              component="div"
                              className="text-danger small"
                            />
                          </div>
                          <div className="field-set">
                            <label>Password</label>
                            <Field
                              type="password"
                              name="password"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="text-danger small"
                            />
                          </div>
                          <div className="field-set">
                            <Field
                              type="checkbox"
                              name="remember"
                              id="remember"
                            />
                            <label htmlFor="remember">
                              <span className="op-5">&nbsp;Remember me</span>
                            </label>
                            <br />
                          </div>
                          <div className="spacer-20"></div>
                          {status && (
                            <div className="text-danger small mb-2">
                              {status}
                            </div>
                          )}
                          <div id="submit">
                            <button
                              type="submit"
                              className="btn-main btn-fullwidth rounded-3"
                              disabled={isSubmitting || loginMutation.isLoading}
                            >
                              {isSubmitting || loginMutation.isLoading
                                ? "Signing In..."
                                : "Sign In"}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                    <div className="title-line">
                      Or&nbsp;login&nbsp;up&nbsp;with
                    </div>
                    <div className="row g-2">
                      <div className="col-lg-6">
                        <Link className="btn-sc btn-fullwidth mb10" to="/">
                          <img src="./img/svg/google_icon.svg" alt="" />
                          Google
                        </Link>
                      </div>
                      <div className="col-lg-6">
                        <Link className="btn-sc btn-fullwidth mb10" to="/">
                          <img src="./img/svg/facebook_icon.svg" alt="" />
                          Facebook
                        </Link>
                      </div>
                    </div>
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

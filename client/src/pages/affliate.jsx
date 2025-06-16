import React, { useEffect } from "react";
// import { Helmet } from "react-helmet-async";
import { Parallax } from "react-parallax";
import { Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";

const image1 = "./img/background/subheader-affliate.webp";

const GlobalStyles = createGlobalStyle`
  .react-parallax-bgimage {
    transform: translate3d(-50%, -12%, 0px) !important;
  }
`;

export default function Home() {
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
      {/* <Helmet> */}
        <link className="logo__img" rel="icon" href="./img/icon.png" />
        <title>EpicRealm - Premium Game Hosting Solutions</title>
      {/* </Helmet> */}

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
          <section className="no-bg">
            <div className="container z-9">
              <div className="row">
                <div className="col-lg-12">
                  <div className="subtitle wow fadeInUp mb-3">
                    Affliate program
                  </div>
                </div>
                <div className="col-lg-6">
                  <h2>Join our affiliate team and Earn 10% commission</h2>
                </div>
              </div>
            </div>
          </section>
        </Parallax>

        {/* section */}
        <section>
          <div className="container">
            <div className="row row-flex">
              <div className="col-lg-4 mb30">
                <div className="de-step-s1">
                  <div className="d-number">1</div>
                  <h4>Join for Affiliate Program</h4>
                  <p className="justify">
                    Sign up for our Affiliate Program today and become a part of
                    our team! Joining is quick and easy simply register on our
                    platform to start earning commissions.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mb30">
                <div className="de-step-s1">
                  <div className="d-number">2</div>
                  <h4>Promote Our Website</h4>
                  <p className="justify">
                    Promote our website and products to your audience. Share
                    unique referral links provided in your affiliate dashboard
                    across your social media, website, or blog to drive traffic.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mb30">
                <div className="de-step-s1">
                  <div className="d-number">3</div>
                  <h4>Get Your Commision</h4>
                  <p className="justify">
                    Earn commissions for every successful referral! Once your
                    referrals make a purchase through your link, you will receive
                    commissions directly to your account. Start earning rewards
                    for every sale today!
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-12 text-center">
              <Link className="btn-main btn-lg" to="/register">
                Join Today
              </Link>
            </div>
          </div>
        </section>

        {/* footer */}
        <Footer />
      </div>
      <ScrollToTopBtn />
    </>
  );
}

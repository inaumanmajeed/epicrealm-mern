import React, { useEffect, useState } from "react";

import { Parallax } from "react-parallax";
import { useLocation } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import DesktopServer from "../section-pages/pricelist-horizontal";
import MobileServer from "../section-pages/pricelist-1";
import Section1 from "../section-pages/section-1";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";
import PaymentMethods from "../section-pages/Payment";

const image2 = "./img/background/subheader-game.webp";

const GlobalStyles = createGlobalStyle`
  // Your global styles here...
`;

export default function Pricing() {
  const { state } = useLocation();
  const game = state?.game;

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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

        <Parallax className="bgcolor" bgImage={image2} strength={300}>
          <div className="de-gradient-edge-bottom"></div>
          <section className="no-bg">
            <div className="container z-1000">
              <div className="row gx-5 align-items-center">
                {game && (
                  <>
                    <div className="col-lg-2 d-lg-block d-none">
                      <img
                        src={game.image}
                        className="img-fluid"
                        alt={game.title}
                      />
                    </div>
                    <div className="col-lg-6">
                      <div className="subtitle mb-3">Server hosting</div>
                      <h2 className="mb-0">{game.title}</h2>
                      <div className="de-rating-ext">
                        <span className="d-stars">
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star-half"></i>
                        </span>
                        <span className="d-val">4.75</span>
                        based on <strong>4086</strong> reviews.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </Parallax>

        {/* section */}
        <section className="no-top">
          {/* <Pricelist /> */}
          {isDesktop ? <DesktopServer /> : <MobileServer />}
        </section>

        {/* section */}
        <section className="no-top">
          <PaymentMethods />
        </section>
        {/* section */}
        <section className="no-top">
          <Section1 />
        </section>

        {/* footer */}
        <Footer />
      </div>
      <ScrollToTopBtn />
    </>
  );
}

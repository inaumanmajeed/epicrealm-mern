import React, { useEffect } from "react";

import { Parallax } from "react-parallax";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import Collection from "../section-pages/Collection";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";

const image1 = "../../img/background/3.webp";

const GlobalStyles = createGlobalStyle`

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

      <link rel="icon" href="./img/icon.png" />
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
        <Parallax className="" bgImage={image1} strength={300}>
          <div className="de-gradient-edge-top"></div>
          <div className="de-gradient-edge-bottom"></div>
          <section className="no-bg">
            <Collection />
          </section>
        </Parallax>

        {/* section */}
        {/* <section className="no-top">
          <Help />
        </section> */}

        {/* footer */}
        <Footer />
      </div>
      <ScrollToTopBtn />
    </>
  );
}

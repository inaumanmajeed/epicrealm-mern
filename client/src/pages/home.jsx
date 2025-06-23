import React, { useEffect } from "react";
import { Parallax } from "react-parallax";
// import { Helmet } from 'react-helmet-async';
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import SwiperComponent from "../section-pages/slider";
import Sectioncol from "../section-pages/section-3col";
import Location from "../section-pages/Location";
import Section1 from "../section-pages/section-1";
import Collection from "../section-pages/Collection";
import Download from "../section-pages/Download";
import Blog from "../section-pages/Blog";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";

const image1 = "../../img/background/bgMain.jpg";

const GlobalStyles = createGlobalStyle`
  .navbar-brand .imginit{
      display: block ;
    }
    .navbar-brand .imgsaly{
      display: none !important;
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

        {/* slider */}
        <section className="no-padding">
          <SwiperComponent />
        </section>

        {/* Support Section*/}
        <section className="no-bottom">
          <Sectioncol />
        </section>

        {/* Gaming Top Collections */}
        <Parallax className="" bgImage={image1} strength={300}>
          <div className="de-gradient-edge-top"></div>
          <div className="de-gradient-edge-bottom"></div>
          <section className="no-bg">
            <Collection />
          </section>
        </Parallax>

        {/* Blog */}
        <section className="no-bottom no-top">
          <Blog />
        </section>
        {/* Location */}
        <section className="no-bottom">
          <Location />
        </section>

        {/* Features */}
        <section className="no-bottom">
          <Section1 />
        </section>

        {/* Mobile App */}
        <section className="">
          <Download />
        </section>

        {/* section */}
        {/* <section className="no-top no-bottom">
          <Help />
        </section> */}

        {/* section */}
        {/* <section className="">
          <Payment />
        </section> */}

        {/* footer */}
        <Footer />
      </div>
      <ScrollToTopBtn />
    </>
  );
}

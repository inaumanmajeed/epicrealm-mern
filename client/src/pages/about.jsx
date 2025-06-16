import React, { useEffect } from "react";
// import { Helmet } from "react-helmet-async";
import { Parallax } from "react-parallax";
import { Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Preloader from "../layout/preloader";
import Reviews from "../section-pages/CustomerReviews";
import Footer from "../section-pages/footer";
import ScrollToTopBtn from "../layout/ScrollToTop";
import { createGlobalStyle } from "styled-components";

const image1 = "./img/background/subheader-about.webp";

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
                  <div className="subtitle  mb-3">About us</div>
                </div>
                <div className="col-lg-6">
                  <h2 className=" mb20" data-wow-delay=".2s">
                    This is our story
                  </h2>
                </div>
              </div>
            </div>
          </section>
        </Parallax>

        {/* section */}
        <section>
          <div className="container">
            <div className="row align-items-center gh-5">
              <div className="col-lg-6 position-relative">
                <div className="images-deco-1">
                  <img
                    src="./img/misc/building.webp"
                    className="d-img-1"
                    alt=""
                  />
                  <img
                    src="./img/misc/girl-ai.webp"
                    className="d-img-2"
                    alt=""
                  />
                  <div className="d-img-3 bg-color"></div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="subtitle mb20">We are Playhost</div>
                <h2>The beginning</h2>
                <p>
                  In the bustling world of gaming, a group of passionate
                  enthusiasts came together to create an unparalleled
                  experience. Fueled by a shared vision, they built EpicRealm, a
                  haven for gamers seeking top-notch servers and immersive
                  gameplay. With premium hardware, lightning-fast support, and
                  unmatched DDoS protection, EpicRealm became a trusted name in
                  the gaming community. They believed in empowering every gamer
                  to unlock their full potential, making dreams a reality. Their
                  journey continues, driven by innovation and a commitment to
                  excellence.
                </p>
                <div className="year-card ">
                  <h1>
                    <span className="id-color">25</span>
                  </h1>
                  <div className="atr-desc">
                    Years
                    <br />
                    Experience
                    <br />
                    Hosting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* section */}
        <section className="no-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <div className="row gx-5">
                  <div className="col-lg-6 col-md-6">
                    <h4>Our Vision</h4>
                    <p className="justify">
                      At EpicRealm, our vision is to transform the gaming world
                      by offering state-of-the-art hosting solutions that
                      empower gamers globally. We aim to be the leading name in
                      the industry, recognized for our innovation, reliability,
                      and outstanding customer support. We see a future where
                      every gamer, regardless of location, enjoys seamless and
                      immersive gameplay. By setting new standards in the gaming
                      industry with premium hardware and advanced technologies,
                      we strive to unlock the full potential of gaming for
                      everyone.
                    </p>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <h4>Our Mission</h4>
                    <p className="justify">
                      Our mission is to deliver top-tier game hosting services
                      that cater to the diverse needs of the global gaming
                      community. We are dedicated to offering robust and secure
                      server solutions with rapid setup and superior
                      performance. At EpicRealm, we prioritize customer
                      satisfaction by providing round-the-clock support and
                      proactive DDoS protection. We continuously innovate to
                      enhance our infrastructure, ensuring that our clients
                      enjoy the best possible gaming experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* section */}
        <section className="no-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-3">
                <div className="subtitle mb20">Our solid team</div>
                <h2 className="mb20 wow fadeInUp">Behind the scene</h2>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6 mb-sm-30">
                <div className="f-profile text-center">
                  <div className="fp-wrap f-invert">
                    <div className="fpw-overlay">
                      <div className="fpwo-wrap">
                        <div className="fpwow-icons">
                          <Link to="/">
                            <i className="fa-brands fa-facebook fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-twitter fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-linkedin fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-instagram fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-tiktok fa-lg"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="fpw-overlay-btm"></div>
                    <img
                      src="./img/team/1.jpg"
                      className="fp-image img-fluid"
                      alt=""
                    />
                  </div>
                  <h4>CEO</h4>
                  CEO Founder
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6 mb-sm-30">
                <div className="f-profile text-center">
                  <div className="fp-wrap f-invert">
                    <div className="fpw-overlay">
                      <div className="fpwo-wrap">
                        <div className="fpwow-icons">
                          <Link to="/">
                            <i className="fa-brands fa-facebook fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-twitter fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-linkedin fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-instagram fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-tiktok fa-lg"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="fpw-overlay-btm"></div>
                    <img
                      src="./img/team/2.jpg"
                      className="fp-image img-fluid"
                      alt=""
                    />
                  </div>
                  <h4>Anna Shepard</h4>
                  Developer
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6 mb-sm-30">
                <div className="f-profile text-center">
                  <div className="fp-wrap f-invert">
                    <div className="fpw-overlay">
                      <div className="fpwo-wrap">
                        <div className="fpwow-icons">
                          <Link to="/">
                            <i className="fa-brands fa-facebook fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-twitter fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-linkedin fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-instagram fa-lg"></i>
                          </Link>
                          <Link to="/">
                            <i className="fa-brands fa-tiktok fa-lg"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="fpw-overlay-btm"></div>
                    <img
                      src="./img/team/3.jpg"
                      className="fp-image img-fluid"
                      alt=""
                    />
                  </div>
                  <h4>Lilly Edward</h4>
                  Developer
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* section */}
        <section className="no-top">
          <Reviews />
        </section>

        {/* section */}
        <section className="no-top">
          <div className="container">
            <div className="row text-center">
              <div className="col-lg-3 col-sm-6 mb-sm-30 position-relative">
                <div className="de_count text-light wow fadeInUp">
                  <h3 className="timer id-color">15425</h3>
                  <h4 className="text-uppercase">
                    Happy
                    <br />
                    Gamers
                  </h4>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-sm-30 position-relative">
                <div className="de_count text-light wow fadeInUp">
                  <h3 className="timer text-line">8745</h3>
                  <h4 className="text-uppercase">
                    Servers
                    <br />
                    Ordered
                  </h4>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-sm-30 position-relative">
                <div className="de_count text-light wow fadeInUp">
                  <h3 className="timer id-color">235</h3>
                  <h4 className="text-uppercase">
                    Awards
                    <br />
                    Winning
                  </h4>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-sm-30 position-relative">
                <div className="de_count text-light wow fadeInUp">
                  <h3 className="timer text-line">15</h3>
                  <h4 className="text-uppercase">
                    Years
                    <br />
                    Experience
                  </h4>
                </div>
              </div>
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

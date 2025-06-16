import React from "react";
import {
  Navigation,
  Pagination,
  Autoplay,
  Thumbs,
  FreeMode,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router";

const YourComponent = () => {
  const [thumbsSwiper, setThumbsSwiper] = React.useState(null);
  return (
    <div className="doubleslider">
      <Swiper
        className="mainslider mobile__slider"
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[Navigation, Pagination, Autoplay, Thumbs]}
        loop={true}
        spaceBetween={50}
        slidesPerView={1}
        // navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
      >
        <SwiperSlide>
          <div
            className="swiper-inner bg__wrapper"
            style={{
              backgroundImage: `url("./img/slider/valorant.jpg")`,
            }}
          >
            <div className="sw-caption">
              <div className="container">
                <div className="row gx-5 align-items-center text-center">
                  <div className="col-lg-8 mx-auto">
                    <div className="subtitle blink mb-3">
                      Servers Are Available
                    </div>
                    {/* <h1 className="slider-title text-uppercase mb-1">
                      Cyber Nexus
                    </h1> */}
                  </div>
                  <div className="col-lg-6 mx-auto">
                    {/* <p className="slider-text">
                      Aute esse non magna elit dolore dolore dolor sit est. Ea
                      occaecat ea duis laborum reprehenderit id cillum tempor
                      cupidatat qui nisi proident nostrud dolore.
                    </p> */}
                    {/* <div className="spacer-10"></div> */}
                    <Link className="btn-main" to="/pricing">
                      Order Your Game Server Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="sw-overlay"></div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            className="swiper-inner bg__wrapper"
            style={{
              backgroundImage: `url("./img/slider/eden.jpg")`,
            }}
          >
            <div className="sw-caption">
              <div className="container">
                <div className="row gx-5 align-items-center text-center">
                  <div className="col-lg-8 mx-auto">
                    <div className="subtitle blink mb-3">
                      Servers Are Available
                    </div>
                    {/* <h1 className="slider-title text-uppercase mb-1">
                      Ancient Realms
                    </h1> */}
                  </div>
                  <div className="col-lg-6 mx-auto">
                    {/* <p className="slider-text">
                      Aute esse non magna elit dolore dolore dolor sit est. Ea
                      occaecat ea duis laborum reprehenderit id cillum tempor
                      cupidatat qui nisi proident nostrud dolore.
                    </p> */}
                    {/* <div className="spacer-10"></div> */}
                    <Link className="btn-main mb10" to="/pricing">
                      Order Your Game Server Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="sw-overlay"></div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            className="swiper-inner bg__wrapper"
            style={{
              backgroundImage: `url("./img/slider/spiderman.jpg")`,
            }}
          >
            <div className="sw-caption">
              <div className="container">
                <div className="row gx-5 align-items-center text-center">
                  <div className="col-lg-8 mx-auto">
                    <div className="subtitle blink mb-3">
                      Servers Are Available
                    </div>
                    {/* <h1 className="slider-title text-uppercase mb-1">
                      Thunder and City
                    </h1> */}
                  </div>
                  <div className="col-lg-6 mx-auto">
                    {/* <p className="slider-text">
                      Aute esse non magna elit dolore dolore dolor sit est. Ea
                      occaecat ea duis laborum reprehenderit id cillum tempor
                      cupidatat qui nisi proident nostrud dolore.
                    </p> */}
                    {/* <div className="spacer-10"></div>  */}
                    <Link className="btn-main mb10" to="/pricing">
                      Order Your Game Server Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="sw-overlay"></div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            className="swiper-inner bg__wrapper"
            style={{
              backgroundImage: `url("./img/slider/nier.jpg")`,
            }}
          >
            <div className="sw-caption">
              <div className="container">
                <div className="row gx-5 align-items-center text-center">
                  <div className="col-lg-8 mx-auto">
                    <div className="subtitle blink mb-3">
                      Servers Are Available
                    </div>
                    {/* <h1 className="slider-title text-uppercase mb-1">
                      Raceway Revolution
                    </h1> */}
                  </div>
                  <div className="col-lg-6 mx-auto">
                    {/* <p className="slider-text">
                      Aute esse non magna elit dolore dolore dolor sit est. Ea
                      occaecat ea duis laborum reprehenderit id cillum tempor
                      cupidatat qui nisi proident nostrud dolore.
                    </p> */}
                    {/* <div className="spacer-10"></div> */}
                    <Link className="btn-main mb10" to="/pricing">
                      Order Your Game Server Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="sw-overlay"></div>
          </div>
        </SwiperSlide>
        {/* Add more slides here */}
      </Swiper>
      <Swiper
        direction={"vertical"}
        onSwiper={setThumbsSwiper}
        freeMode={true}
        spaceBetween={10}
        slidesPerView={3}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumb-slider hide-on-mobile"
      >
        <SwiperSlide
          className="swiper-slide"
          style={{
            backgroundImage: `url("./img/slider/valorantSlide.jpg")`,
            objectFit: "cover",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="sw-caption-thumb">
            <span className="d-tag">15% OFF</span>
            <h3>VALORANT</h3>
          </div>
        </SwiperSlide>
        <SwiperSlide
          className="swiper-slide"
          style={{
            backgroundImage: `url("./img/slider/edenSlider.jpg")`,
          }}
        >
          <div className="sw-caption-thumb">
            <span className="d-tag">15% OFF</span>
            <h3>ELDEN RING</h3>
          </div>
        </SwiperSlide>
        <SwiperSlide
          className="swiper-slide"
          style={{
            backgroundImage: `url("./img/slider/spidermanSlider.jpg")`,
          }}
        >
          <div className="sw-caption-thumb">
            <span className="d-tag">15% OFF</span>
            <h3>SPIDERMAN</h3>
          </div>
        </SwiperSlide>
        <SwiperSlide
          className="swiper-slide"
          style={{
            backgroundImage: `url("./img/slider/nierSlider.jpg")`,
          }}
        >
          <div className="sw-caption-thumb">
            <span className="d-tag">15% OFF</span>
            <h3>NIER: AUTOMATA</h3>
          </div>
        </SwiperSlide>
        {/* Add more thumbnail slides here */}
      </Swiper>
    </div>
  );
};

export default YourComponent;

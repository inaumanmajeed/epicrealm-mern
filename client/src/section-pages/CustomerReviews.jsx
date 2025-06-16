import { Swiper, SwiperSlide } from "swiper/react";
import React from "react";
import {
  Autoplay,
} from "swiper/modules";

const reviewsData = [
  {
    id: 1,
    name: "Michael S.",
    image: "./img/people/1.jpg",
    rating: 5,
    review:
      "I've been using Playhost for my game server needs, and I couldn't be happier. The server uptime is fantastic, and the customer support team is always quick to assist with any issues.",
  },
  {
    id: 2,
    name: "Robert L.",
    image: "./img/people/2.jpg",
    rating: 5,
    review:
      "Running a game server used to be a hassle, but Playhost makes it easy. The control panel is user-friendly, and I love how they handle server maintenance and updates.",
  },
  {
    id: 3,
    name: "Jake M.",
    image: "./img/people/3.jpg",
    rating: 5,
    review:
      "I've tried several hosting providers in the past, and Playhost is by far the best. Their server performance is top-notch, and I've never experienced lag while playing with friends.",
  },
  {
    id: 4,
    name: "Alex P.",
    image: "./img/people/4.jpg",
    rating: 5,
    review:
      "As a new server owner, I was worried about setup and configuration, but Playhost made it a breeze. They have detailed tutorials and helpful support, which made the process smooth.",
  },
  {
    id: 5,
    name: "Carlos R.",
    image: "./img/people/5.jpg",
    rating: 5,
    review:
      "The flexibility Playhost offers is incredible. I can easily switch between game servers or even host multiple games on the same plan. It's a gamer's dream come true!",
  },
  {
    id: 6,
    name: "Edward B.",
    image: "./img/people/6.jpg",
    rating: 5,
    review:
      "I've been a loyal customer of Playhost for years now. Their dedication to keeping their hardware up-to-date ensures my gaming experience is always optimal.",
  },
  {
    id: 7,
    name: "Daniel H.",
    image: "./img/people/7.jpg",
    rating: 5,
    review:
      "When our community needed a reliable server for our esports tournaments, we turned to Playhost, and they've never let us down. Their servers are perfect for competitive gaming.",
  },
  {
    id: 8,
    name: "Bryan G.",
    image: "./img/people/8.jpg",
    rating: 5,
    review:
      "The DDoS protection from Playhost is a lifesaver. We used to get attacked regularly, but since switching to their servers, we haven't had any downtime.",
  },
];

const Customerreviews = () => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="subtitle mb20">Customer reviews</div>
            <h2 className="wow fadeInUp">4.85 out of 5</h2>
            <div className="spacer-20"></div>
          </div>
        </div>
      </div>
      <Swiper
        className="smallslider"
        modules={[Autoplay]}
        loop={true}
        spaceBetween={20}
        slidesPerView="auto"
        autoplay={{ delay: 3000 }}
      >
        {reviewsData.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="swiper-inner">
              <div className="de_testi type-2">
                <blockquote>
                  <div className="de-rating-ext">
                    <span className="d-stars">
                      {[...Array(review.rating)].map((_, i) => (
                        <i key={i} className="fa fa-star"></i>
                      ))}
                    </span>
                  </div>
                  <p className="adjustments__review">{review.review}</p>
                  <div className="de_testi_by">
                    <img alt="" src={review.image} /> <span>{review.name}</span>
                  </div>
                </blockquote>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
export default Customerreviews;

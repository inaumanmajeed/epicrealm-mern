import React from "react";
import { Link, useNavigate } from "react-router-dom";

const gamingData = [
  {
    id: 1,
    title: "Thunder and City",
    price: 14.99,
    discount: 20,
    image: "./img/covers/1.webp",
  },
  {
    id: 2,
    title: "Mystic Racing Z",
    price: 14.99,
    discount: 20,
    image: "./img/covers/2.webp",
  },
  {
    id: 3,
    title: "Silent Wrath",
    price: 14.99,
    discount: 20,
    image: "./img/covers/3.webp",
  },
  {
    id: 4,
    title: "Funk Dungeon",
    price: 14.99,
    discount: 20,
    image: "./img/covers/4.webp",
  },
  {
    id: 5,
    title: "Galactic Odyssey",
    price: 14.99,
    discount: 20,
    image: "./img/covers/5.webp",
  },
  {
    id: 6,
    title: "Warfare Legends",
    price: 14.99,
    discount: 20,
    image: "./img/covers/6.webp",
  },
  {
    id: 7,
    title: "Raceway Revolution",
    price: 14.99,
    discount: 20,
    image: "./img/covers/7.webp",
  },
  {
    id: 8,
    title: "Starborne Odyssey",
    price: 14.99,
    discount: 20,
    image: "./img/covers/8.webp",
  },
];

const Collection = () => {
    const navigate = useNavigate();

    const handleOrderNow = (game) => {
      navigate("/pricing", { state: { game } });
    };
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div className="subtitle mb20">Most complete</div>
          <h2 className="wow fadeInUp">Game Collection</h2>
          <div className="spacer-20"></div>
        </div>
        <div className="col-lg-6 text-lg-end">
          <Link className="btn-main mb-sm-30" to="/games">
            View all games
          </Link>
        </div>
      </div>

      <div className="row g-4 sequence">
        {gamingData.map((game) => {
          const { id, title, price, discount, image } = game;
          return (
            <div className="col-lg-3 col-md-6 gallery-item" key={id}>
              <div className="de-item wow">
                <div className="d-overlay">
                  <div className="d-label">{discount}% OFF</div>
                  <div className="d-text">
                    <h4>{title}</h4>
                    <p className="d-price">
                      Starting at <span className="price">${price}</span>
                    </p>
                    <button className="btn-main btn-fullwidth" onClick={() => handleOrderNow(game)}>
                      Order Now
                    </button>
                  </div>
                </div>
                <img src={image} className="img-fluid " alt="" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Collection;

import React from "react";
import { Link } from "react-router-dom";

const sectionData = [
  {
    icon: "fa fa-folder-open-o",
    title: "Thunder and City",
    subtitle: "Help with Thunder and City",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Mystic Racing Z",
    subtitle: "Help with Mystic Racing Z",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Silent Wrath",
    subtitle: "Help with Silent Wrath",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Funk Dungeon",
    subtitle: "Help with Funk Dungeon",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Galactic Odyssey",
    subtitle: "Help with Galactic Odyssey",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Warfare Legends",
    subtitle: "Help with Warfare Legends",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Race Revolution",
    subtitle: "Help with Race Revolution",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Cyber Nexus",
    subtitle: "Help with Cyber Nexus",
  },
  {
    icon: "fa fa-folder-open-o",
    title: "Ancient Realms",
    subtitle: "Help with Ancient Realms",
  },
];

const Section = () => {
  return (
    <div className="container">
      <div className="row g-4">
        {sectionData.map((data, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div className="de-box-cat h-100">
              <i className={data.icon}></i>
              <Link to="/">
                <h3>
                  {data.title} <span>(17)</span>
                </h3>
              </Link>
              <div className="d-subtitle">{data.subtitle}</div>
            </div>
          </div>
        ))}

        <div className="spacer-double"></div>

        <div className="col-lg-12">
          <div className="padding40 rounded-10 box-long">
            <div className="row align-items-center">
              <div className="col-lg-1">
                <img
                  src="./img/icons/4.png"
                  alt=""
                  className="img-responsive"
                />
              </div>
              <div className="col-lg-9">
                <h4>Cannot find answer? Contact our customer support now.</h4>
              </div>
              <div className="col-lg-2 text-lg-end">
                <Link className="btn-main" to="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section;

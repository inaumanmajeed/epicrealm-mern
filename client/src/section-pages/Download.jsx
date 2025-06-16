import React from 'react';
import { Parallax } from "react-parallax";
import { Link } from 'react-router-dom';


const Download = () => {
    return (
      <div className="container">
        <div className="row position-relative">
          <div className="col-lg-12">
            <Parallax
              className="padding60 sm-padding40"
              bgImage="./img/background/2.webp"
              strength={400}
            >
              <div className="col-lg-6">
                <div className="subtitle wow fadeInUp mb-3">Download now</div>
                <h2 className="wow fadeInUp" data-wow-delay=".2s">
                  Manage your server from mobile device
                </h2>
                <p>
                  Download our mobile app from the Play Store or App Store to
                  effortlessly manage your gaming server on the go. Enjoy
                  convenience with intuitive controls and real-time updates,
                  ensuring your gaming experience is always in your hands.
                </p>
                <Link to="/">
                  <img
                    width="180"
                    height="100"
                    src="../../img/misc/download-appstore.webp"
                    className="img-fluid mb-sm-20"
                    alt="download"
                  />
                </Link>
                &nbsp;
                <Link to="/">
                  <img
                    width="180"
                    height="100"
                    src="../../img/misc/download-playstore.webp"
                    className="img-fluid mb-sm-20"
                    alt="download"
                  />
                </Link>
              </div>
            </Parallax>
            <img
              width="750"
              height="600"
              src="./img/misc/Phone.png"
              className="max-content sm-hide position-absolute bottom-0 end-0"
              alt=""
            />
          </div>
        </div>
      </div>
    );
}

export default Download;
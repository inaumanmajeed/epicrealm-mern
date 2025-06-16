import React from 'react';


const Section = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="subtitle mb-3">Incredibly features</div>
            <h2 className="mb20">Premium Game Server</h2>
          </div>

          <div className="col-lg-6"></div>

          <div className="col-lg-3 col-md-6 mb-sm-20">
            <div>
              <img src="./img/icons/1.png" className="mb20" alt="" />
              <h4>Super Quick Setup</h4>
              <p>
                Set up your game server in minutes with our easy-to-use
                platform. Start playing without the hassle and enjoy immediate,
                smooth gameplay.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-sm-20">
            <div>
              <img src="./img/icons/2.png" className="mb20" alt="" />
              <h4>Premium Hardware</h4>
              <p>
                Experience superior gaming with our state-of-the-art hardware,
                designed for maximum speed and reliability. Enjoy smooth and
                uninterrupted gameplay with the best equipment.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-sm-20">
            <div>
              <img src="./img/icons/3.png" className="mb20" alt="" />
              <h4>DDos Protection</h4>
              <p>
                Safeguard your gaming experience with our robust DDoS
                protection. Enjoy uninterrupted gameplay with advanced security
                measures that defend against cyber threats.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-sm-20">
            <div>
              <img src="./img/icons/4.png" className="mb20" alt="" />
              <h4>Fast Support</h4>
              <p>
                Get quick and reliable assistance from our dedicated support
                team, available 24/7. Resolve issues swiftly and get back to
                gaming without delay.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Section;
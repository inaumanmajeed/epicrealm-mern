import React from 'react';
import { Link } from "react-router-dom";

const Sectioncol = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-sm-30">
            <h3>Server Near You</h3>
            <p>
              Experience lightning-fast gaming with our locally hosted servers.
              Enjoy minimal latency, reliable uptime, and seamless performance
              tailored to your gaming needs. Join Server Near You and elevate
              your gaming experience with unmatched speed and reliability.
            </p>
            <Link className="btn-line lg-w-50" to="/location">
              Choose a Server
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 mb-sm-30">
            <h3>Affiliates Program</h3>
            <p>
              Join our Affiliates Program and start earning by promoting our
              premium game hosting services. Enjoy competitive commissions,
              real-time tracking, and dedicated support. Partner with us today
              and turn your gaming passion into profit.
            </p>
            <Link className="btn-line lg-w-50" to="/affliate">
              Become an Affiliate
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 mb-sm-30">
            <h3>Need Support?</h3>
            <p>
              Have questions or need assistance? Our dedicated support team is
              available 24/7 to help you with any issues or inquiries. Contact
              us anytime for prompt and reliable support. We are here to ensure
              your gaming experience is smooth and enjoyable.
            </p>
            <Link className="btn-line lg-w-50" to="/contact">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
}

export default Sectioncol;
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
// import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/home";
import Games from "./pages/games";
import Pricing from "./pages/pricing";
import Location from "./pages/location";
import Knowledgebase from "./pages/knowledgebase";
import Faq from "./pages/faq";
import Contact from "./pages/contact";
import News from "./pages/news";
import About from "./pages/about";
import Affiliate from "./pages/affiliate";
import Login from "./pages/login";
import Register from "./pages/register";

// Utility to get cookie value
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Auth check
function isAuthenticated() {
  return !!getCookie("accessToken") && !!getCookie("refreshToken");
}

// Private route wrapper
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Public route wrapper
function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Private routes */}
          <Route
            path="/affiliate"
            element={
              <PrivateRoute>
                <Affiliate />
              </PrivateRoute>
            }
          />

          {/* Publicly accessible routes */}
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/location" element={<Location />} />
          <Route path="/knowledgebase" element={<Knowledgebase />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

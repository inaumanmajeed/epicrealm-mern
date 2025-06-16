import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
import Affliate from "./pages/affliate";
import Login from "./pages/login";
import Register from "./pages/register";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const routes = [
  { path: "/", element: <Home /> },
  { path: "/games", element: <Games /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/location", element: <Location /> },
  { path: "/knowledgebase", element: <Knowledgebase /> },
  { path: "/faq", element: <Faq /> },
  { path: "/contact", element: <Contact /> },
  { path: "/news", element: <News /> },
  { path: "/about", element: <About /> },
  { path: "/affliate", element: <Affliate /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

const Navigation = () => (
  <Routes>
    {routes.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}
  </Routes>
);

function App() {
  return (
    // <HelmetProvider>
      <div>
        <BrowserRouter>
          <ScrollToTop />
          <Navigation />
        </BrowserRouter>
      </div>
    // </HelmetProvider>
  );
}

export default App;

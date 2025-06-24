import React, { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

// Private route wrapper
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public route wrapper
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("PublicRoute - isAuthenticated:", isAuthenticated);

  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("User is not authenticated, showing public route");
  return children;
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
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
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

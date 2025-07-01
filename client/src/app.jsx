import React, { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SupportChatProvider } from "./context/SupportChatContext";
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
import SupportChatPage from "./pages/supportChat";
import SupportChat from "./components/SupportChat";
import AdminSupportDashboard from "./components/AdminSupportDashboard";

// Private route wrapper
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public route wrapper
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
  const { isAuthenticated, user } = useAuth();

  return (
    <>
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

        {/* Admin routes */}
        <Route
          path="/admin/support"
          element={
            <AdminRoute>
              <AdminSupportDashboard />
            </AdminRoute>
          }
        />

        {/* Support Chat routes - Allow anonymous users */}
        <Route path="/support" element={<SupportChatPage />} />

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

      {/* Support Chat - Show for all users except admins and when not on admin dashboard */}
      {!user?.isAdmin &&
        !window.location.pathname.includes("/support") &&
        !window.location.pathname.includes("/admin") && <SupportChat />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SupportChatProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </SupportChatProvider>
    </AuthProvider>
  );
}

export default App;

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Utility to get cookie value
function getCookie(name) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop().split(";").shift();
    return cookieValue;
  }
  console.log(`Cookie ${name} not found`);
  return null;
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const checkAuth = () => {
    if (typeof document === "undefined") {
      console.log("AuthContext - Document not available (SSR)");
      setLoading(false);
      return false;
    }

    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

    const isAuth = !!(accessToken && refreshToken);

    // Only update state if the authentication status has actually changed
    setIsAuthenticated((prevAuth) => {
      if (prevAuth !== isAuth) {
        console.log(
          "AuthContext - Authentication status changed from",
          prevAuth,
          "to",
          isAuth
        );
        return isAuth;
      }
      return prevAuth;
    });

    setLoading(false);

    return isAuth;
  };

  // Login function
  const login = (userData) => {
    console.log("AuthContext - User logged in:", userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext - User logged out");
    setUser(null);
    setIsAuthenticated(false);
    // Clear cookies
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  // Check auth on mount and when cookies change
  useEffect(() => {
    console.log("AuthContext - Initial auth check");
    checkAuth();

    // Listen for storage events (if using localStorage as backup)
    const handleStorageChange = () => {
      console.log("AuthContext - Storage changed, rechecking auth");
      checkAuth();
    };

    // Listen for focus events to recheck auth when user returns to tab
    const handleFocus = () => {
      console.log("AuthContext - Window focused, rechecking auth");
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  console.log("🚀 ~ AuthProvider ~ user:", user);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const checkAuth = () => {
    if (typeof window === "undefined") {
      console.log("AuthContext - Window not available (SSR)");
      setLoading(false);
      return false;
    }

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    const isAuth = !!(accessToken && refreshToken);

    // If authenticated and we have stored user data, restore it
    if (isAuth && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log("AuthContext - Restored user from localStorage:", userData);
      } catch (error) {
        console.error("AuthContext - Error parsing stored user data:", error);
        localStorage.removeItem("user");
      }
    }

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
  const login = (userData, tokens) => {
    console.log("AuthContext - User logged in:", userData);
    console.log("AuthContext - Tokens received:", tokens);
    setUser(userData);
    setIsAuthenticated(true);

    // Store user data and tokens in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    if (tokens) {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      console.log("AuthContext - Tokens stored in localStorage");
    }
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext - User logged out");
    setUser(null);
    setIsAuthenticated(false);
    // Clear all data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
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

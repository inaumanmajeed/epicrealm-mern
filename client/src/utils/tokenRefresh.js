import { apiEndPoints } from "../constants/apiEndPoints";

const { REFRESH } = apiEndPoints.auth;

/**
 * Centralized token refresh utility
 * @returns {Promise<{success: boolean, tokens?: {accessToken: string, refreshToken: string}, error?: string}>}
 */
const refreshToken = localStorage.getItem("refreshToken");
const accessToken = localStorage.getItem("accessToken");

/**
 * Clear authentication tokens from localStorage
 */
export const clearLocalStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.clear();
  console.log("Authentication cleared");
};

export const refreshAuthToken = async () => {
  try {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Create a new axios instance WITHOUT interceptors to avoid circular dependency
    const axios = (await import("axios")).default;
    const refreshResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}${REFRESH}`,
      { refreshToken },
      {
        headers: {
          "x-refresh-token": refreshToken,
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );

    // Check if refresh was successful
    if (refreshResponse.data && refreshResponse.data.data) {
      // Store new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        refreshResponse.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return {
        success: true,
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      };
    } else {
      throw new Error("Invalid refresh response structure");
    }
  } catch (refreshError) {
    console.error("❌ Token refresh failed:", refreshError);

    // Check if this is a 401 error (refresh token expired/invalid)
    if (refreshError.response?.status === 401) {
      console.log(
        "🔐 Refresh token is expired or invalid - user needs to re-login"
      );
      // Clear tokens on failure
      clearLocalStorage();

      return {
        success: false,
        error: "Refresh token expired - re-login required",
        needsReauth: true,
      };
    }

    // For other errors, don't clear tokens immediately
    console.log("🌐 Network or server error during token refresh");

    return {
      success: false,
      error: refreshError.message || "Token refresh failed",
      needsReauth: false,
    };
  }
};

/**
 * Get current access token from localStorage
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

/**
 * Get current refresh token from localStorage
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

/**
 * Check if user has valid tokens
 * @returns {boolean}
 */
export const hasValidTokens = () => {
  return !!(getAccessToken() && getRefreshToken());
};

/**
 * Check if access token is expired (basic check)
 * @returns {{isExpired: boolean, timeToExpiry: number, expiresAt: Date}}
 */
export const checkTokenExpiry = () => {
  const token = getAccessToken();
  if (!token) {
    return { isExpired: true, timeToExpiry: 0, expiresAt: null };
  }

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    const timeToExpiry = payload.exp - now;
    const expiresAt = new Date(payload.exp * 1000);

    return {
      isExpired,
      timeToExpiry,
      expiresAt,
    };
  } catch (error) {
    console.error("Could not decode token:", error);
    return { isExpired: true, timeToExpiry: 0, expiresAt: null };
  }
};

/**
 * Determine if we should attempt token refresh or redirect to login
 * @returns {{shouldRefresh: boolean, reason: string}}
 */
export const shouldAttemptRefresh = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return { shouldRefresh: false, reason: "No refresh token available" };
  }

  if (!accessToken) {
    return {
      shouldRefresh: true,
      reason: "No access token, but refresh token exists",
    };
  }

  const { isExpired } = checkTokenExpiry();

  if (isExpired) {
    return { shouldRefresh: true, reason: "Access token is expired" };
  }

  return { shouldRefresh: false, reason: "Access token is still valid" };
};

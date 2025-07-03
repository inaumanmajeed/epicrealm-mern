import httpRequest from "./httpRequest";
import {
  refreshAuthToken,
  getAccessToken,
  getRefreshToken,
} from "../utils/tokenRefresh";
import toast from "react-hot-toast";

export const requestHandler = (request) => {
  // Get token from localStorage and set Authorization header
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
    request.headers["x-refresh-token"] = refreshToken;
  }
  return request;
};

export const successHandler = (response) => {
  return {
    ...response,
    data: response.data,
  };
};

export const errorHandler = async (error) => {
  const { status } = error.response || {};

  if (status === 401) {
    // Check if this is already a retry to avoid infinite loops
    if (error.config._retry) {
      console.log("Token refresh already attempted, redirecting to login");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Mark this request as a retry
    error.config._retry = true;

    console.error("Unauthorized request - attempting to refresh token");

    const refreshResult = await refreshAuthToken();

    if (refreshResult.success) {
      // Update the failed request with new token and retry
      error.config.headers.Authorization = `Bearer ${refreshResult.tokens.accessToken}`;

      // Use plain axios to retry, not httpRequest to avoid interceptor loops
      const axios = (await import("axios")).default;
      return axios(error.config);
    } else {
      // Refresh failed - handle based on the reason
      if (refreshResult.needsReauth) {
        console.log("🔐 Refresh token expired - redirecting to login");
        toast.warning("Your session has expired. Redirecting to login...");

        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        console.log("🌐 Token refresh failed due to network/server error");
        toast.error("Failed to refresh authentication. Please try again.");
      }

      return Promise.reject(error);
    }
  }

  return Promise.reject(error);
};

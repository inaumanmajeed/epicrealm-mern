import httpRequest from "./httpRequest";
import { apiEndPoints } from "../constants/apiEndPoints";

const { REFRESH } = apiEndPoints.auth;

export const requestHandler = (request) => {
  // Get token from localStorage and set Authorization header
  const token = localStorage.getItem("accessToken");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
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
    // Handle 401 Unauthorized error
    console.error("Unauthorized request - attempting to refresh token");

    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Create a new axios instance WITHOUT interceptors to avoid circular dependency
      const axios = (await import("axios")).default;
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${REFRESH}`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("🚀 ~ errorHandler ~ refreshResponse:", refreshResponse);

      // Store new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        refreshResponse.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");

      // Retry the original request with the new token
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      // Use plain axios to retry, not httpRequest to avoid interceptor loops
      return axios(error.config);
    } catch (refreshError) {
      // Refresh failed - clear tokens from localStorage
      console.error("Token refresh failed:", refreshError);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      console.log("401 Unauthorized: Authentication tokens cleared");

      // Redirect to login or handle logout
      window.location.href = "/login";

      // Reject with the original error
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
};

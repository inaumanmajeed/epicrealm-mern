import httpRequest from "./httpRequest";
import { apiEndPoints } from "../constants/apiEndPoints";

const { REFRESH } = apiEndPoints.auth;

export const requestHandler = (request) => {
  // No need to set Authorization header, cookies will be sent automatically
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
      // Attempt to refresh the token
      const refreshResponse = await httpRequest().post(REFRESH);
      console.log("🚀 ~ errorHandler ~ refreshResponse:", refreshResponse);
      console.log("Token refreshed successfully");

      // Retry the original request with the new token
      return httpRequest()(error.config);
    } catch (refreshError) {
      // Refresh failed - clear authentication cookies
      console.error("Token refresh failed:", refreshError);
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log("401 Unauthorized: Authentication cookies cleared");

      // Reject with the original error
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
};

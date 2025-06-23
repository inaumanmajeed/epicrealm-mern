export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   API Endpoints

export const apiEndPoints = {
  auth: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    LOGOUT: "/users/logout",
    REFRESH: "/users/refresh-user-token",
  },
};

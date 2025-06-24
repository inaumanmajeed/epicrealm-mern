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

export const errorHandler = (error) => {
  const { status } = error.response || {};
  if (status === 401) {
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("401 Unauthorized: Authentication cookies cleared");
  }
  return Promise.reject(error);
};

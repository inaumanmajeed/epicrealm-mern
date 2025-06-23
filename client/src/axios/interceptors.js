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
    // Handle unauthorized error (e.g., redirect to login, clear store, etc.)
  }
  return Promise.reject(error);
};

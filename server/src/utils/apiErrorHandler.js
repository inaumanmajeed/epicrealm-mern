import ApiResponse from '../utils/ApiResponse.js';

const apiErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];
  const data = err.data || null;

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, { errors, data }));
};

export default apiErrorHandler;

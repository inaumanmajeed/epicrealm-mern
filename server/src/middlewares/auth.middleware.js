import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
  // Check for access token in cookies or Authorization header
  const token =
    req.cookies?.accessToken || req.header?.Authorization?.split(' ')[1];
  // If token is not present, throw an error
  if (!token) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access');
  }
  // Verify the token and extract user information
  try {
    const decodedToken = await jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id);
    // If token is valid but user is not found, throw an error
    if (!user) {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Access Token');
    }
    // Attach user to the request object for further use
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access');
  }
});

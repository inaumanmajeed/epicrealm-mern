import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  // Check for access token in Authorization header only
  const authHeader = req.header('Authorization');
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

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
    // compare the token in the database with the one provided
    if (user.accessToken !== token) {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Access Token');
    }
    // Attach user to the request object for further use
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access');
  }
});

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access');
  }

  try {
    const decodedRefreshToken = await jwt.verify(
      incomingRefreshToken,
      REFRESH_TOKEN_SECRET
    );

    // Using the already set user (from verifyAccessToken), reuse it to avoid DB call
    if (req.user && req.user.id === decodedRefreshToken.id) {
      if (req.user.refreshToken === incomingRefreshToken) {
        return next();
      }
    } else {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Refresh Token');
    }
    // If the refresh token is valid, proceed to the next middleware
    next();
  } catch (error) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access');
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  // Check if the user is an admin
  if (req.user && req.user.isAdmin) {
    return next();
  }
  // If not an admin, throw an error
  throw new ApiError(403, '👮🏻‍♂️ Forbidden: Admins only');
});

// Optional authentication middleware for support chat
export const optionalAuth = asyncHandler(async (req, res, next) => {
  // Check for access token in Authorization header
  const authHeader = req.header('Authorization');
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (token) {
    try {
      const decodedToken = await jwt.verify(token, ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken.id);

      if (user && user.accessToken === token) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      console.log('Invalid token in optional auth:', error.message);
    }
  }

  // Continue regardless of authentication status
  next();
});

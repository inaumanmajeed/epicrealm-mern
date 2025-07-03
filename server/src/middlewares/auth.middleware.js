import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;
  if (!token) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access @verifyAccessToken');
  }
  try {
    const decodedToken = await jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user) {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Access Token');
    }
    if (user.accessToken !== token) {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Access Token');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      `👮🏻‍♂️ Unauthorized Access @verifyAccessTokenCatch: ${error.message}`
    );
  }
});

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;
  if (!token) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access @verifyRefreshToken');
  }
  const incomingRefreshToken =
    req.header('x-refresh-token') || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, '👮🏻‍♂️ Unauthorized Access @verifyRefreshToken');
  }

  try {
    const decodedRefreshToken = await jwt.verify(
      incomingRefreshToken,
      REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken.id);
    if (!user) {
      throw new ApiError(
        401,
        '👮🏻‍♂️ User not found! decoding and finding user @verifyRefreshToken '
      );
    }

    if (
      user &&
      user.accessToken === token &&
      user.id === decodedRefreshToken.id &&
      user.refreshToken === incomingRefreshToken
    ) {
      req.user = user;
      return next();
    } else {
      throw new ApiError(401, '👮🏻‍♂️ Invalid Refresh Token');
    }
  } catch (error) {
    throw new ApiError(
      401,
      `👮🏻‍♂️ Unauthorized Access @verifyRefreshTokenCatch ${error.message}`
    );
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

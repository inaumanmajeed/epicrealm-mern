import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Game } from '../models/game.model.js';
import uploadImageOnCloudinary from '../utils/cloudinary.js';

export const createGame = asyncHandler(async (req, res) => {
  const { title, rating, totalRating, discount } = req.body;

  // Validate required fields
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  // Check if game already exists
  const existingGame = await Game.findOne({ title });
  if (existingGame) {
    throw new ApiError(400, 'Game with this title already exists');
  }
  const coverImageLocalPath = req?.files?.coverImage?.[0].path;
  console.log('🚀 ~ createGame ~ coverImageLocalPath:', coverImageLocalPath);
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is required');
  }

  // Upload cover image to Cloudinary
  const coverImageUrl = await uploadImageOnCloudinary(coverImageLocalPath);
  console.log('🚀 ~ createGame ~ coverImageUrl:', coverImageUrl);
  if (!coverImageUrl) {
    throw new ApiError(500, 'Failed to upload cover image');
  }

  // Create new game
  await Game.create({
    title,
    coverImage: coverImageUrl.url,
    rating: rating || 0,
    totalRating: totalRating || 0,
    discount: discount || 0,
  });
  const game = await Game.findOne({ title });
  if (!game) {
    throw new ApiError(500, 'Failed to create game');
  }
  console.log('🚀 ~ createGame ~ game:', game);

  // Return success response
  return res.status(201).json(
    new ApiResponse({
      message: 'Game created successfully',
      data: game,
    })
  );
});

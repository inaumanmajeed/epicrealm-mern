import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  uploadImageOnCloudinary,
  deleteImageFromCloudinary,
} from '../utils/cloudinary.js';
import { Game } from '../models/games.model.js';
import fs from 'fs';
import mongoose from 'mongoose';

export const createGame = asyncHandler(async (req, res) => {
  const { title, rating, discount } = req.body;

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
  const thumbnailLocalPath = req?.files?.thumbnail?.[0].path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is required');
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Thumbnail is required');
  }

  // Upload cover image to Cloudinary
  const coverImageUrl = await uploadImageOnCloudinary(coverImageLocalPath);
  const thumbnailUrl = await uploadImageOnCloudinary(thumbnailLocalPath);

  if (!coverImageUrl) {
    throw new ApiError(500, 'Failed to upload cover image');
  }
  if (!thumbnailUrl) {
    throw new ApiError(500, 'Failed to upload thumbnail');
  }

  // Create new game
  await Game.create({
    title,
    coverImage: coverImageUrl.url,
    thumbnail: thumbnailUrl.url,
    rating: rating || 0,
    discount: discount || 0,
  });
  const game = await Game.findOne({ title });
  if (!game) {
    throw new ApiError(500, 'Failed to create game');
  }
  // Clean up local cover image file
  fs.unlinkSync(coverImageLocalPath);
  // Clean up local thumbnail file
  fs.unlinkSync(thumbnailLocalPath);

  // Return success response
  return res.status(201).json(
    new ApiResponse(201, `${game.title} created successfully`, {
      game,
    })
  );
});

export const getAllGames = asyncHandler(async (req, res) => {
  const { limit, skip } = req.pagination;

  // Get total count for pagination
  const totalCount = await Game.countDocuments();

  // Get paginated games
  const games = await Game.find()
    .sort({ createdAt: -1 }) // Sort by creation date descending
    .skip(skip)
    .limit(limit);

  if (!games || games.length === 0) {
    throw new ApiError(404, 'No games found');
  }

  // Create pagination response using the utility function
  const response = req.createPaginationResponse(games, totalCount);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Games retrieved successfully',
        response.data,
        response.pagination
      )
    );
});

export const getGameByNameOrId = asyncHandler(async (req, res) => {
  const { idOrName } = req.params;

  // Check if the parameter is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrName)) {
    // If it's a valid ObjectId, try to find exact match by _id first
    const game = await Game.findById(idOrName);

    if (game) {
      // Return single game if found by ID
      return res
        .status(200)
        .json(new ApiResponse(200, 'Game retrieved successfully', game));
    }

    // If not found by ID, fall through to title search with pagination
  }

  // For title search (or when ObjectId doesn't match), return paginated results
  const { limit, skip } = req.pagination;

  // Create search regex for title
  const searchRegex = new RegExp(idOrName, 'i');

  // Get total count of matching games
  const totalCount = await Game.countDocuments({
    title: { $regex: searchRegex },
  });

  // Get paginated games matching the search
  const games = await Game.find({
    title: { $regex: searchRegex },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!games || games.length === 0) {
    throw new ApiError(404, 'No games found matching your search');
  }

  // Create pagination response
  const response = req.createPaginationResponse(games, totalCount);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Found ${totalCount} game(s) matching "${idOrName}"`,
        response.data,
        response.meta
      )
    );
});

export const updateGame = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, discount } = req.body;

  // Validate required fields
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  // Check if game exists
  const game = await Game.findById(id);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }

  // Update game details
  game.title = title;
  game.discount = discount || game.discount;

  // Handle cover image update
  if (req?.files?.coverImage?.[0]) {
    const coverImageLocalPath = req.files.coverImage[0].path;

    // Delete previous cover image from Cloudinary if it exists
    if (game.coverImage) {
      await deleteImageFromCloudinary(game.coverImage);
    }

    const coverImageUrl = await uploadImageOnCloudinary(coverImageLocalPath);
    if (!coverImageUrl) {
      throw new ApiError(500, 'Failed to upload cover image');
    }
    game.coverImage = coverImageUrl.url;
    fs.unlinkSync(coverImageLocalPath); // Clean up local file
  }

  // Handle thumbnail update
  if (req?.files?.thumbnail?.[0]) {
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    // Delete previous thumbnail from Cloudinary if it exists
    if (game.thumbnail) {
      await deleteImageFromCloudinary(game.thumbnail);
    }

    const thumbnailUrl = await uploadImageOnCloudinary(thumbnailLocalPath);
    if (!thumbnailUrl) {
      throw new ApiError(500, 'Failed to upload thumbnail');
    }
    game.thumbnail = thumbnailUrl.url;
    fs.unlinkSync(thumbnailLocalPath); // Clean up local file
  }

  // Save updated game
  await game.save();

  return res
    .status(200)
    .json(new ApiResponse(200, `${game.title} updated successfully`, game));
});

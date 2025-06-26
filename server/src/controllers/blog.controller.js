import { Blog } from '../models/blog.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadImageOnCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content || !tags || tags.length === 0) {
    throw new ApiError(
      400,
      'Title, content, and at least one tag are required'
    );
  }
  const coverImageLocalPath = req?.files?.coverImage?.[0].path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is required');
  }

  // Upload cover image to Cloudinary
  const coverImageUrl = await uploadImageOnCloudinary(coverImageLocalPath);
  if (!coverImageUrl) {
    throw new ApiError(500, 'Failed to upload cover image');
  }
  // Clean up local cover image file
  fs.unlinkSync(coverImageLocalPath);

  // Create new blog
  const blog = await Blog.create({
    title,
    content,
    coverImage: coverImageUrl.url,
    tags,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, 'Blog Created Successfully', blog));
});

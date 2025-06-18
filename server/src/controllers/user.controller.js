import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // extract user data from request body
  const { userName, name, email, password, phoneNumber } = req.body;

  // Validate required fields
  if (
    [userName, name, email, password, phoneNumber].some(
      (field) => field?.trim() === ''
    )
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }, { phoneNumber }],
  });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // Create new user
  const user = await User.create({
    userName,
    name,
    email,
    password,
    phoneNumber,
  });

  // validate user creation
  const createdUser = await User.findById(user._id);
  if (!createdUser) {
    throw new ApiError(500, 'User creation failed');
  }

  // Send success response
  return res.status(201).json(
    new ApiResponse(201, `${createdUser.userName} registered successfully`, {
      user: createdUser,
    })
  );
});

export { registerUser };

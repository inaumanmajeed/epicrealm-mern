import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_GAMES_FOLDER,
} from '../constants.js';

// Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadImageOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: CLOUDINARY_GAMES_FOLDER,
      use_filename: true,
      unique_filename: false,
      resource_type: 'image',
    });
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error('Error uploading image to Cloudinary:', error);
    return null;
  }
};

export default uploadImageOnCloudinary;

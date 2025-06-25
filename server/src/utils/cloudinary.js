import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_GAMES_FOLDER,
} from '../constants.js';

// Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadImageOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: CLOUDINARY_GAMES_FOLDER,
      use_filename: true,
      unique_filename: false,
      resource_type: 'image',
    });

    return {
      url: response.secure_url,
    };
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log('🚀 ~ uploadImageOnCloudinary ~ error:', error);
    console.error('Error uploading image to Cloudinary:', error);
    return null;
  }
};

export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    // Extract public_id from the URL
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/image_name.jpg
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove file extension

    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return null;
  }
};

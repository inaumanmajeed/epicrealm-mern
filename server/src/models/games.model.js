import mongoose, { Schema } from 'mongoose';

const gameSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      unique: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i.test(v);
        },
        message: 'Please provide a valid image URL',
      },
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i.test(v);
        },
        message: 'Please provide a valid thumbnail URL',
      },
    },
    rating: {
      type: Number,
      required: [false, 'Rating is required'],
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    totalRated: {
      type: Number,
      required: [true, 'Total rating is required'],
      default: 0,
    },
    discount: {
      type: Number,
      required: [false, 'Discount is required'],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Game = mongoose.model('Game', gameSchema);

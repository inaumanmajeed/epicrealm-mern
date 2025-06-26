import mongoose, { Schema } from 'mongoose';

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog Content is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Blog Cover Image is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Blog Tags are required'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Blog = mongoose.model('Blog', blogSchema);

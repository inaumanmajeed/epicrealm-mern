import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const chatSchema = new Schema(
  {
    // Support chat is always between a user and admin
    // For anonymous users, this will be a string like "anon_sessionId"
    user: {
      type: Schema.Types.Mixed, // Allow both ObjectId and String
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      trim: true,
      default: 'Support Chat',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Track unread count for admin
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
    // Track unread count for user
    unreadByUser: {
      type: Number,
      default: 0,
    },
    // Store user display name (for both anonymous and logged-in users)
    userDisplayName: {
      type: String,
      trim: true,
    },
    // Store user handle/username (for both anonymous and logged-in users)
    userHandle: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.plugin(mongooseAggregatePaginate);

export const Chat = mongoose.model('Chat', chatSchema);

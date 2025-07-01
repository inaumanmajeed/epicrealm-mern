import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const chatMessageSchema = new Schema(
  {
    // For anonymous users, this will be a string like "anon_sessionId"
    sender: {
      type: Schema.Types.Mixed, // Allow both ObjectId and String
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    attachments: [
      {
        url: {
          type: String,
        },
        filename: {
          type: String,
        },
        fileType: {
          type: String,
        },
      },
    ],
    // For support chat, we only need to track if admin has read it
    isReadByAdmin: {
      type: Boolean,
      default: false,
    },
    isReadByUser: {
      type: Boolean,
      default: false,
    },
    readByAdminAt: {
      type: Date,
    },
    readByUserAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    // For internal admin notes (not visible to user)
    isInternalNote: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.plugin(mongooseAggregatePaginate);

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

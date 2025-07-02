import { ChatMessage } from '../models/chatMessage.model.js';
import { Chat } from '../models/chat.model.js';

// Generating consistent anonymous user ID based on socket session, not IP
export const getAnonymousUserId = (req, socket) => {
  if (socket) {
    // For socket connections, using socket ID which is unique per session
    return `anon_${socket.id}`;
  } else if (req) {
    // For HTTP requests without socket, generating a random session ID
    // This should ideally be stored in session/cookie, but for now use a timestamp-based ID
    const sessionId =
      req.sessionID ||
      `http_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return `anon_${sessionId}`;
  } else {
    // Fallback
    return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
};

// ======================== UTILITIES FOR FUTURE USE ========================
// Get unread message count for a user !! not using right now
export const getUnreadMessageCount = async (userId) => {
  try {
    const unreadCount = await ChatMessage.aggregate([
      {
        $match: {
          'isRead.userId': { $ne: userId },
        },
      },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chatInfo',
        },
      },
      {
        $match: {
          'chatInfo.participants': userId,
        },
      },
      {
        $count: 'unreadCount',
      },
    ]);

    console.log('🚀‼️‼️‼️ ~ getUnreadMessageCount ~ unreadCount:', unreadCount);
    return unreadCount[0]?.unreadCount || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};

// Get unread messages for a specific chat !! not using right now
export const getUnreadMessagesForChat = async (chatId, userId) => {
  try {
    const unreadMessages = await ChatMessage.find({
      chat: chatId,
      'isRead.userId': { $ne: userId },
    })
      .populate('sender', 'userName name')
      .sort({ createdAt: -1 });

    return unreadMessages;
  } catch (error) {
    console.error('Error getting unread messages for chat:', error);
    return [];
  }
};

// Mark all messages in a chat as read !! not using right now
export const markAllMessagesAsRead = async (chatId, userId) => {
  try {
    const result = await ChatMessage.updateMany(
      {
        chat: chatId,
        'isRead.userId': { $ne: userId },
      },
      {
        $push: {
          isRead: {
            userId: userId,
            readAt: new Date(),
          },
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return 0;
  }
};

// Search messages in a chat !! not using right now
export const searchMessagesInChat = async (
  chatId,
  query,
  userId,
  page = 1,
  limit = 20
) => {
  try {
    // Check if user has access to the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      throw new Error('Access denied');
    }

    const searchResults = await ChatMessage.aggregate([
      {
        $match: {
          chat: chatId,
          content: { $regex: query, $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
          pipeline: [
            {
              $project: {
                userName: 1,
                name: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          sender: { $first: '$sender' },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return searchResults;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

// Get chat statistics for admin !! not using right now
export const getChatStatistics = async () => {
  try {
    const stats = await Chat.aggregate([
      {
        $facet: {
          totalChats: [{ $count: 'count' }],
          activeChats: [{ $match: { isActive: true } }, { $count: 'count' }],
          groupChats: [
            { $match: { isGroupChat: true, isActive: true } },
            { $count: 'count' },
          ],
          oneOnOneChats: [
            { $match: { isGroupChat: false, isActive: true } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const messageStats = await ChatMessage.aggregate([
      {
        $facet: {
          totalMessages: [{ $count: 'count' }],
          todayMessages: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            { $count: 'count' },
          ],
          messagesByType: [
            {
              $group: {
                _id: '$messageType',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return {
      chats: {
        total: stats[0].totalChats[0]?.count || 0,
        active: stats[0].activeChats[0]?.count || 0,
        group: stats[0].groupChats[0]?.count || 0,
        oneOnOne: stats[0].oneOnOneChats[0]?.count || 0,
      },
      messages: {
        total: messageStats[0].totalMessages[0]?.count || 0,
        today: messageStats[0].todayMessages[0]?.count || 0,
        byType: messageStats[0].messagesByType || [],
      },
    };
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    throw error;
  }
};

// Delete old messages (cleanup utility) !! not using right now
export const deleteOldMessages = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ChatMessage.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`Deleted ${result.deletedCount} old messages`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting old messages:', error);
    throw error;
  }
};

// Export user from chat (for admin) !! not using right now
export const exportChatHistory = async (chatId, userId) => {
  try {
    // Check if user has access to the chat
    const chat = await Chat.findById(chatId).populate(
      'participants',
      'userName name email'
    );
    if (
      !chat ||
      !chat.participants.some((p) => p._id.toString() === userId.toString())
    ) {
      throw new Error('Access denied');
    }

    const messages = await ChatMessage.find({ chat: chatId })
      .populate('sender', 'userName name email')
      .sort({ createdAt: 1 });

    const exportData = {
      chat: {
        id: chat._id,
        name: chat.name,
        isGroupChat: chat.isGroupChat,
        participants: chat.participants,
        createdAt: chat.createdAt,
      },
      messages: messages.map((msg) => ({
        id: msg._id,
        sender: msg.sender,
        content: msg.content,
        messageType: msg.messageType,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        isEdited: msg.isEdited,
        editedAt: msg.editedAt,
      })),
      exportedAt: new Date(),
      exportedBy: userId,
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting chat history:', error);
    throw error;
  }
};
// ============================================================================

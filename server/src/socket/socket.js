import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Chat } from '../models/chat.model.js';
import { ChatMessage } from '../models/chatMessage.model.js';
import { User } from '../models/user.model.js';
import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { getAnonymousUserId } from '../utils/chatUtils.js';
import asyncHandler from '../utils/asyncHandler.js';

// Store active socket connections
const activeUsers = new Map();
const userSockets = new Map();
const adminSockets = new Map();

// Helper function to populate message sender consistently || wrapper for response to client
const populateMessageSender = asyncHandler(
  async (messageObj, chatRecord = null) => {
    if (
      typeof messageObj.sender === 'string' &&
      messageObj.sender.startsWith('anon_')
    ) {
      // Anonymous user - use chat record for name info or defaults
      return {
        _id: messageObj.sender,
        userName:
          chatRecord?.userHandle ||
          chatRecord?.userDisplayName ||
          'Anonymous User',
        name:
          chatRecord?.userDisplayName ||
          chatRecord?.userHandle ||
          'Anonymous User',
        isAdmin: false,
      };
    } else {
      // Authenticated user - manual lookup from database
      try {
        const user = await User.findById(messageObj.sender).select(
          'userName name email isAdmin'
        );
        if (user) {
          return {
            _id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin === true, // ~ Ensure boolean value for isAdmin
          };
        } else {
          // User not found in database - this shouldn't happen, but handle gracefully
          console.log(
            `User not found for message sender: ${messageObj.sender}`
          );
          return {
            _id: messageObj.sender,
            userName: 'Unknown User',
            name: 'Unknown User',
            email: null,
            isAdmin: false,
          };
        }
      } catch (err) {
        console.error('Error looking up message sender:', err);
        // Fallback with minimal info
        return {
          _id: messageObj.sender,
          userName: 'Unknown User',
          name: 'Unknown User',
          email: null,
          isAdmin: false,
        };
      }
    }
  }
);

// Helper function to join user to their support chat rooms
const joinUserSupportChats = asyncHandler(async (socket) => {
  try {
    let userChats;

    if (socket.user.isAdmin) {
      // Admins join all active support chats
      userChats = await Chat.find({
        isActive: true,
      }).select('_id');
    } else {
      // Users join only their own support chats
      userChats = await Chat.find({
        user: socket.user._id,
        isActive: true,
      }).select('_id');
    }

    userChats.forEach((chat) => {
      socket.join(chat._id.toString());
    });
  } catch (error) {
    console.error('Error joining user support chats:', error);
  }
});

// Initialize Socket.IO with authentication and event handling
const initializeSocketIO = (server) => {
  // Create a new Socket.IO server instance
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(
    asyncHandler(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (token) {
          // If token provided, verify it
          const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

          const user = await User.findById(decodedToken.id);

          if (user) {
            socket.user = user;
          } else {
            throw new Error('Invalid authentication token');
          }
        } else {
          // Allow anonymous users for support chat
          const anonymousUserId = getAnonymousUserId(null, socket);

          socket.user = {
            _id: anonymousUserId,
            userName: `Anonymous_${socket.id.substring(0, 6)}`,
            name: `Anonymous User`,
            email: null,
            isAdmin: false,
            isAnonymous: true,
          };
        }

        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);

        // Check if it's a JWT-related error
        const isJWTError =
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError' ||
          error.name === 'NotBeforeError';

        if (isJWTError) {
          // Pass JWT error to client but still allow connection as anonymous
          socket.emit('auth_error', {
            type: error.name,
            message: error.message,
            code:
              error.name === 'TokenExpiredError'
                ? 'TOKEN_EXPIRED'
                : 'TOKEN_INVALID',
          });
        }

        // For invalid tokens, still allow as anonymous
        const anonymousUserId = getAnonymousUserId(null, socket);
        socket.user = {
          _id: anonymousUserId,
          userName: `Anonymous_${socket.id.substring(0, 6)}`,
          name: `Anonymous User`,
          email: null,
          isAdmin: false,
          isAnonymous: true,
        };
        next();
      }
    })
  );

  // Handle new socket connections
  io.on('connection', (socket) => {
    // Store active user connection
    activeUsers.set(socket.user._id.toString(), {
      userId: socket.user._id,
      userName: socket.user.userName,
      socketId: socket.id,
      isAdmin: socket.user.isAdmin,
      status: 'online',
    });

    // Store user socket ID for easy access
    userSockets.set(socket.user._id.toString(), socket.id);

    // Store admin sockets separately for easy access
    if (socket.user.isAdmin) {
      adminSockets.set(socket.user._id.toString(), socket.id);
    }

    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Join user to their support chat rooms joinUserSupportChats
    joinUserSupportChats(socket);

    // If user is admin, send them all existing chats on connection
    if (socket.user.isAdmin) {
      setTimeout(async () => {
        try {
          const chats = await Chat.find({})
            .populate('admin', 'userName name email')
            .sort({ updatedAt: -1 })
            .limit(100);

          // For each chat, get the latest messages
          const chatsWithMessages = await Promise.all(
            chats.map(async (chat) => {
              let messages = await ChatMessage.find({ chat: chat._id }).sort({
                createdAt: 1,
              });

              // Process messages to include proper sender information
              const processedMessages = await Promise.all(
                messages.map(async (msg) => {
                  const messageObj = msg.toObject();
                  messageObj.sender = populateMessageSender(messageObj, chat);
                  return messageObj;
                })
              );

              return {
                _id: chat._id,
                chatId: chat._id.toString(),
                user: chat.user,
                subject: chat.subject,
                status: chat.status,
                priority: chat.priority,
                admin: chat.admin,
                isAnonymous: chat.isAnonymous,
                userDisplayName: chat.userDisplayName,
                userHandle: chat.userHandle,
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt,
                messages: processedMessages,
                messageCount: processedMessages.length,
                unreadByAdmin: chat.unreadByAdmin || 0,
                unreadByUser: chat.unreadByUser || 0,
              };
            })
          );

          // Send all chat histories to the admin
          chatsWithMessages.forEach((chatObject) => {
            if (chatObject.messages && chatObject.messages.length > 0) {
              socket.emit('chat_history', {
                chatId: chatObject.chatId,
                messages: chatObject.messages,
                chat: chatObject,
              });
            }
          });
        } catch (error) {
          console.error('Error loading chats for admin:', error);
        }
      }, 1000);
    }

    // Handle creating a new support chat
    socket.on('create_support_chat', async (data) => {
      try {
        // Check if user already has an active support chat
        const existingChat = await Chat.findOne({
          user: socket.user._id,
          status: { $in: ['open', 'in-progress'] },
          isActive: true,
        });

        if (existingChat) {
          console.log(`✅ Found existing active chat: ${existingChat._id}`);
          // Join the existing chat instead
          socket.join(existingChat._id.toString());

          // Send existing messages
          const messages = await ChatMessage.find({
            chat: existingChat._id,
          }).sort({ createdAt: 1 });
          const processedMessages = await Promise.all(
            messages.map(async (msg) => {
              const messageObj = msg.toObject();
              messageObj.sender = await populateMessageSender(
                messageObj,
                existingChat
              );
              return messageObj;
            })
          );

          socket.emit('chat_created', {
            chat: existingChat,
            messages: processedMessages,
          });

          // Notify admins about the chat
          socket.to('admin').emit('new_support_chat', {
            chat: existingChat,
            user: {
              _id: socket.user._id,
              userName: socket.user.userName,
              name: socket.user.name,
              isAnonymous: socket.user.isAnonymous,
            },
          });

          return;
        }

        // Create new chat if no active chat exists with this user
        const newChat = await Chat.create({
          user: socket.user._id,
          subject: data.subject || 'Support Chat',
          priority: data.priority || 'medium',
          status: 'open',
          isActive: true,
          isAnonymous: socket.user.isAnonymous || false,
          userDisplayName: socket.user.name || socket.user.userName,
          userHandle: socket.user.userName || socket.user.name,
        });

        // Join the new chat room
        socket.join(newChat._id.toString());

        // Send the chat creation response
        socket.emit('chat_created', {
          chat: newChat,
          messages: [],
        });

        // Notify admins about the new chat
        socket.to('admin').emit('new_support_chat', {
          chat: newChat,
          user: {
            _id: socket.user._id,
            userName: socket.user.userName,
            name: socket.user.name,
            isAnonymous: socket.user.isAnonymous,
          },
        });
      } catch (error) {
        console.error('Error creating support chat:', error);
        socket.emit('error', { message: 'Failed to create support chat' });
      }
    });

    // Handle joining a specific support chat room
    socket.on('join_support_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          // Check if user has access to this chat
          let hasAccess = false;

          if (socket.user.isAdmin) {
            hasAccess = true;
          } else {
            // For any user (including anonymous), check if the user IDs match
            const isUserAnonymous =
              socket.user.isAnonymous ||
              socket.user._id.toString().startsWith('anon_');
            const isChatAnonymous =
              typeof chat.user === 'string' && chat.user.startsWith('anon_');

            if (isUserAnonymous && isChatAnonymous) {
              // Both are anonymous - allow access for now
              hasAccess = true;
            } else {
              // Exact match required for authenticated users
              hasAccess = chat.user.toString() === socket.user._id.toString();
            }
          }

          if (hasAccess) {
            socket.join(chatId);
            console.log(
              `✅ User ${socket.user.userName} successfully joined support chat: ${chatId}`
            );

            // Update chat record with current user information (especially for anonymous users)
            if (
              socket.user.isAnonymous &&
              socket.user.name &&
              socket.user.name !== 'Anonymous User'
            ) {
              try {
                await Chat.findByIdAndUpdate(chatId, {
                  userDisplayName: socket.user.name,
                  userHandle: socket.user.userName || socket.user.name,
                });
              } catch (updateError) {
                console.error(
                  'Error updating chat with user name:',
                  updateError
                );
              }
            }

            // Send existing messages for this chat
            try {
              let messages = await ChatMessage.find({ chat: chatId }).sort({
                createdAt: 1,
              });

              // Process messages to include proper sender information
              const processedMessages = await Promise.all(
                messages.map(async (msg) => {
                  const messageObj = msg.toObject();
                  messageObj.sender = populateMessageSender(messageObj, chat);
                  return messageObj;
                })
              );

              // Send existing messages to the user who just joined
              socket.emit('chat_history', {
                chatId,
                messages: processedMessages,
              });
            } catch (error) {
              console.error('Error fetching chat history:', error);
            }
          } else {
            console.log(
              `❌ User ${socket.user.userName} denied access to chat: ${chatId}`
            );
            console.log(
              `🔍 Debug info - User ID: ${socket.user._id}, Chat User: ${chat.user}, User Anonymous: ${socket.user.isAnonymous || socket.user._id.startsWith('anon_')}, Chat Anonymous: ${typeof chat.user === 'string' && chat.user.startsWith('anon_')}`
            );
          }
        } else {
          console.log(`❌ Chat not found: ${chatId}`);
        }
      } catch (error) {
        console.error('Error joining support chat:', error);
      }
    });

    // Handle leaving a support chat room
    socket.on('leave_support_chat', (chatId) => {
      socket.leave(chatId);
    });

    // Handle sending a message in support chat
    socket.on('send_support_message', async (data) => {
      try {
        const {
          chatId,
          content,
          messageType = 'text',
          attachments = [],
          isInternalNote = false,
        } = data;

        // Validate chat and user permissions
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.log('❌ Chat not found:', chatId);
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        // Check access - admin has access to all, or user owns the chat
        let hasAccess = false;
        if (socket.user.isAdmin) {
          hasAccess = true;
        } else {
          // For any user (including anonymous), check if the user IDs match
          // or if both are anonymous (simplified check for now)
          const isUserAnonymous =
            socket.user.isAnonymous ||
            socket.user._id.toString().startsWith('anon_');
          const isChatAnonymous =
            typeof chat.user === 'string' && chat.user.startsWith('anon_');

          if (isUserAnonymous && isChatAnonymous) {
            // Both are anonymous - allow access for now (in production, implement proper session management)
            hasAccess = true;
          } else {
            // Exact match required for authenticated users
            hasAccess = chat.user.toString() === socket.user._id.toString();
          }
        }

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Only admins can send internal notes
        if (isInternalNote && !socket.user.isAdmin) {
          socket.emit('error', {
            message: 'Only admins can send internal notes',
          });
          return;
        }

        // Create message
        const message = await ChatMessage.create({
          sender: socket.user._id,
          chat: chatId,
          content: content.trim(),
          messageType,
          attachments,
          isInternalNote,
          // Mark as read by sender
          ...(socket.user.isAdmin
            ? {
                isReadByAdmin: true,
                readByAdminAt: new Date(),
              }
            : {
                isReadByUser: true,
                readByUserAt: new Date(),
              }),
        });

        // Update chat's last message and unread counts
        const updateData = {
          lastMessage: message._id,
          updatedAt: new Date(),
        };

        // Track if status changed for notifications
        let statusChanged = false;
        let originalStatus = chat.status;

        // If admin is not assigned, assign current admin
        if (!chat.admin && socket.user.isAdmin) {
          updateData.admin = socket.user._id;
          updateData.status = 'in-progress';
          statusChanged = true;
        }

        // Update unread counts
        if (socket.user.isAdmin) {
          updateData.unreadByUser = (chat.unreadByUser || 0) + 1;
          updateData.unreadByAdmin = 0;
        } else {
          updateData.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
          updateData.unreadByUser = 0;
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, {
          new: true,
        });

        // If status changed due to auto-assignment, notify all participants
        if (statusChanged && updatedChat) {
          // Notify all participants about status change
          io.to(chatId).emit('support_chat_status_updated', {
            chatId,
            status: updatedChat.status,
            priority: updatedChat.priority,
            chat: updatedChat,
            updatedBy: {
              id: socket.user._id,
              userName: socket.user.userName,
            },
          });

          // Also notify all admins (in case they're not in the specific chat room)
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('support_chat_status_updated', {
              chatId,
              status: updatedChat.status,
              priority: updatedChat.priority,
              chat: updatedChat,
              updatedBy: {
                id: socket.user._id,
                userName: socket.user.userName,
              },
            });
          });
        }

        // Always create a proper sender object from the current socket user
        let populatedMessage = await ChatMessage.findById(message._id);
        populatedMessage = populatedMessage.toObject();

        // Handle sender population for both authenticated and anonymous users
        if (
          typeof populatedMessage.sender === 'string' &&
          populatedMessage.sender.startsWith('anon_')
        ) {
          // Anonymous user - use current socket user info
          populatedMessage.sender = {
            _id: populatedMessage.sender,
            userName:
              socket.user.userName || socket.user.name || 'Anonymous User',
            name: socket.user.name || socket.user.userName || 'Anonymous User',
            email: null,
            isAdmin: false,
          };
        } else {
          // Authenticated user (including admin) - always use socket user info to ensure consistency
          populatedMessage.sender = {
            _id: socket.user._id,
            userName:
              socket.user.userName ||
              (socket.user.isAdmin ? 'Epic Realm' : 'User'),
            name:
              socket.user.name || (socket.user.isAdmin ? 'Epic Realm' : 'User'),
            email: socket.user.email || null,
            isAdmin: socket.user.isAdmin === true,
          };
        }

        // Emit message to participants in the chat
        // For internal notes, only emit to admins
        if (isInternalNote) {
          // Emit to all admin sockets
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('new_support_message', populatedMessage);
          });
        } else {
          // Emit to the specific chat room

          io.to(chatId).emit('new_support_message', populatedMessage);
        }

        // Notify all admins about new user message (if sent by user)
        if (!socket.user.isAdmin && !isInternalNote) {
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('new_user_message_notification', {
              chatId,
              message: populatedMessage,
              chat: {
                id: chat._id,
                user: chat.user,
                subject: chat.subject,
                priority: chat.priority,
                status: chat.status,
                unreadByAdmin: updateData.unreadByAdmin,
              },
            });
          });
        }

        // Send notification to user if admin replied
        if (socket.user.isAdmin && !isInternalNote) {
          const userSocketId = userSockets.get(chat.user.toString());
          if (userSocketId) {
            io.to(userSocketId).emit('admin_reply_notification', {
              chatId,
              message: populatedMessage,
            });
          }
        }
      } catch (error) {
        console.error('Error sending support message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('support_typing_start', (data) => {
      const { chatId } = data;
      console.log(
        `🔤 User ${socket.user.userName} is typing in chat: ${chatId}`
      );
      console.log(`🔤 Socket rooms:`, Array.from(socket.rooms));
      console.log(`🔤 Broadcasting to chatId: ${chatId}`);

      // Check if socket is actually in the chat room
      if (!socket.rooms.has(chatId)) {
        console.log(`❌ Socket ${socket.id} is not in chat room ${chatId}`);
        // Auto-join the chat room if not already in it
        socket.join(chatId);
        console.log(`✅ Auto-joined socket to chat room ${chatId}`);
      }

      socket.to(chatId).emit('user_typing_support', {
        userId: socket.user._id,
        userName: socket.user.userName,
        isAdmin: socket.user.isAdmin,
        chatId,
      });
      console.log(`🔤 Typing start event broadcasted to room: ${chatId}`);
    });

    socket.on('support_typing_stop', (data) => {
      const { chatId } = data;
      console.log(
        `🔤 User ${socket.user.userName} stopped typing in chat: ${chatId}`
      );

      socket.to(chatId).emit('user_stop_typing_support', {
        userId: socket.user._id,
        userName: socket.user.userName,
        isAdmin: socket.user.isAdmin,
        chatId,
      });
      console.log(`🔤 Typing stop event broadcasted to room: ${chatId}`);
    });

    // Handle message read status for support chat
    socket.on('mark_support_messages_read', async (data) => {
      try {
        const { chatId } = data;

        // Validate chat access
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return;
        }

        const hasAccess =
          socket.user.isAdmin ||
          chat.user.toString() === socket.user._id.toString();
        if (!hasAccess) {
          return;
        }

        // Update messages as read
        const updateQuery = { chat: chatId };
        const updateData = {};

        if (socket.user.isAdmin) {
          updateQuery.isReadByAdmin = false;
          updateData.isReadByAdmin = true;
          updateData.readByAdminAt = new Date();
        } else {
          updateQuery.isReadByUser = false;
          updateData.isReadByUser = true;
          updateData.readByUserAt = new Date();
        }

        await ChatMessage.updateMany(updateQuery, updateData);

        // Reset unread count in chat
        const chatUpdateData = socket.user.isAdmin
          ? { unreadByAdmin: 0 }
          : { unreadByUser: 0 };
        await Chat.findByIdAndUpdate(chatId, chatUpdateData);

        // Notify other party about read status
        socket.to(chatId).emit('support_messages_read', {
          userId: socket.user._id,
          userName: socket.user.userName,
          isAdmin: socket.user.isAdmin,
          chatId,
        });
      } catch (error) {
        console.error('Error marking support messages as read:', error);
      }
    });

    // Handle chat status update (admin only)
    socket.on('update_support_chat_status', async (data) => {
      try {
        const { chatId, status, priority } = data;

        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

        const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, {
          new: true,
        }).populate('user', 'userName name email');

        if (updatedChat) {
          // Notify all participants about status change
          io.to(chatId).emit('support_chat_status_updated', {
            chatId,
            status: updatedChat.status,
            priority: updatedChat.priority,
            chat: updatedChat,
            updatedBy: {
              id: socket.user._id,
              userName: socket.user.userName,
            },
          });

          // Also notify all admins (in case they're not in the specific chat room)
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('support_chat_status_updated', {
              chatId,
              status: updatedChat.status,
              priority: updatedChat.priority,
              chat: updatedChat,
              updatedBy: {
                id: socket.user._id,
                userName: socket.user.userName,
              },
            });
          });
        }
      } catch (error) {
        console.error('Error updating support chat status:', error);
        socket.emit('error', { message: 'Failed to update chat status' });
      }
    });

    // Handle admin assignment
    socket.on('assign_support_chat', async (data) => {
      try {
        const { chatId } = data;

        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const updatedChat = await Chat.findByIdAndUpdate(
          chatId,
          {
            admin: socket.user._id,
            status: 'in-progress',
            updatedAt: new Date(),
          },
          { new: true }
        ).populate('admin', 'userName name email');

        if (updatedChat) {
          // Notify all admins about assignment
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('support_chat_assigned', {
              chatId,
              assignedTo: {
                id: socket.user._id,
                _id: socket.user._id,
                userName: socket.user.userName,
                name: socket.user.name || socket.user.userName,
              },
              chat: updatedChat,
            });
          });

          // Also emit to the chat room itself for real-time updates
          io.to(chatId).emit('support_chat_assigned', {
            chatId,
            assignedTo: {
              id: socket.user._id,
              _id: socket.user._id,
              userName: socket.user.userName,
              name: socket.user.name || socket.user.userName,
            },
            chat: updatedChat,
          });

          // Notify user about assignment
          const userId =
            typeof updatedChat.user === 'string'
              ? updatedChat.user
              : updatedChat.user && updatedChat.user._id
                ? updatedChat.user._id.toString()
                : updatedChat.user;

          if (userId) {
            const userSocketId = userSockets.get(userId);
            if (userSocketId) {
              io.to(userSocketId).emit('support_chat_assigned_to_admin', {
                chatId,
                admin: {
                  id: socket.user._id,
                  _id: socket.user._id,
                  userName: socket.user.userName,
                  name: socket.user.name || socket.user.userName,
                },
                chat: updatedChat,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error assigning support chat:', error);
        socket.emit('error', { message: 'Failed to assign chat' });
      }
    });

    // Handle admin unassignment
    socket.on('unassign_support_chat', async (data) => {
      try {
        const { chatId } = data;

        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const updatedChat = await Chat.findByIdAndUpdate(
          chatId,
          {
            admin: null,
            status: 'open',
            updatedAt: new Date(),
          },
          { new: true }
        ).populate('admin', 'userName name email');

        if (updatedChat) {
          // Notify all admins about unassignment
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('support_chat_unassigned', {
              chatId,
              chat: updatedChat,
            });
          });

          // Also emit to the chat room itself for real-time updates
          io.to(chatId).emit('support_chat_unassigned', {
            chatId,
            chat: updatedChat,
          });

          // Notify user about unassignment
          const userId =
            typeof updatedChat.user === 'string'
              ? updatedChat.user
              : updatedChat.user && updatedChat.user._id
                ? updatedChat.user._id.toString()
                : updatedChat.user;

          if (userId) {
            const userSocketId = userSockets.get(userId);
            if (userSocketId) {
              io.to(userSocketId).emit('support_chat_unassigned_from_admin', {
                chatId,
                chat: updatedChat,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error unassigning support chat:', error);
        socket.emit('error', { message: 'Failed to unassign chat' });
      }
    });

    // Handle setting custom username for both anonymous and logged-in users
    socket.on('set_support_username', async (data) => {
      try {
        const { name } = data;

        if (name && name.trim()) {
          const customName = name.trim().substring(0, 50); // Limit length

          console.log(
            `👤 User ${socket.user._id} (${socket.user.isAnonymous ? 'anonymous' : 'logged-in'}) setting name: ${customName}`
          );

          // Update socket user data
          socket.user.name = customName;
          socket.user.userName = customName;

          // Update all chat records for this user - try multiple approaches
          try {
            const updateData = {
              userDisplayName: customName,
              userHandle: customName,
            };

            // Update by exact user ID match
            const result1 = await Chat.updateMany(
              { user: socket.user._id },
              updateData
            );
            console.log(
              `✅ Updated ${result1.modifiedCount} chat records by user ID`
            );

            // Update any anonymous chat that this user is currently in
            const rooms = Array.from(socket.rooms);
            const chatRooms = rooms.filter(
              (room) => room !== socket.id && room.length === 24
            );

            if (chatRooms.length > 0) {
              for (const chatId of chatRooms) {
                try {
                  await Chat.findByIdAndUpdate(chatId, updateData, {
                    new: true,
                  });
                  console.log(
                    `✅ Updated chat ${chatId} with new name: ${customName}`
                  );
                } catch (chatUpdateError) {
                  console.error(
                    `Error updating chat ${chatId}:`,
                    chatUpdateError
                  );
                }
              }
            }
          } catch (dbError) {
            console.error(
              'Error updating chat records with new name:',
              dbError
            );
          }

          // Acknowledge the name change
          socket.emit('support_username_set', {
            success: true,
            name: customName,
          });

          console.log(`✅ Anonymous user name updated to: ${customName}`);
        } else {
          socket.emit('support_username_set', {
            success: false,
            error: 'Invalid name or user is not anonymous',
          });
        }
      } catch (error) {
        console.error('Error setting support username:', error);
        socket.emit('support_username_set', {
          success: false,
          error: 'Failed to set username',
        });
      }
    });

    // Handle getting all support chats (admin only)
    socket.on('get_all_support_chats', async (filters = {}) => {
      try {
        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const query = { isActive: true };

        // Apply filters
        if (filters.status) {
          query.status = filters.status;
        }
        if (filters.priority) {
          query.priority = filters.priority;
        }

        const chats = await Chat.find(query)
          .populate('admin', 'userName name email')
          .sort({ updatedAt: -1 })
          .limit(100);

        socket.emit('all_support_chats', {
          success: true,
          chats: chats,
        });
      } catch (error) {
        console.error('Error getting all support chats:', error);
        socket.emit('error', { message: 'Failed to get chats' });
      }
    });

    // Handle getting support chat statistics (admin only)
    socket.on('get_support_chat_stats', async () => {
      try {
        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
          totalChats,
          todayChats,
          totalMessages,
          openChats,
          inProgressChats,
        ] = await Promise.all([
          Chat.countDocuments({ isActive: true }),
          Chat.countDocuments({
            isActive: true,
            createdAt: { $gte: today, $lt: tomorrow },
          }),
          ChatMessage.countDocuments({}),
          Chat.countDocuments({ status: 'open', isActive: true }),
          Chat.countDocuments({ status: 'in-progress', isActive: true }),
        ]);

        const stats = {
          chats: {
            total: totalChats,
            unread: openChats + inProgressChats,
            today: todayChats,
          },
          messages: {
            total: totalMessages,
          },
        };

        socket.emit('support_chat_stats', {
          success: true,
          stats: stats,
        });
      } catch (error) {
        console.error('Error getting support chat stats:', error);
        socket.emit('error', { message: 'Failed to get stats' });
      }
    });

    // Handle status updates
    socket.on('update_status', (status) => {
      if (activeUsers.has(socket.user._id.toString())) {
        activeUsers.get(socket.user._id.toString()).status = status;

        // Broadcast status to admins
        if (!socket.user.isAdmin) {
          adminSockets.forEach((socketId, adminId) => {
            io.to(socketId).emit('user_status_updated', {
              userId: socket.user._id,
              userName: socket.user.userName,
              status,
            });
          });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.userName} disconnected`);

      // Remove from active users
      activeUsers.delete(socket.user._id.toString());
      userSockets.delete(socket.user._id.toString());

      if (socket.user.isAdmin) {
        adminSockets.delete(socket.user._id.toString());
        console.log(
          `👨‍💼 Admin ${socket.user.userName} removed from adminSockets map. Total admins: ${adminSockets.size}`
        );
      }

      // Broadcast offline status
      const broadcastEvent = socket.user.isAdmin
        ? 'admin_status_updated'
        : 'user_status_updated';
      socket.broadcast.emit(broadcastEvent, {
        userId: socket.user._id,
        userName: socket.user.userName,
        status: 'offline',
      });
    });

    // Handle deleting a single support chat (admin only)
    socket.on('delete_support_chat', async (data) => {
      console.log(
        '🗑️ Received delete_support_chat event from:',
        socket.user.userName
      );
      console.log('🗑️ Delete data:', data);

      try {
        const { chatId } = data;

        if (!socket.user.isAdmin) {
          console.log('🗑️ Access denied - user is not admin');
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        console.log('🗑️ Admin check passed, finding chat:', chatId);

        // Find the chat to delete
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.log('🗑️ Chat not found:', chatId);
          socket.emit('error', { message: 'Chat not found.' });
          return;
        }

        console.log('🗑️ Chat found, deleting messages...');

        // Delete all messages in the chat
        const messageDeleteResult = await ChatMessage.deleteMany({
          chat: chatId,
        });
        console.log('🗑️ Deleted', messageDeleteResult.deletedCount, 'messages');

        // Delete the chat itself
        const chatDeleteResult = await Chat.findByIdAndDelete(chatId);
        console.log('🗑️ Chat deletion result:', !!chatDeleteResult);

        console.log(`🗑️ Admin ${socket.user.userName} deleted chat: ${chatId}`);

        // Notify all admins about the deletion
        console.log('🗑️ Notifying', adminSockets.size, 'admins about deletion');
        adminSockets.forEach((socketId, adminId) => {
          io.to(socketId).emit('support_chat_deleted', {
            chatId,
            deletedBy: {
              id: socket.user._id,
              userName: socket.user.userName,
            },
          });
        });

        // Notify the user if they're online that their chat has been deleted
        const userId =
          typeof chat.user === 'string' ? chat.user : chat.user._id?.toString();
        if (userId) {
          const userSocketId = userSockets.get(userId);
          if (userSocketId) {
            console.log('🗑️ Notifying user about chat deletion');
            io.to(userSocketId).emit('support_chat_deleted_user', {
              chatId,
              message: 'Your support chat has been closed by an administrator.',
            });
          }
        }

        socket.emit('support_chat_delete_success', { chatId });
        console.log('🗑️ Delete operation completed successfully');
      } catch (error) {
        console.error('🗑️ Error deleting support chat:', error);
        socket.emit('error', { message: 'Failed to delete chat' });
      }
    });

    // Handle deleting all support chats (admin only)
    socket.on('delete_all_support_chats', async (data) => {
      console.log(
        '🗑️ Received delete_all_support_chats event from:',
        socket.user.userName
      );
      console.log('🗑️ Delete all data:', data);

      try {
        if (!socket.user.isAdmin) {
          console.log('🗑️ Access denied - user is not admin');
          socket.emit('error', { message: 'Access denied. Admin only.' });
          return;
        }

        const { confirmText } = data;

        // Safety check - require confirmation text
        if (confirmText !== 'DELETE ALL CHATS') {
          console.log('🗑️ Invalid confirmation text:', confirmText);
          socket.emit('error', { message: 'Invalid confirmation text.' });
          return;
        }

        console.log(
          '🗑️ Confirmation text valid, proceeding with mass deletion'
        );

        // Get all active chats
        const allChats = await Chat.find({ isActive: true });
        const chatIds = allChats.map((chat) => chat._id);
        console.log('🗑️ Found', allChats.length, 'chats to delete');

        // Delete all messages
        const messageDeleteResult = await ChatMessage.deleteMany({
          chat: { $in: chatIds },
        });
        console.log('🗑️ Deleted', messageDeleteResult.deletedCount, 'messages');

        // Delete all chats
        const chatDeleteResult = await Chat.deleteMany({ isActive: true });
        console.log('🗑️ Deleted', chatDeleteResult.deletedCount, 'chats');

        console.log(
          `🗑️ Admin ${socket.user.userName} deleted all ${allChats.length} chats`
        );

        // Notify all admins about the mass deletion
        console.log(
          '🗑️ Notifying',
          adminSockets.size,
          'admins about mass deletion'
        );
        adminSockets.forEach((socketId, adminId) => {
          io.to(socketId).emit('all_support_chats_deleted', {
            deletedCount: allChats.length,
            deletedBy: {
              id: socket.user._id,
              userName: socket.user.userName,
            },
          });
        });

        // Notify all users that their chats have been deleted
        allChats.forEach((chat) => {
          const userId =
            typeof chat.user === 'string'
              ? chat.user
              : chat.user._id?.toString();
          if (userId) {
            const userSocketId = userSockets.get(userId);
            if (userSocketId) {
              io.to(userSocketId).emit('support_chat_deleted_user', {
                chatId: chat._id,
                message:
                  'All support chats have been cleared by an administrator.',
              });
            }
          }
        });

        socket.emit('all_support_chats_delete_success', {
          deletedCount: allChats.length,
        });
        console.log('🗑️ Mass delete operation completed successfully');
      } catch (error) {
        console.error('🗑️ Error deleting all support chats:', error);
        socket.emit('error', { message: 'Failed to delete all chats' });
      }
    });
  });

  return io;
};

// Get active users
const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

// Get active admins
const getActiveAdmins = () => {
  return Array.from(activeUsers.values()).filter((user) => user.isAdmin);
};

// Check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

// Send message to specific user
const sendMessageToUser = (io, userId, event, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Send message to all active admins
const sendMessageToAllAdmins = (io, event, data) => {
  adminSockets.forEach((socketId, adminId) => {
    io.to(socketId).emit(event, data);
  });
};

export {
  initializeSocketIO,
  getActiveUsers,
  getActiveAdmins,
  isUserOnline,
  sendMessageToUser,
  sendMessageToAllAdmins,
};

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SupportChatContext = createContext();

export const useSupportChat = () => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error("useSupportChat must be used within a SupportChatProvider");
  }
  return context;
};

export const SupportChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [chats, setChats] = useState({}); // Store complete chat objects
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    // Clean up existing socket before creating new one
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    // Always initialize socket - allows anonymous users
    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8001",
      {
        auth: {
          token: accessToken || null, // Allow null token for anonymous users
        },
        transports: ["websocket", "polling"],
      }
    );

    console.log(
      "SupportChatContext: Socket created with token:",
      !!accessToken
    );
    setSocket(socketInstance);

    // Connection events
    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      setIsConnected(false);
    });

    // Support chat specific events
    socketInstance.on("new_support_message", (message) => {
      setMessages((prev) => {
        const existingMessages = prev[message.chat] || [];
        const messageExists = existingMessages.some(
          (msg) => msg._id === message._id
        );

        if (!messageExists) {
          const updated = {
            ...prev,
            [message.chat]: [...existingMessages, message],
          };
          return updated;
        } else {
          return prev;
        }
      });

      // Update unread count if message is not from current user
      if (message.sender._id !== (user?._id || `anon_${socketInstance.id}`)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.chat]: (prev[message.chat] || 0) + 1,
        }));
      }
    });

    socketInstance.on("new_user_message_notification", (data) => {
      // For admin: notification when user sends message
      if (user?.isAdmin) {
        // Check if the message already exists in our messages state
        // This prevents duplicates when both new_support_message and notification are received
        if (data.message && data.chatId) {
          setMessages((prev) => {
            const existingMessages = prev[data.chatId] || [];
            const messageExists = existingMessages.some(
              (msg) => msg._id === data.message._id
            );

            if (!messageExists) {
              return {
                ...prev,
                [data.chatId]: [...existingMessages, data.message],
              };
            } else {
              return prev;
            }
          });

          // Update unread count only if message doesn't exist
          setUnreadCounts((prev) => ({
            ...prev,
            [data.chatId]: (prev[data.chatId] || 0) + 1,
          }));
        }
      }
    });

    socketInstance.on("admin_reply_notification", (data) => {
      // For user: notification when admin replies
      if (!user?.isAdmin) {
        // You can show a toast notification here
      }
    });

    socketInstance.on("user_typing_support", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.chatId]: { ...data, isTyping: true },
      }));
    });

    socketInstance.on("user_stop_typing_support", (data) => {
      setTypingUsers((prev) => {
        const newState = { ...prev };
        delete newState[data.chatId];
        return newState;
      });
    });

    socketInstance.on("support_messages_read", (data) => {
      if (data.userId !== (user?._id || `anon_${socketInstance.id}`)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.chatId]: 0,
        }));
      }
    });

    socketInstance.on("support_chat_status_updated", (data) => {
      // Update chat status and priority
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[data.chatId]) {
          updated[data.chatId] = {
            ...updated[data.chatId],
            status: data.status,
            priority: data.priority,
            updatedAt: new Date().toISOString(),
          };
        }
        return updated;
      });
    });

    socketInstance.on("support_chat_assigned", (data) => {
      // Update chat assignment in the chats state
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[data.chatId]) {
          updated[data.chatId] = {
            ...updated[data.chatId],
            admin: data.assignedTo,
            status: "in-progress",
            updatedAt: new Date().toISOString(),
          };
        }
        return updated;
      });
    });

    socketInstance.on("support_chat_assigned_to_admin", (data) => {
      // Update chat status when assigned to admin
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[data.chatId]) {
          updated[data.chatId] = {
            ...updated[data.chatId],
            admin: data.admin,
            status: "in-progress",
            updatedAt: new Date().toISOString(),
          };
        }
        return updated;
      });
    });

    socketInstance.on("support_chat_unassigned_from_admin", (data) => {
      // Update chat status when unassigned from admin
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[data.chatId]) {
          updated[data.chatId] = {
            ...updated[data.chatId],
            admin: null,
            status: "open",
            updatedAt: new Date().toISOString(),
          };
        }
        return updated;
      });
    });

    socketInstance.on("support_chat_unassigned", (data) => {
      // Update chat unassignment in the chats state
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[data.chatId]) {
          updated[data.chatId] = {
            ...updated[data.chatId],
            admin: null,
            status: "open",
            updatedAt: new Date().toISOString(),
          };
        }
        return updated;
      });
    });

    // Handle receiving chat history when joining a chat
    socketInstance.on("chat_history", (data) => {
      const { chatId, messages: chatMessages, chat } = data;

      setMessages((prev) => {
        const updated = {
          ...prev,
          [chatId]: chatMessages,
        };
        return updated;
      });

      // If we have complete chat metadata, store it separately
      if (chat) {
        setChats((prev) => {
          const updated = {
            ...prev,
            [chatId]: chat,
          };
          return updated;
        });
      }
    });

    socketInstance.on("user_status_updated", (data) => {
      setActiveUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId ? { ...u, status: data.status } : u
        )
      );
    });

    socketInstance.on("support_username_set", (data) => {
      if (!data.success) {
        console.error("Failed to set username:", data.error);
      }
    });

    socketInstance.on("chat_created", (data) => {
      const { chat, messages } = data;

      // Update chats state
      setChats((prev) => ({
        ...prev,
        [chat._id]: chat,
      }));

      // Update messages state
      setMessages((prev) => ({
        ...prev,
        [chat._id]: messages,
      }));

      // Emit chat_created_success for the component to handle
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("chat_created_success", {
            detail: { chat, messages },
          })
        );
      }
    });

    socketInstance.on("new_support_chat", (data) => {
      // This is for admin dashboard - a new chat was created
      const { chat } = data;

      // Update chats state
      setChats((prev) => ({
        ...prev,
        [chat._id]: chat,
      }));

      // Initialize empty messages for the new chat
      setMessages((prev) => ({
        ...prev,
        [chat._id]: [],
      }));
    });

    // Handle all chats response (for admin)
    socketInstance.on("all_support_chats", (data) => {
      if (data.success && data.chats) {
        const chatsObj = {};
        data.chats.forEach((chat) => {
          chatsObj[chat._id] = chat;
        });
        setChats(chatsObj);
      }
    });

    // Handle chat stats response (for admin)
    socketInstance.on("support_chat_stats", (data) => {
      if (data.success && data.stats) {
        // Stats will be calculated in the component from socket data
      }
    });

    // Handle chat deletion events
    socketInstance.on("support_chat_deleted", (data) => {
      const { chatId } = data;

      // Remove from chats state
      setChats((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // Remove from messages state
      setMessages((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // Remove from unread counts
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });
    });

    socketInstance.on("all_support_chats_deleted", (data) => {
      // Clear all chats, messages, and unread counts
      setChats({});
      setMessages({});
      setUnreadCounts({});
    });

    socketInstance.on("support_chat_deleted_user", (data) => {
      // For users - their chat was deleted by admin
      const { chatId } = data;

      // Remove from local state
      setChats((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      setMessages((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // Show notification (you can customize this)
      console.log("Your support chat has been closed by an administrator");
    });

    // Listen for delete success events
    socketInstance.on("support_chat_delete_success", (data) => {
      console.log("🗑️ Single chat delete success:", data);
      // Success is handled in the component
    });

    socketInstance.on("all_support_chats_delete_success", (data) => {
      console.log("🗑️ All chats delete success:", data);
      // Success is handled in the component
    });

    socketInstance.on("error", (error) => {
      // Only log unexpected errors, not "Chat not found" which is expected for new users
      if (error.message !== "Chat not found") {
        console.error("Support chat error:", error);
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]); // Re-create socket when user changes (login/logout)

  // Socket functions
  const joinSupportChat = (chatId) => {
    if (socket) {
      socket.emit("join_support_chat", chatId);
    }
  };

  const createSupportChat = (data = {}) => {
    if (socket) {
      socket.emit("create_support_chat", data);
    }
  };

  const leaveSupportChat = (chatId) => {
    if (socket) {
      socket.emit("leave_support_chat", chatId);
    }
  };

  const sendSupportMessage = (chatId, messageData) => {
    if (socket) {
      socket.emit("send_support_message", {
        chatId,
        ...messageData,
      });
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit("support_typing_start", { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit("support_typing_stop", { chatId });
    }
  };

  const markMessagesAsRead = (chatId) => {
    if (socket) {
      socket.emit("mark_support_messages_read", { chatId });
      setUnreadCounts((prev) => ({
        ...prev,
        [chatId]: 0,
      }));
    }
  };

  const updateChatStatus = (chatId, status, priority) => {
    if (socket && user.isAdmin) {
      socket.emit("update_support_chat_status", { chatId, status, priority });
    }
  };

  const setSupportUsername = (name) => {
    if (socket && name) {
      socket.emit("set_support_username", { name });
    }
  };

  const assignChat = (chatId) => {
    if (socket && user.isAdmin) {
      socket.emit("assign_support_chat", { chatId });
    }
  };

  const unassignChat = (chatId) => {
    if (socket && user.isAdmin) {
      socket.emit("unassign_support_chat", { chatId });
    }
  };

  const requestAllChats = (filters = {}) => {
    if (socket && user?.isAdmin) {
      socket.emit("get_all_support_chats", filters);
    }
  };

  const requestChatStats = () => {
    if (socket && user?.isAdmin) {
      socket.emit("get_support_chat_stats");
    }
  };

  const deleteSupportChat = (chatId) => {
    console.log("🗑️ deleteSupportChat called with chatId:", chatId);
    console.log("🗑️ Socket exists:", !!socket);
    console.log("🗑️ User is admin:", user?.isAdmin);
    if (socket && user?.isAdmin) {
      console.log("🗑️ Emitting delete_support_chat event");
      socket.emit("delete_support_chat", { chatId });
    } else {
      console.log("🗑️ Cannot delete - missing socket or not admin");
    }
  };

  const deleteAllSupportChats = (confirmText) => {
    if (socket && user?.isAdmin) {
      socket.emit("delete_all_support_chats", { confirmText });
    }
  };

  const value = {
    socket,
    isConnected,
    activeUsers,
    messages,
    chats, // Add complete chat objects
    unreadCounts,
    typingUsers,
    joinSupportChat,
    createSupportChat,
    leaveSupportChat,
    sendSupportMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    updateChatStatus,
    assignChat,
    unassignChat,
    setSupportUsername,
    setMessages,
    setUnreadCounts,
    requestAllChats,
    requestChatStats,
    deleteSupportChat,
    deleteAllSupportChats,
  };

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { useSupportChat } from "../context/SupportChatContext";
import { useAuth } from "../context/AuthContext";
import "./SupportChat.css";

const SupportChat = () => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  console.log("🚀 ~ SupportChat ~ messages:", messages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isNameSet, setIsNameSet] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user } = useAuth();
  const {
    socket,
    isConnected,
    joinSupportChat,
    createSupportChat,
    leaveSupportChat,
    sendSupportMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    setSupportUsername,
    messages: socketMessages,
    chats: socketChats,
    unreadCounts,
    typingUsers,
  } = useSupportChat();

  useEffect(() => {
    // Check if user is authenticated or if anonymous user has set a name
    if (user) {
      setIsNameSet(true);
      setUserName(user.userName || user.name || "User");
    } else {
      // Anonymous user - check if name is stored in sessionStorage
      const storedName = sessionStorage.getItem("supportChatUserName");
      if (storedName) {
        setUserName(storedName);
        setIsNameSet(true);
      } else {
        setIsNameSet(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isChatOpen && isNameSet) {
      loadSupportChat();
    }
  }, [isChatOpen, isNameSet]);

  useEffect(() => {
    if (chat && socketMessages[chat._id]) {
      setMessages(socketMessages[chat._id]);
    }
  }, [socketMessages, chat]);

  // Update chat status when socket chats change
  useEffect(() => {
    if (chat && socketChats[chat._id]) {
      const updatedChat = socketChats[chat._id];
      if (updatedChat) {
        setChat((prevChat) => ({
          ...prevChat,
          status: updatedChat.status || prevChat.status,
          priority: updatedChat.priority || prevChat.priority,
          admin: updatedChat.admin || prevChat.admin,
          updatedAt: updatedChat.updatedAt || prevChat.updatedAt,
        }));
      }
    }
  }, [socketChats, chat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chat && isChatOpen) {
      markMessagesAsRead(chat._id);
    }
  }, [chat, isChatOpen, messages]);

  // Listen for chat creation success
  useEffect(() => {
    const handleChatCreated = (event) => {
      const { chat: newChat, messages: newMessages } = event.detail;
      setChat(newChat);
      setMessages(newMessages);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("chat_created_success", handleChatCreated);
      return () => {
        window.removeEventListener("chat_created_success", handleChatCreated);
      };
    }
  }, []);

  const loadSupportChat = async () => {
    setIsLoading(true);

    // Create a new support chat via socket
    const chatData = {
      subject: "Support Chat",
      priority: "medium",
    };

    // Send username to backend first
    if (user && socket) {
      const displayName = user.name || user.userName || "User";
      setSupportUsername(displayName);
    } else if (!user && userName && socket) {
      setSupportUsername(userName);
    }

    // Create the chat
    createSupportChat(chatData);

    // The chat creation response will be handled by the context's socket event listeners
    // and will update the component state via useEffect
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !chat || !chat._id || !isConnected) {
      return;
    }

    const messageData = {
      content: newMessage.trim(),
      messageType: "text",
    };

    try {
      // Send via socket
      sendSupportMessage(chat._id, messageData);

      // Clear input
      setNewMessage("");
      stopTyping(chat._id);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && chat) {
      setIsTyping(true);
      startTyping(chat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chat) {
        stopTyping(chat._id);
      }
    }, 1000);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      // Store name in sessionStorage for this session
      sessionStorage.setItem("supportChatUserName", userName.trim());

      // Send username to server for both anonymous and logged-in users
      if (socket) {
        setSupportUsername(userName.trim());
      }

      setIsNameSet(true);
      setShowNameInput(false);
      // Now load the support chat
      loadSupportChat();
    }
  };

  const handleChatToggle = () => {
    if (!isChatOpen) {
      // Opening chat
      if (!user && !isNameSet) {
        // Anonymous user without name - show name input
        setShowNameInput(true);
      }
      setIsChatOpen(true);
    } else {
      // Closing chat
      setIsChatOpen(false);
      setShowNameInput(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ffc107";
      case "in-progress":
        return "#17a2b8";
      case "resolved":
        return "#28a745";
      case "closed":
        return "#6c757d";
      default:
        return "#007bff";
    }
  };

  if (!isChatOpen) {
    return (
      <div className="support-chat-toggle">
        <button className="support-chat-button" onClick={handleChatToggle}>
          <i className="fas fa-comments"></i>
          {unreadCounts[chat?._id] > 0 && (
            <span className="unread-badge">{unreadCounts[chat._id]}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="support-chat-container">
      <div className="support-chat-header">
        <div className="chat-header-info">
          <h4>Support Chat</h4>
          {isNameSet && (
            <div className="user-info">
              <span className="username username-white">@{userName}</span>
            </div>
          )}
          <div className="chat-status">
            <span
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(chat?.status) }}
            ></span>
            <span className="status-text">
              {chat?.status || "Not Connected"}
            </span>
            {!isConnected && <span className="offline-indicator">●</span>}
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            className="minimize-button"
            onClick={() => setIsChatOpen(false)}
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
      </div>

      <div className="support-chat-body">
        {showNameInput ? (
          <div className="name-input-container">
            <div className="name-input-content">
              <h5>Welcome to Support Chat!</h5>
              <p>Please enter your name to get started:</p>
              <form onSubmit={handleNameSubmit} className="name-input-form">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="name-input"
                  autoFocus
                  maxLength={50}
                />
                <button
                  type="submit"
                  className="name-submit-button"
                  disabled={!userName.trim()}
                >
                  Start Chat
                </button>
              </form>
            </div>
          </div>
        ) : isLoading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Loading chat...</p>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <i className="fas fa-comments"></i>
                  <p>Start a conversation with our support team!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const messageSender = message.sender;
                  const currentUserId = user?._id;
                  const socketId = socket?.id;
                  const anonymousId = `anon_${socketId}`;

                  // Determine if this is user's own message
                  let isOwnMessage = false;

                  if (messageSender?.isAdmin) {
                    // Admin messages are never user's own messages
                    isOwnMessage = false;
                  } else if (user && currentUserId) {
                    // Authenticated user - compare user IDs
                    const senderId = messageSender?._id || messageSender;
                    isOwnMessage = senderId === currentUserId;
                  } else if (socketId) {
                    // Anonymous user - check for anonymous ID pattern
                    const senderId = messageSender?._id || messageSender;
                    isOwnMessage = senderId === anonymousId;
                  } else {
                    // Fallback: if sender is not admin, assume it's user's message
                    isOwnMessage = !messageSender?.isAdmin;
                  }

                  return (
                    <div
                      key={message._id}
                      className={`message ${
                        isOwnMessage ? "own-message" : "other-message"
                      }`}
                    >
                      <div className="message-content">
                        <div className="message-header">
                          <span className="sender-name">
                            {message.sender?.isAdmin && (
                              <i className="fas fa-shield-alt admin-badge"></i>
                            )}
                            {message.sender?.isAdmin
                              ? "Epic Realm"
                              : message.sender?.name ||
                                message.sender?.userName ||
                                "You"}
                          </span>
                          <span className="message-time">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <div className="message-text">
                          {message.content}
                          {message.isEdited && (
                            <span className="edited-indicator">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUsers[chat?._id] && (
                <div className="typing-indicator">
                  <div className="typing-content">
                    <span className="typing-name">
                      {typingUsers[chat._id].isAdmin
                        ? "Support"
                        : typingUsers[chat._id].userName}
                    </span>
                    <span className="typing-text">is typing</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <div className="input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="message-input"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim() || !isConnected}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChat;

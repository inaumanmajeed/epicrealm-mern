import React, { useState, useEffect, useCallback } from "react";
import { useSupportChat } from "../context/SupportChatContext";
import { useAuth } from "../context/AuthContext";
import AdminNavigation from "./AdminNavigation";
import "./AdminSupportDashboard.css";

const AdminSupportDashboard = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });
  const [stats, setStats] = useState(null);

  const { user } = useAuth();
  const {
    isConnected,
    joinSupportChat,
    leaveSupportChat,
    sendSupportMessage,
    markMessagesAsRead,
    updateChatStatus,
    assignChat,
    unassignChat,
    messages: socketMessages,
    chats: socketChats,
    unreadCounts,
    requestAllChats,
    requestChatStats,
  } = useSupportChat();

  // Memoized functions to prevent infinite re-renders
  const memoizedRequestAllChats = useCallback(() => {
    if (requestAllChats) {
      requestAllChats(filters);
    }
  }, [requestAllChats, filters.status, filters.priority]);

  const memoizedRequestChatStats = useCallback(() => {
    if (requestChatStats) {
      requestChatStats();
    }
  }, [requestChatStats]);

  // Load initial data from socket
  useEffect(() => {
    if (!user?.isAdmin || !isConnected) return;

    // Request all chats and stats from socket
    memoizedRequestAllChats();
    memoizedRequestChatStats();
  }, [
    user?.isAdmin,
    isConnected,
    memoizedRequestAllChats,
    memoizedRequestChatStats,
  ]);

  useEffect(() => {
    if (selectedChat && socketMessages[selectedChat._id]) {
      const socketMessagesForChat = socketMessages[selectedChat._id];
      setMessages(socketMessagesForChat);
    }
  }, [socketMessages, selectedChat]);

  // Update selected chat when socketChats change (for real-time status/priority updates)
  useEffect(() => {
    if (selectedChat && socketChats[selectedChat._id]) {
      const updatedChatData = socketChats[selectedChat._id];
      const currentChat = selectedChat;

      // Only update if there are actual changes to avoid infinite loops
      const hasChanges =
        updatedChatData.status !== currentChat.status ||
        updatedChatData.priority !== currentChat.priority ||
        (updatedChatData.admin?._id || updatedChatData.admin?.id) !==
          (currentChat.admin?._id || currentChat.admin?.id) ||
        updatedChatData.updatedAt !== currentChat.updatedAt;

      if (hasChanges) {
        setSelectedChat((prev) => ({
          ...prev,
          status: updatedChatData.status || prev.status,
          priority: updatedChatData.priority || prev.priority,
          admin: updatedChatData.admin || prev.admin,
          updatedAt: updatedChatData.updatedAt || prev.updatedAt,
        }));

        // Also update in the chats list
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  status: updatedChatData.status || chat.status,
                  priority: updatedChatData.priority || chat.priority,
                  admin: updatedChatData.admin || chat.admin,
                  updatedAt: updatedChatData.updatedAt || chat.updatedAt,
                }
              : chat
          )
        );
      }
    }
  }, [socketChats, selectedChat?._id]); // Only depend on the chat ID, not the entire object

  // Update chats list when socket chats change
  useEffect(() => {
    if (socketChats && Object.keys(socketChats).length > 0) {
      const chatArray = Object.values(socketChats).filter((chat) => {
        // Apply filters
        if (filters.status && chat.status !== filters.status) {
          return false;
        }
        if (filters.priority && chat.priority !== filters.priority) {
          return false;
        }
        return true;
      });

      // Sort by most recent first
      chatArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setChats(chatArray);

      // Calculate stats from socket data
      const totalMessages = Object.keys(socketMessages || {}).reduce(
        (total, chatId) => {
          const messages = socketMessages[chatId];
          if (Array.isArray(messages)) {
            return total + messages.length;
          }
          return total;
        },
        0
      );

      const calculatedStats = {
        chats: {
          total: Object.keys(socketChats).length,
          unread: Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0),
          today: Object.values(socketChats).filter((chat) => {
            const today = new Date().toDateString();
            const chatDate = new Date(chat.createdAt).toDateString();
            return today === chatDate;
          }).length,
        },
        messages: {
          total: totalMessages,
        },
      };

      setStats(calculatedStats);
    } else {
      setChats([]);
      setStats({
        chats: { total: 0, unread: 0, today: 0 },
        messages: { total: 0 },
      });
    }
  }, [
    socketChats,
    socketMessages,
    unreadCounts,
    filters.status,
    filters.priority,
  ]); // Use specific filter properties

  const handleChatSelect = (chat) => {
    if (selectedChat) {
      leaveSupportChat(selectedChat._id);
    }

    setSelectedChat(chat);

    // Get messages from socket directly
    const socketMessagesForChat = socketMessages[chat._id] || [];
    setMessages(socketMessagesForChat);

    // Join the socket room for real-time updates
    joinSupportChat(chat._id);
    markMessagesAsRead(chat._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      content: newMessage.trim(),
      messageType: "text",
      isInternalNote,
    };

    sendSupportMessage(selectedChat._id, messageData);
    setNewMessage("");
    setIsInternalNote(false);
  };

  const handleStatusUpdate = (status, priority) => {
    if (selectedChat) {
      // Immediately update the UI state for responsiveness
      setSelectedChat((prev) => ({
        ...prev,
        status,
        priority,
        updatedAt: new Date().toISOString(),
      }));

      // Update chats list immediately
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, status, priority, updatedAt: new Date().toISOString() }
            : chat
        )
      );

      // Send socket event after UI update
      updateChatStatus(selectedChat._id, status, priority);
    }
  };

  const handleAssignChat = () => {
    if (selectedChat) {
      // Immediately update the UI state for responsiveness
      const adminData = {
        _id: user._id,
        id: user._id,
        userName: user.userName || user.name,
        name: user.name || user.userName,
      };

      // Update selected chat immediately
      setSelectedChat((prev) => ({
        ...prev,
        status: "in-progress",
        admin: adminData,
        updatedAt: new Date().toISOString(),
      }));

      // Update chats list immediately
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                status: "in-progress",
                admin: adminData,
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );

      // Send socket event after UI update
      assignChat(selectedChat._id);
    }
  };

  const handleUnassignChat = () => {
    if (selectedChat) {
      // Immediately update the UI state for responsiveness
      setSelectedChat((prev) => ({
        ...prev,
        status: "open",
        admin: null,
        updatedAt: new Date().toISOString(),
      }));

      // Update chats list immediately
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                status: "open",
                admin: null,
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );

      // Send socket event after UI update
      unassignChat(selectedChat._id);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "#28a745";
      case "medium":
        return "#ffc107";
      case "high":
        return "#fd7e14";
      case "urgent":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <>
      <AdminNavigation />
      <div className="admin-support-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Support Chat Dashboard</h1>
          <div className="connection-status">
            <span
              className={`status-dot ${
                isConnected ? "connected" : "disconnected"
              }`}
            ></span>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <h3>{stats?.chats?.total}</h3>
              <p>Total Chats</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.chats?.unread}</h3>
              <p>Unread Chats</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.chats?.today}</h3>
              <p>Today's Chats</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.messages?.total}</h3>
              <p>Total Messages</p>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          {/* Sidebar - Chat List */}
          <div className="chats-sidebar">
            <div className="sidebar-header">
              <h3>Support Chats</h3>
              <div className="filters">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="filter-select"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="chats-list">
              {chats.length === 0 ? (
                <div className="no-chats">No chats available</div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item ${
                      selectedChat?._id === chat._id ? "selected" : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="chat-item-header">
                      <div className="user-info">
                        <strong>
                          {chat.user?.name ||
                            chat.user?.userName ||
                            "Anonymous User"}
                        </strong>
                        <span className="username">
                          @
                          {chat.user?.userName ||
                            chat.user?.name ||
                            "anonymous"}
                        </span>
                      </div>
                      <div className="chat-meta">
                        {unreadCounts[chat._id] > 0 && (
                          <span className="unread-count">
                            {unreadCounts[chat._id]}
                          </span>
                        )}
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(chat.priority),
                          }}
                        >
                          {chat.priority}
                        </span>
                      </div>
                    </div>
                    <div className="chat-item-body">
                      <p className="subject">{chat.subject}</p>
                      <div className="chat-item-footer">
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(chat.status),
                          }}
                        >
                          {chat.status}
                        </span>
                        <span className="last-update">
                          {formatTime(chat.updatedAt)}
                        </span>
                        {chat.admin && (
                          <span className="assigned-to">
                            📋 {chat.admin.userName || "Assigned"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-main">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-info">
                    <h3>
                      {selectedChat.user?.name ||
                        selectedChat.user?.userName ||
                        "Anonymous User"}
                    </h3>
                    <p>{selectedChat.subject}</p>
                  </div>
                  <div className="chat-actions">
                    <select
                      key={`status-${selectedChat._id}-${selectedChat.status}`}
                      value={selectedChat.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          e.target.value,
                          selectedChat.priority
                        )
                      }
                      className="status-select"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      key={`priority-${selectedChat._id}-${selectedChat.priority}`}
                      value={selectedChat.priority}
                      onChange={(e) =>
                        handleStatusUpdate(selectedChat.status, e.target.value)
                      }
                      className="priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    {!selectedChat.admin ? (
                      <button
                        onClick={handleAssignChat}
                        className="assign-button"
                      >
                        Assign to Me
                      </button>
                    ) : (
                      <div className="assigned-info">
                        {selectedChat.admin?.id === user._id ||
                        selectedChat.admin?._id === user._id ? (
                          <button
                            onClick={handleUnassignChat}
                            className="unassign-button"
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={handleAssignChat}
                            className="reassign-button"
                          >
                            Assign to Me
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <i className="fas fa-comments"></i>
                      <p>No messages in this conversation yet</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const senderName =
                        message.sender?.name ||
                        message.sender?.userName ||
                        "Unknown User";
                      const isOwnMessage =
                        message.sender?._id === user?._id ||
                        message.sender === user?._id;

                      return (
                        <div
                          key={message._id}
                          className={`message ${
                            isOwnMessage ? "own-message" : "user-message"
                          } ${message.isInternalNote ? "internal-note" : ""}`}
                        >
                          <div className="message-content">
                            <div className="message-header">
                              <span className="sender-name">
                                {isOwnMessage ? "Epic Realm" : senderName}
                                {message.isInternalNote && (
                                  <span className="internal-badge">
                                    Internal Note
                                  </span>
                                )}
                              </span>
                              <span className="message-time">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <div className="message-text">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="message-form">
                  <div className="input-options">
                    <label className="internal-note-toggle">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                      />
                      Internal Note (Not visible to user)
                    </label>
                  </div>
                  <div className="input-container">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        isInternalNote
                          ? "Add an internal note..."
                          : "Type your reply..."
                      }
                      className="message-textarea"
                      rows="3"
                    />
                    <button
                      type="submit"
                      className="send-button"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <i className="fas fa-comments"></i>
                <h3>Select a chat to get started</h3>
                <p>
                  Choose a support chat from the sidebar to view and respond to
                  messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSupportDashboard;

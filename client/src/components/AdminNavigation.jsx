import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSupportChat } from "../context/SupportChatContext";
import "./AdminNavigation.css";

const AdminNavigation = () => {
  const { user } = useAuth();
  const { unreadCounts } = useSupportChat();
  const location = useLocation();

  // Calculate total unread messages for admin
  const totalUnreadForAdmin = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0
  );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="admin-navigation">
      <div className="admin-nav-container">
        <div className="admin-nav-brand">
          <i className="fas fa-shield-alt"></i>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav-links">
          <Link
            to="/admin/support"
            className={`admin-nav-link ${
              location.pathname === "/admin/support" ? "active" : ""
            }`}
          >
            <i className="fas fa-headset"></i>
            <span>Support Chat</span>
            {totalUnreadForAdmin > 0 && (
              <span className="unread-badge">{totalUnreadForAdmin}</span>
            )}
          </Link>

          <Link to="/" className="admin-nav-link">
            <i className="fas fa-home"></i>
            <span>Main Site</span>
          </Link>
        </nav>

        <div className="admin-user-info">
          <span className="admin-name">{user.name}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;

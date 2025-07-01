import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import SupportChat from "../components/SupportChat";

const SupportChatPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is admin, redirect to admin dashboard
  if (user?.isAdmin) {
    return <Navigate to="/admin/support" replace />;
  }

  // Allow both authenticated users and anonymous users to access support chat
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
      }}
    >
      <SupportChat />
    </div>
  );
};

export default SupportChatPage;

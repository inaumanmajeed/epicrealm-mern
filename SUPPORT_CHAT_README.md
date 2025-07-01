# Support Chat System with Socket.io

A real-time support chat system built with Node.js, Express, Socket.io, React, and MongoDB, designed for one-on-one communication between users and administrators.

## Features

### For Users:

- **One-on-One Support**: Direct communication with support team
- **Real-time Messaging**: Instant message delivery using Socket.io
- **Chat Persistence**: All conversations are saved in the database
- **Typing Indicators**: See when admin is typing
- **Read Receipts**: Know when your messages have been read
- **Message Status**: Track message delivery and read status
- **Responsive Design**: Works on desktop and mobile devices

### For Administrators:

- **Admin Dashboard**: Centralized view of all support chats
- **Multi-chat Management**: Handle multiple user conversations simultaneously
- **Chat Assignment**: Assign chats to specific administrators
- **Status Management**: Update chat status (Open, In Progress, Resolved, Closed)
- **Priority System**: Set chat priority (Low, Medium, High, Urgent)
- **Internal Notes**: Add private notes not visible to users
- **Real-time Notifications**: Get notified of new user messages
- **Chat Statistics**: View comprehensive chat analytics
- **Filtering**: Filter chats by status and priority

## System Architecture

### Backend Structure:

```
server/
├── src/
│   ├── models/
│   │   ├── chat.model.js          # Support chat schema
│   │   ├── chatMessage.model.js   # Chat message schema
│   │   └── user.model.js          # User schema with admin flag
│   ├── controllers/
│   │   └── chat.controller.js     # Support chat controllers
│   ├── routes/
│   │   └── chat.routes.js         # Support chat API routes
│   ├── socket/
│   │   └── socket.js              # Socket.io implementation
│   └── utils/
│       └── chatUtils.js           # Chat utility functions
```

### Frontend Structure:

```
client/
├── src/
│   ├── components/
│   │   ├── SupportChat.jsx        # User chat component
│   │   ├── SupportChat.css        # User chat styles
│   │   ├── AdminSupportDashboard.jsx  # Admin dashboard
│   │   └── AdminSupportDashboard.css  # Admin dashboard styles
│   ├── context/
│   │   └── SupportChatContext.jsx # Socket.io context
│   └── apis/
│       └── useSupportChatApi.js   # API service
```

## Database Schema

### Chat Model:

```javascript
{
  user: ObjectId,           // Reference to user
  admin: ObjectId,          // Reference to assigned admin
  subject: String,          // Chat subject/topic
  priority: String,         // low, medium, high, urgent
  status: String,           // open, in-progress, resolved, closed
  lastMessage: ObjectId,    // Reference to last message
  unreadByAdmin: Number,    // Count of unread messages by admin
  unreadByUser: Number,     // Count of unread messages by user
  isActive: Boolean,        // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

### ChatMessage Model:

```javascript
{
  sender: ObjectId,         // Reference to sender (user or admin)
  chat: ObjectId,           // Reference to chat
  content: String,          // Message content
  messageType: String,      // text, image, file
  attachments: Array,       // File attachments
  isReadByAdmin: Boolean,   // Read status by admin
  isReadByUser: Boolean,    // Read status by user
  isInternalNote: Boolean,  // Internal admin note flag
  isEdited: Boolean,        // Message edit flag
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### User Endpoints:

- `POST /api/v1/chats/support` - Create or get support chat
- `GET /api/v1/chats/support` - Get user's support chat
- `GET /api/v1/chats/:chatId/messages` - Get chat messages
- `POST /api/v1/chats/:chatId/messages` - Send message
- `POST /api/v1/chats/:chatId/read` - Mark messages as read

### Admin Endpoints:

- `GET /api/v1/chats/admin/all` - Get all support chats
- `GET /api/v1/chats/admin/stats` - Get chat statistics
- `PUT /api/v1/chats/:chatId/status` - Update chat status/priority
- `POST /api/v1/chats/:chatId/assign` - Assign chat to admin

## Socket.io Events

### Client to Server:

- `join_support_chat` - Join a chat room
- `leave_support_chat` - Leave a chat room
- `send_support_message` - Send a message
- `support_typing_start` - Start typing indicator
- `support_typing_stop` - Stop typing indicator
- `mark_support_messages_read` - Mark messages as read
- `update_support_chat_status` - Update chat status (admin)
- `assign_support_chat` - Assign chat to admin

### Server to Client:

- `new_support_message` - New message received
- `new_user_message_notification` - New user message (to admins)
- `admin_reply_notification` - Admin reply (to user)
- `user_typing_support` - User typing indicator
- `support_messages_read` - Messages marked as read
- `support_chat_status_updated` - Chat status updated
- `support_chat_assigned` - Chat assigned to admin

## Setup Instructions

### Backend Setup:

1. **Install Dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start Server:**
   ```bash
   npm start
   ```

### Frontend Setup:

1. **Install Dependencies:**

   ```bash
   cd client
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:

   ```env
   REACT_APP_API_URL=http://localhost:8000/api/v1
   REACT_APP_SOCKET_URL=http://localhost:8000
   ```

3. **Start Client:**
   ```bash
   npm run dev
   ```

## Usage

### For Users:

1. **Starting a Chat:**

   - The support chat button appears in the bottom-right corner
   - Click to open the chat interface
   - Type your first message to create a support ticket

2. **Chatting:**
   - Type messages in the input field
   - Press Enter or click Send to send messages
   - See typing indicators when admin is responding
   - Messages are automatically marked as read when viewing

### For Administrators:

1. **Access Dashboard:**

   - Navigate to `/admin/support` (ensure user has `isAdmin: true`)
   - View all active support chats in the sidebar

2. **Managing Chats:**

   - Click on a chat to view conversation
   - Update status and priority using dropdowns
   - Assign chats to yourself using "Assign to Me" button
   - Send replies or internal notes

3. **Internal Notes:**
   - Check "Internal Note" checkbox before sending
   - These messages are only visible to other admins
   - Useful for case notes or collaboration

## Key Features Explained

### Chat Status Flow:

1. **Open** - New chat created by user
2. **In Progress** - Admin has been assigned and is working
3. **Resolved** - Issue has been resolved
4. **Closed** - Chat is closed (can be reopened)

### Priority Levels:

- **Low** - General inquiries
- **Medium** - Standard support requests
- **High** - Important issues needing prompt attention
- **Urgent** - Critical issues requiring immediate response

### Real-time Updates:

- All participants see messages instantly
- Typing indicators show when someone is composing
- Read receipts confirm message delivery
- Status changes are broadcast to all participants

## Security Features

- **JWT Authentication** - All Socket.io connections are authenticated
- **Permission Checks** - Users can only access their own chats
- **Admin Verification** - Admin endpoints verify user role
- **Input Validation** - All inputs are validated and sanitized
- **CORS Protection** - Configured for specific origins

## Scalability Considerations

- **Horizontal Scaling** - Socket.io can be scaled with Redis adapter
- **Database Indexing** - Proper indexes on frequently queried fields
- **Message Pagination** - Large chat histories are paginated
- **Connection Management** - Efficient socket connection handling

## Monitoring and Analytics

The system provides comprehensive statistics including:

- Total number of chats and messages
- Daily chat creation metrics
- Response time analytics
- Status distribution reports
- Admin workload distribution

This support chat system provides a complete solution for customer support with real-time communication, comprehensive admin tools, and scalable architecture.

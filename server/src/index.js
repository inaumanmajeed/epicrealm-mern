import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { createServer } from 'http';
import { connectToDatabase } from './db/index.js';
import { PORT } from './constants.js';
import { app } from './app.js';
import { initializeSocketIO } from './socket/socket.js';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Make io accessible throughout the app
app.set('io', io);

connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🟢 Server is running on port ${PORT}`);
      console.log(`🟢 Socket.IO server initialized`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });

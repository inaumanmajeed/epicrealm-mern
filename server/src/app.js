import express from 'express';
import cors from 'cors';
import { CORS_ORIGIN, LIMIT, API_ENDPOINT } from './constants.js';
import apiErrorHandler from './utils/apiErrorHandler.js';

export const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Configure CORS to handle multiple origins
const allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const msg =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: LIMIT,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: LIMIT,
  })
);

app.use(express.static('public'));

// Import routes
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';
import contactRoutes from './routes/contact.routes.js';
import blogRoutes from './routes/blog.routes.js';

// Routes Declaration
app.use(`${API_ENDPOINT}/users`, userRoutes);
app.use(`${API_ENDPOINT}/games`, gameRoutes);
app.use(`${API_ENDPOINT}/contact`, contactRoutes);
app.use(`${API_ENDPOINT}/blogs`, blogRoutes);

app.use(apiErrorHandler);

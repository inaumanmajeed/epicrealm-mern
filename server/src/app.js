import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN, LIMIT, API_ENDPOINT } from './constants.js';
import apiErrorHandler from './utils/apiErrorHandler.js';

export const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

app.use(
  cors({
    origin: CORS_ORIGIN,
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

app.use(cookieParser());

app.use(express.static('public'));

// Import routes
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';
import contactRoutes from './routes/contact.routes.js';

// Routes Declaration
app.use(`${API_ENDPOINT}/users`, userRoutes);
app.use(`${API_ENDPOINT}/games`, gameRoutes);
app.use(`${API_ENDPOINT}/contact`, contactRoutes);

app.use(apiErrorHandler);

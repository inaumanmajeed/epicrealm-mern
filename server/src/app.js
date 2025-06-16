import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN, LIMIT, API_ENDPOINT } from './constants.js';

export const app = express();

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

// Routes Declaration
app.use(`${API_ENDPOINT}/users`, userRoutes);

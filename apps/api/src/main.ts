import 'dotenv/config';
import express from 'express';
import * as path from 'path';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './config/passport';
import { authRouter } from './auth/auth.routes';
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { logger } from './services/logger';

const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Passport middleware
app.use(passport.initialize());

// Auth routes
app.use('/api/auth', authRouter);

// User profile route (protected)
app.get('/api/user/profile', ensureAuthenticated, async (req, res) => {
  try {
    const payload = req.user as { id: string };
    const userId = payload.id;
    // You can add logic here to fetch user profile from database
    res.json({ message: 'User profile', userId, user: req.user });
  } catch (error) {
    logger.log('error', 'Failed to fetch user profile', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Protected routes example
app.get('/api/protected', ensureAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/api', async (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

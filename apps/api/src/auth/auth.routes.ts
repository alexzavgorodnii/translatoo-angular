import { Router } from 'express';
import passport from 'passport';
import { login, logout, refreshToken, register } from './auth.controller';

export const authRouter = Router();

// Local authentication routes
authRouter.post('/register', register);
authRouter.post('/login', passport.authenticate('local', { session: false }), login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/logout', logout);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  authRouter.get('/google/callback', passport.authenticate('google', { session: false }), login);
}

// GitHub OAuth routes (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  authRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  authRouter.get('/github/callback', passport.authenticate('github', { session: false }), login);
}

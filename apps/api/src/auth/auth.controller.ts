import { CookieOptions, Request, Response } from 'express';
import * as AuthService from './auth.service';
import { User } from 'shared-types';
import { getClientIp, getUserAgent } from '../utils/client';
import { logger } from '../services/logger';
import { verifyRefreshToken } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const user = await AuthService.registerLocalUser({ email, password, name });
    res.status(201).json(user);
  } catch (error) {
    logger.log('error', 'Registration error', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response) {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  try {
    const user = req.user as User;

    let provider: 'local' | 'google' | 'github' = 'local';
    if (req.route?.path?.includes('google')) {
      provider = 'google';
    } else if (req.route?.path?.includes('github')) {
      provider = 'github';
    }

    if (provider === 'local') {
      await AuthService.logLoginAttempt({
        userId: user.id,
        provider,
        ipAddress,
        userAgent,
        successful: true,
      });
    }

    const tokens = await AuthService.issueTokens(user.id);
    const { accessToken, refreshToken } = tokens;
    const refreshTokenCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    } as CookieOptions;

    if (provider === 'google' || provider === 'github') {
      res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}`;

      return res.redirect(redirectUrl);
    }
    res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);

    res.json({ accessToken });
  } catch (error) {
    logger.log('error', 'Login error', error);

    if (req.route?.path?.includes('google') || req.route?.path?.includes('github')) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const redirectUrl = `${frontendUrl}/auth/callback?error=authentication_failed`;
      return res.redirect(redirectUrl);
    }

    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.sendStatus(401);

    // validate refresh token
    const user = verifyRefreshToken(token);
    if (!user) return res.sendStatus(403);

    const newAccessToken = await AuthService.verifyAndRefresh(token);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.log('error', 'Refresh token error', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    await AuthService.revokeRefreshToken(refreshToken);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.log('error', 'Logout error', error);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
}

export async function getLoginHistory(req: Request, res: Response) {
  try {
    const user = req.user as User;
    const limit = parseInt(req.query.limit as string) || 10;

    const loginHistory = await AuthService.getLoginHistoryForUser(user.id, limit);
    res.json(loginHistory);
  } catch (error) {
    logger.log('error', 'Get login history error', error);
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
}

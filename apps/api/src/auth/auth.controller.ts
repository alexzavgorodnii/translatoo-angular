import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { User } from 'shared-types';
import { getClientIp, getUserAgent } from '../utils/client';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const user = await AuthService.registerLocalUser({ email, password, name });
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
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
    res.json(tokens);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const newAccessToken = await AuthService.verifyAndRefresh(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    await AuthService.revokeRefreshToken(refreshToken);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
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
    console.error('Get login history error:', error);
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
}

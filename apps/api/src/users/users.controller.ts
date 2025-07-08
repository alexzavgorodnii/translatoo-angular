import { logger } from '../services/logger';
import { Request, Response } from 'express';
import { User } from 'shared-types';
import { getUserById } from './users.service';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(400).json({ error: 'User is required' });
    }

    const userProfile = await getUserById(req.user.id);
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userProfile);
  } catch (error) {
    logger.log('error', 'Get user profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export async function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
  }

  const token = auth.split(' ')[1];
  try {
    const { payload } = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

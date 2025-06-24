import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../auth/auth.service';
import { User } from 'shared-types';
import { getClientIp, getUserAgent } from '../utils/client';

export function createOAuthLoginLogger(provider: 'google' | 'github') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body: unknown) {
      if (body && typeof body === 'object' && body !== null && ('accessToken' in body || 'access_token' in body)) {
        const ipAddress = getClientIp(req);
        const userAgent = getUserAgent(req);
        const user = req.user as User;

        AuthService.logLoginAttempt({
          userId: user?.id,
          provider,
          ipAddress,
          userAgent,
          successful: true,
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
}

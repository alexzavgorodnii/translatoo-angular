import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as AuthService from '../auth/auth.service';
import { getClientIp, getUserAgent } from '../utils/client';
import { logger } from '../services/logger';

export function authenticateWithLogging(req: Request, res: Response, next: NextFunction) {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  AuthService.checkRateLimit(ipAddress)
    .then(isAllowed => {
      if (!isAllowed) {
        AuthService.logLoginAttempt({
          provider: 'local',
          ipAddress,
          userAgent,
          successful: false,
        });
        return res.status(429).json({ error: 'Too many failed login attempts. Please try again later.' });
      }

      passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
          logger.log('error', 'Authentication error:', err);
          await AuthService.logLoginAttempt({
            provider: 'local',
            ipAddress,
            userAgent,
            successful: false,
          });

          return res.status(500).json({ error: 'Internal server error during authentication' });
        }

        if (!user) {
          await AuthService.logLoginAttempt({
            userId: req.loginAttempt?.userId,
            provider: 'local',
            ipAddress,
            userAgent,
            successful: false,
          });

          return res.status(401).json({
            error: info?.message || 'Authentication failed',
          });
        }

        req.user = user;
        next();
      })(req, res, next);
    })
    .catch(error => {
      logger.log('error', 'Rate limit check failed:', error);
      passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
          logger.log('error', 'Authentication error:', err);

          await AuthService.logLoginAttempt({
            provider: 'local',
            ipAddress,
            userAgent,
            successful: false,
          });

          return res.status(500).json({ error: 'Internal server error during authentication' });
        }

        if (!user) {
          await AuthService.logLoginAttempt({
            userId: req.loginAttempt?.userId,
            provider: 'local',
            ipAddress,
            userAgent,
            successful: false,
          });

          return res.status(401).json({
            error: info?.message || 'Authentication failed',
          });
        }

        req.user = user;
        next();
      })(req, res, next);
    });
}

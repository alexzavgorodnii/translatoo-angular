import { Request } from 'express';

export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'Unknown';
}

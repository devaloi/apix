import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../lib/jwt';
import { UnauthorizedError } from '../../lib/errors';
import { BEARER_PREFIX } from '../../lib/constants';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = header.slice(BEARER_PREFIX.length);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

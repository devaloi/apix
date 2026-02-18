import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['x-request-id'];
  const existing = Array.isArray(header) ? header[0] : header;
  req.id = existing || crypto.randomUUID();
  next();
}

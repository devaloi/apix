import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
}

const tokenPayloadSchema = z.object({ userId: z.string() });

export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  const parsed = tokenPayloadSchema.safeParse(decoded);
  if (!parsed.success) throw new Error('Invalid token payload');
  return parsed.data;
}

import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
}

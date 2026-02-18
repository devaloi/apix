import { createApp } from '../src/app';
import { signToken } from '../src/lib/jwt';
import express from 'express';

export function buildApp() {
  return createApp();
}

export function getAuthHeader(userId: string): string {
  return `Bearer ${signToken(userId)}`;
}

/** Mock user data for tests */
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  body: 'Test body content',
  published: true,
  authorId: 'user-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  author: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
};

/** Create a minimal Express app for isolated middleware testing */
export function createTestApp() {
  const app = express();
  app.use(express.json());
  return app;
}

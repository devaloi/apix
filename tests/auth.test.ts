import request from 'supertest';
import { buildApp, getAuthHeader, mockUser } from './helpers';
import { clearRateLimitStore } from '../src/middleware/rate-limit';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  post: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
};

const mockedBcrypt = bcrypt as unknown as {
  hash: jest.Mock;
  compare: jest.Mock;
};

const app = buildApp();

beforeEach(() => {
  jest.clearAllMocks();
  clearRateLimitStore();
});

describe('Health Check', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth Module', () => {
  describe('POST /api/v1/auth/register', () => {
    it('creates a new user and returns JWT', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@example.com',
        name: 'New User',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@example.com', name: 'New User', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('new@example.com');
    });

    it('returns 409 for duplicate email', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', name: 'Duplicate', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain('already registered');
    });

    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', name: '', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns JWT for valid credentials', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('returns 401 for non-existent user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'no@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('Auth Middleware', () => {
    it('returns 401 without authorization header', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('allows access with valid token', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', getAuthHeader('user-1'));

      expect(res.status).toBe(200);
    });
  });
});

describe('User Module', () => {
  describe('GET /api/v1/users/me', () => {
    it('returns current user profile', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', getAuthHeader('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('updates user profile', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null); // no email conflict
      mockedPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });
});

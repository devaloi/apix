import request from 'supertest';
import { buildApp, getAuthHeader, mockPost } from './helpers';
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

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { prisma } from '../src/lib/prisma';

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

const app = buildApp();

beforeEach(() => {
  jest.clearAllMocks();
  clearRateLimitStore();
});

describe('Post Module', () => {
  describe('POST /api/v1/posts', () => {
    it('creates a post', async () => {
      mockedPrisma.post.create.mockResolvedValue(mockPost);

      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ title: 'Test Post', body: 'Test body content' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Post');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .send({ title: 'Test Post', body: 'Test body content' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ title: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('returns a post by id', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue(mockPost);

      const res = await request(app).get('/api/v1/posts/post-1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('post-1');
    });

    it('returns 404 for non-existent post', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/posts/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/posts/:id', () => {
    it('updates own post', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 'user-1' });
      mockedPrisma.post.update.mockResolvedValue({ ...mockPost, title: 'Updated' });

      const res = await request(app)
        .patch('/api/v1/posts/post-1')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-owner', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 'other-user' });

      const res = await request(app)
        .patch('/api/v1/posts/post-1')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent post', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/posts/nonexistent')
        .set('Authorization', getAuthHeader('user-1'))
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('deletes own post', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 'user-1' });
      mockedPrisma.post.delete.mockResolvedValue(mockPost);

      const res = await request(app)
        .delete('/api/v1/posts/post-1')
        .set('Authorization', getAuthHeader('user-1'));

      expect(res.status).toBe(204);
    });

    it('returns 403 for non-owner', async () => {
      mockedPrisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 'other-user' });

      const res = await request(app)
        .delete('/api/v1/posts/post-1')
        .set('Authorization', getAuthHeader('user-1'));

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/posts (pagination & search)', () => {
    it('returns paginated posts', async () => {
      mockedPrisma.post.findMany.mockResolvedValue([mockPost]);
      mockedPrisma.post.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/posts?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.hasMore).toBe(false);
      expect(res.body.meta.total).toBe(1);
    });

    it('handles cursor-based pagination', async () => {
      const posts = Array.from({ length: 3 }, (_, i) => ({
        ...mockPost,
        id: `post-${i}`,
        title: `Post ${i}`,
      }));
      mockedPrisma.post.findMany.mockResolvedValue(posts);
      mockedPrisma.post.count.mockResolvedValue(10);

      const res = await request(app).get('/api/v1/posts?limit=2&cursor=post-0');

      expect(res.status).toBe(200);
      expect(res.body.meta.hasMore).toBe(true);
      expect(res.body.meta.cursor).toBe('post-1');
      expect(res.body.data).toHaveLength(2);
    });

    it('filters by published status', async () => {
      mockedPrisma.post.findMany.mockResolvedValue([mockPost]);
      mockedPrisma.post.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/posts?published=true');

      expect(res.status).toBe(200);
      expect(mockedPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ published: true }),
        }),
      );
    });

    it('searches by title/body', async () => {
      mockedPrisma.post.findMany.mockResolvedValue([]);
      mockedPrisma.post.count.mockResolvedValue(0);

      const res = await request(app).get('/api/v1/posts?search=golang');

      expect(res.status).toBe(200);
      expect(mockedPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.objectContaining({ contains: 'golang' }) }),
            ]),
          }),
        }),
      );
    });

    it('returns empty results gracefully', async () => {
      mockedPrisma.post.findMany.mockResolvedValue([]);
      mockedPrisma.post.count.mockResolvedValue(0);

      const res = await request(app).get('/api/v1/posts');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.hasMore).toBe(false);
      expect(res.body.meta.cursor).toBeNull();
    });
  });
});

describe('Rate Limiting', () => {
  it('returns 429 when rate limit exceeded', async () => {
    // The auth register endpoint has limit of 10 per minute
    const requests = Array.from({ length: 11 }, () =>
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', name: 'Test', password: 'password123' }),
    );

    const results = await Promise.all(requests);
    const tooMany = results.filter((r) => r.status === 429);
    expect(tooMany.length).toBeGreaterThan(0);
  });
});

describe('Integration: Full API Flow', () => {
  it('register → login → create → list → update → delete', async () => {
    // Register
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null); // no duplicate
    mockedPrisma.user.create.mockResolvedValue({
      id: 'flow-user',
      email: 'flow@example.com',
      name: 'Flow User',
    });

    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'flow@example.com', name: 'Flow User', password: 'password123' });

    expect(registerRes.status).toBe(201);
    const token = registerRes.body.data.token;

    // Login
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'flow-user',
      email: 'flow@example.com',
      name: 'Flow User',
      passwordHash: 'hashed',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'flow@example.com', password: 'password123' });

    expect(loginRes.status).toBe(200);

    // Create Post
    const createdPost = {
      id: 'flow-post',
      title: 'Flow Post',
      body: 'Flow body',
      published: false,
      authorId: 'flow-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'flow-user', name: 'Flow User', email: 'flow@example.com' },
    };
    mockedPrisma.post.create.mockResolvedValue(createdPost);

    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Flow Post', body: 'Flow body' });

    expect(createRes.status).toBe(201);

    // List Posts
    mockedPrisma.post.findMany.mockResolvedValue([createdPost]);
    mockedPrisma.post.count.mockResolvedValue(1);

    const listRes = await request(app).get('/api/v1/posts');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    // Update Post
    mockedPrisma.post.findUnique.mockResolvedValue(createdPost);
    mockedPrisma.post.update.mockResolvedValue({ ...createdPost, title: 'Updated Flow' });

    const updateRes = await request(app)
      .patch('/api/v1/posts/flow-post')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Flow' });

    expect(updateRes.status).toBe(200);

    // Delete Post
    mockedPrisma.post.findUnique.mockResolvedValue(createdPost);
    mockedPrisma.post.delete.mockResolvedValue(createdPost);

    const deleteRes = await request(app)
      .delete('/api/v1/posts/flow-post')
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(204);
  });
});

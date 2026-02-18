import express from 'express';
import { requestId } from './middleware/request-id';
import { errorHandler } from './middleware/error-handler';
import { rateLimit } from './middleware/rate-limit';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { postRoutes } from './modules/post/post.routes';
import { config } from './config';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(express.json());
  app.use(requestId);
  app.use(rateLimit(config.RATE_LIMIT_WINDOW_MS, config.RATE_LIMIT_MAX_REQUESTS));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/posts', postRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

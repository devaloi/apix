import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.schemas';
import { rateLimit } from '../../middleware/rate-limit';
import { AUTH_RATE_LIMITS } from '../../lib/constants';

const router = Router();

router.post(
  '/register',
  rateLimit(AUTH_RATE_LIMITS.register.windowMs, AUTH_RATE_LIMITS.register.max),
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  '/login',
  rateLimit(AUTH_RATE_LIMITS.login.windowMs, AUTH_RATE_LIMITS.login.max),
  validate({ body: loginSchema }),
  authController.login,
);

export { router as authRoutes };

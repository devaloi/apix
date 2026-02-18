import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.schemas';
import { rateLimit } from '../../middleware/rate-limit';

const router = Router();

router.post(
  '/register',
  rateLimit(60000, 10),
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  '/login',
  rateLimit(60000, 20),
  validate({ body: loginSchema }),
  authController.login,
);

export { router as authRoutes };

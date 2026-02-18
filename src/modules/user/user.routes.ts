import { Router } from 'express';
import * as userController from './user.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './user.schemas';

const router = Router();

router.use(authMiddleware);

router.get('/me', userController.getProfile);
router.patch('/me', validate({ body: updateUserSchema }), userController.updateProfile);

export { router as userRoutes };

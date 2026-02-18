import { Router } from 'express';
import * as postController from './post.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { createPostSchema, updatePostSchema, postIdParamSchema } from './post.schemas';

const router = Router();

router.get(
  '/',
  postController.list,
);

router.get(
  '/:id',
  validate({ params: postIdParamSchema }),
  postController.getById,
);

router.post(
  '/',
  authMiddleware,
  validate({ body: createPostSchema }),
  postController.create,
);

router.patch(
  '/:id',
  authMiddleware,
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  postController.update,
);

router.delete(
  '/:id',
  authMiddleware,
  validate({ params: postIdParamSchema }),
  postController.remove,
);

export { router as postRoutes };

import { z } from 'zod';
import { MAX_TITLE_LENGTH, MAX_PAGINATION_LIMIT, DEFAULT_PAGINATION_LIMIT } from '../../lib/constants';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(MAX_TITLE_LENGTH),
  body: z.string().min(1, 'Body is required'),
  published: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
  body: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export const listPostsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGINATION_LIMIT).default(DEFAULT_PAGINATION_LIMIT),
  search: z.string().optional(),
  published: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const postIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

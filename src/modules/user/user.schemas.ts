import { z } from 'zod';
import { MAX_NAME_LENGTH } from '../../lib/constants';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH).optional(),
  email: z.string().email().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

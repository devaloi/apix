import { Prisma } from '@prisma/client';

export const BEARER_PREFIX = 'Bearer ';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 100;
export const MAX_TITLE_LENGTH = 200;

export const MAX_PAGINATION_LIMIT = 100;
export const DEFAULT_PAGINATION_LIMIT = 20;

export const AUTH_RATE_LIMITS = {
  register: { windowMs: 60_000, max: 10 },
  login: { windowMs: 60_000, max: 20 },
} as const;

/** Base user fields returned in API responses (without timestamps). */
export const USER_SELECT_BASE = {
  id: true,
  email: true,
  name: true,
} as const satisfies Prisma.UserSelect;

/** User fields with timestamps, used for profile endpoints. */
export const USER_SELECT_PROFILE = {
  ...USER_SELECT_BASE,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

import { prisma } from '../../lib/prisma';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { USER_SELECT_PROFILE } from '../../lib/constants';
import { UpdateUserInput } from './user.schemas';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT_PROFILE,
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

export async function updateProfile(userId: string, input: UpdateUserInput) {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== userId) {
      throw new ConflictError('Email already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: USER_SELECT_PROFILE,
  });

  return user;
}

import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../lib/password';
import { signToken } from '../../lib/jwt';
import { ConflictError, UnauthorizedError } from '../../lib/errors';
import { RegisterInput, LoginInput } from './auth.schemas';

export async function register(input: RegisterInput): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  const token = signToken(user.id);
  return { token, user };
}

export async function login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken(user.id);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

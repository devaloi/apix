import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { CreatePostInput, UpdatePostInput, ListPostsQuery } from './post.schemas';

const postSelect = {
  id: true,
  title: true,
  body: true,
  published: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PostSelect;

export async function create(authorId: string, input: CreatePostInput) {
  return prisma.post.create({
    data: { ...input, authorId },
    select: postSelect,
  });
}

export async function getById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    select: postSelect,
  });

  if (!post) {
    throw new NotFoundError('Post');
  }

  return post;
}

export async function update(id: string, userId: string, input: UpdatePostInput) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new NotFoundError('Post');
  }
  if (post.authorId !== userId) {
    throw new ForbiddenError('You can only update your own posts');
  }

  return prisma.post.update({
    where: { id },
    data: input,
    select: postSelect,
  });
}

export async function remove(id: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new NotFoundError('Post');
  }
  if (post.authorId !== userId) {
    throw new ForbiddenError('You can only delete your own posts');
  }

  await prisma.post.delete({ where: { id } });
}

export async function list(query: ListPostsQuery) {
  const { cursor, limit, search, published } = query;

  const where: Prisma.PostWhereInput = {};

  if (published !== undefined) {
    where.published = published;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    }),
    prisma.post.count({ where }),
  ]);

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return {
    data,
    meta: {
      cursor: nextCursor,
      hasMore,
      total,
    },
  };
}

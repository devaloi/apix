import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash,
    },
  });

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Getting Started with TypeScript',
        body: 'TypeScript adds static typing to JavaScript, enabling better tooling and fewer runtime errors.',
        published: true,
        authorId: alice.id,
      },
      {
        title: 'Building REST APIs with Express 5',
        body: 'Express 5 brings native async error handling and improved routing capabilities.',
        published: true,
        authorId: alice.id,
      },
      {
        title: 'Prisma ORM Deep Dive',
        body: 'Prisma provides a type-safe database client that integrates beautifully with TypeScript.',
        published: false,
        authorId: bob.id,
      },
      {
        title: 'Docker for Node.js Apps',
        body: 'Containerizing your Node.js application with Docker ensures consistent environments.',
        published: true,
        authorId: bob.id,
      },
    ],
  });

  console.log('Seed data created: 2 users, 4 posts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

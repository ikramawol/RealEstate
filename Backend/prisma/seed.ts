import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = '12345';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await prisma.admin.upsert({
    where: {
      username: 'admin',
    },
    create: {
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
    },
    update: {
      email: 'admin@gmail.com',
      username: 'admin',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

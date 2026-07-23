import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'student@university.edu',
      passwordHash,
      fullName: 'Student User',
      role: UserRole.STUDENT,
      universityId: 'STD001',
      isActive: true,
    },
    {
      email: 'admin@university.edu',
      passwordHash,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      universityId: 'ADM001',
      isActive: true,
    },
    {
      email: 'validator1@university.edu',
      passwordHash,
      fullName: 'Validator 1',
      role: UserRole.VALIDATOR,
      universityId: 'VAL001',
      isActive: true,
    },
    {
      email: 'validator2@university.edu',
      passwordHash,
      fullName: 'Validator 2',
      role: UserRole.VALIDATOR,
      universityId: 'VAL002',
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role,
        universityId: user.universityId,
        isActive: user.isActive,
      },
      create: user,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import {
  PrismaClient,
  ProgramStudi,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_DEPARTMENT = 'Teknik Informatika dan Komputer';

const students = [
  {
    email: 'student@university.edu',
    fullName: 'Alex Student',
    universityId: 'STD001',
    prodi: ProgramStudi.PTIK,
    dosenPA: 'Drs. Marsud Hamid, M.Kes.',
    dosenPANip: '196501011990031001',
  },
  {
    email: 'aulia@university.edu',
    fullName: 'M. AULIA ARIEF',
    universityId: '1729041022',
    prodi: ProgramStudi.PTIK,
    dosenPA: 'Dr. Sanatang, S.Pd., M.T.',
    dosenPANip: '197203121999031002',
  },
  {
    email: 'fadilah@university.edu',
    fullName: 'MUHAMMAD FADILAH',
    universityId: '1729041023',
    prodi: ProgramStudi.PTIK,
    dosenPA: 'Drs. Marsud Hamid, M.Kes.',
    dosenPANip: '196501011990031001',
  },
  {
    email: 'rina.sari@university.edu',
    fullName: 'RINA SARI',
    universityId: '1729041024',
    prodi: ProgramStudi.PTIK,
    dosenPA: 'Dr. Sanatang, S.Pd., M.T.',
    dosenPANip: '197203121999031002',
  },
  {
    email: 'andi.pratama@university.edu',
    fullName: 'ANDI PRATAMA',
    universityId: '1729041025',
    prodi: ProgramStudi.PTIK,
    dosenPA: 'Drs. Marsud Hamid, M.Kes.',
    dosenPANip: '196501011990031001',
  },
  {
    email: 'dewi.kartika@university.edu',
    fullName: 'DEWI KARTIKA SARI',
    universityId: '1729041026',
    prodi: ProgramStudi.TEKOM,
    dosenPA: 'Dr. Sanatang, S.Pd., M.T.',
    dosenPANip: '197203121999031002',
  },
  {
    email: 'budi.santoso@university.edu',
    fullName: 'BUDI SANTOSO',
    universityId: '1729041027',
    prodi: ProgramStudi.TEKOM,
    dosenPA: 'Drs. Marsud Hamid, M.Kes.',
    dosenPANip: '196501011990031001',
  },
];

const staff = [
  {
    email: 'admin@university.edu',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
    universityId: 'ADM001',
  },
  {
    email: 'validator1@university.edu',
    fullName: 'Drs. Marsud Hamid, M.Kes.',
    role: UserRole.VALIDATOR,
    universityId: 'VAL001',
  },
  {
    email: 'validator2@university.edu',
    fullName: 'Dr. Sanatang, S.Pd., M.T.',
    role: UserRole.VALIDATOR,
    universityId: 'VAL002',
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  for (const student of students) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {
        passwordHash,
        fullName: student.fullName,
        role: UserRole.STUDENT,
        universityId: student.universityId,
        department: DEFAULT_DEPARTMENT,
        prodi: student.prodi,
        dosenPA: student.dosenPA,
        dosenPANip: student.dosenPANip,
        status: UserStatus.AKTIF,
      },
      create: {
        ...student,
        passwordHash,
        role: UserRole.STUDENT,
        department: DEFAULT_DEPARTMENT,
        status: UserStatus.AKTIF,
      },
    });
  }

  for (const user of staff) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        ...user,
        passwordHash,
        department: DEFAULT_DEPARTMENT,
        status: UserStatus.AKTIF,
      },
      create: {
        ...user,
        passwordHash,
        department: DEFAULT_DEPARTMENT,
        status: UserStatus.AKTIF,
      },
    });
  }

  console.log('Users seeded with required academic advisor data.');
  console.log('No thesis submissions were seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

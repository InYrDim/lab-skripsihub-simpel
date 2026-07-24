import { PrismaClient, UserRole, SubmissionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const student1 = await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      passwordHash,
      fullName: 'Alex Student',
      role: UserRole.STUDENT,
      universityId: 'STD001',
      isActive: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'aulia@university.edu' },
    update: {},
    create: {
      email: 'aulia@university.edu',
      passwordHash,
      fullName: 'M. AULIA ARIEF',
      role: UserRole.STUDENT,
      universityId: '1729041022',
      isActive: true,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'fadilah@university.edu' },
    update: {},
    create: {
      email: 'fadilah@university.edu',
      passwordHash,
      fullName: 'MUHAMMAD FADILAH',
      role: UserRole.STUDENT,
      universityId: '1729041023',
      isActive: true,
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: 'rina.sari@university.edu' },
    update: {},
    create: {
      email: 'rina.sari@university.edu',
      passwordHash,
      fullName: 'RINA SARI',
      role: UserRole.STUDENT,
      universityId: '1729041024',
      isActive: true,
    },
  });

  const student5 = await prisma.user.upsert({
    where: { email: 'andi.pratama@university.edu' },
    update: {},
    create: {
      email: 'andi.pratama@university.edu',
      passwordHash,
      fullName: 'ANDI PRATAMA',
      role: UserRole.STUDENT,
      universityId: '1729041025',
      isActive: true,
    },
  });

  const student6 = await prisma.user.upsert({
    where: { email: 'dewi.kartika@university.edu' },
    update: {},
    create: {
      email: 'dewi.kartika@university.edu',
      passwordHash,
      fullName: 'DEWI KARTIKA SARI',
      role: UserRole.STUDENT,
      universityId: '1729041026',
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      passwordHash,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      universityId: 'ADM001',
      isActive: true,
    },
  });

  const validator1 = await prisma.user.upsert({
    where: { email: 'validator1@university.edu' },
    update: {},
    create: {
      email: 'validator1@university.edu',
      passwordHash,
      fullName: 'Drs. Marsud Hamid, M.Kes.',
      role: UserRole.VALIDATOR,
      universityId: 'VAL001',
      isActive: true,
    },
  });

  const validator2 = await prisma.user.upsert({
    where: { email: 'validator2@university.edu' },
    update: {},
    create: {
      email: 'validator2@university.edu',
      passwordHash,
      fullName: 'Dr. Sanatang, S.Pd., M.T.',
      role: UserRole.VALIDATOR,
      universityId: 'VAL002',
      isActive: true,
    },
  });

  console.log('Users seeded.');

  // --- Submissions ---
  // sub1: student1 - APPROVED
  const sub1 = await prisma.submission.upsert({
    where: { id: 'seed_sub_001' },
    update: {},
    create: {
      id: 'seed_sub_001',
      studentId: student1.id,
      status: SubmissionStatus.APPROVED,
      submittedAt: new Date('2024-02-15T09:00:00Z'),
    },
  });

  await prisma.submissionTitle.createMany({
    data: [
      {
        submissionId: sub1.id,
        title: 'Pengembangan Sistem Informasi Beasiswa Berbasis Web Pada Jurusan Teknik Informatika dan Komputer FT UNM',
        description: '',
        sequenceNumber: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Assignment + feedback for sub1 (approved)
  const assign1 = await prisma.assignment.upsert({
    where: { id: 'seed_assign_001' },
    update: {},
    create: {
      id: 'seed_assign_001',
      submissionId: sub1.id,
      validatorId: validator1.id,
      status: 'COMPLETED',
      assignedAt: new Date('2024-02-16T08:00:00Z'),
      completedAt: new Date('2024-02-28T10:00:00Z'),
    },
  });

  const sub1Titles = await prisma.submissionTitle.findMany({
    where: { submissionId: sub1.id },
  });

  await prisma.validatorFeedback.upsert({
    where: { assignmentId: assign1.id },
    update: {},
    create: {
      assignmentId: assign1.id,
      submissionId: sub1.id,
      decision: 'APPROVED',
      approvedTitleId: sub1Titles[0]?.id,
    },
  });

  await prisma.approvalLetter.upsert({
    where: { submissionId: sub1.id },
    update: {},
    create: {
      submissionId: sub1.id,
      studentId: student1.id,
      approvedTitle: 'Pengembangan Sistem Informasi Beasiswa Berbasis Web Pada Jurusan Teknik Informatika dan Komputer FT UNM',
      pdfUrl: '/api/documents/letter/seed_sub_001',
      pdfS3Key: 'letters/seed_sub_001.pdf',
      generatedAt: new Date('2024-02-28T10:05:00Z'),
    },
  });

  // sub2: student2 - PENDING_ADMIN_REVIEW
  const sub2 = await prisma.submission.upsert({
    where: { id: 'seed_sub_002' },
    update: {},
    create: {
      id: 'seed_sub_002',
      studentId: student2.id,
      status: SubmissionStatus.PENDING_ADMIN_REVIEW,
      submittedAt: new Date('2024-04-01T11:30:00Z'),
    },
  });

  await prisma.submissionTitle.createMany({
    data: [
      {
        submissionId: sub2.id,
        title: 'Implementasi Zero-Knowledge Proof untuk Autentikasi Identitas Digital',
        description: 'Rancang bangun sistem autentikasi identitas digital menggunakan protokol zero-knowledge proof yang aman dan privasi-terjaga.',
        sequenceNumber: 1,
      },
      {
        submissionId: sub2.id,
        title: 'Analisis Keamanan Smart Contract pada Jaringan Blockchain Ethereum',
        description: 'Evaluasi kerentanan keamanan smart contract menggunakan static analysis dan fuzzing technique.',
        sequenceNumber: 2,
      },
    ],
    skipDuplicates: true,
  });

  // sub3: student3 - PENDING_VALIDATOR_REVIEW
  const sub3 = await prisma.submission.upsert({
    where: { id: 'seed_sub_003' },
    update: {},
    create: {
      id: 'seed_sub_003',
      studentId: student3.id,
      status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
      submittedAt: new Date('2024-03-20T08:00:00Z'),
    },
  });

  await prisma.submissionTitle.createMany({
    data: [
      {
        submissionId: sub3.id,
        title: 'Pengembangan Dashboard Analitik Penjualan Berbasis Web untuk UMKM',
        description: 'Perancangan dan implementasi dashboard analitik berbasis web yang membantu pelaku UMKM dalam memantau data penjualan secara real-time.',
        sequenceNumber: 1,
      },
      {
        submissionId: sub3.id,
        title: 'Sistem Informasi Manajemen Inventaris Berbasis Cloud Computing',
        description: 'Implementasi sistem manajemen inventaris berbasis cloud untuk optimasi pengelolaan stok barang.',
        sequenceNumber: 2,
      },
      {
        submissionId: sub3.id,
        title: 'Optimasi Supply Chain Menggunakan Algoritma Genetic',
        description: 'Penerapan algoritma genetic untuk optimasi rantai pasokan pada industri manufaktur.',
        sequenceNumber: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.assignment.upsert({
    where: { id: 'seed_assign_003' },
    update: {},
    create: {
      id: 'seed_assign_003',
      submissionId: sub3.id,
      validatorId: validator2.id,
      status: 'PENDING',
      assignedAt: new Date('2024-03-21T09:30:00Z'),
    },
  });

  // sub4: student4 - REJECTED
  const sub4 = await prisma.submission.upsert({
    where: { id: 'seed_sub_004' },
    update: {},
    create: {
      id: 'seed_sub_004',
      studentId: student4.id,
      status: SubmissionStatus.REJECTED,
      submittedAt: new Date('2024-03-05T14:00:00Z'),
    },
  });

  await prisma.submissionTitle.createMany({
    data: [
      {
        submissionId: sub4.id,
        title: 'Pembuatan Website Toko Online Sederhana Menggunakan WordPress',
        description: 'Membangun website toko online menggunakan CMS WordPress dengan plugin WooCommerce.',
        sequenceNumber: 1,
      },
    ],
    skipDuplicates: true,
  });

  const assign4 = await prisma.assignment.upsert({
    where: { id: 'seed_assign_004' },
    update: {},
    create: {
      id: 'seed_assign_004',
      submissionId: sub4.id,
      validatorId: validator2.id,
      status: 'COMPLETED',
      assignedAt: new Date('2024-03-06T09:00:00Z'),
      completedAt: new Date('2024-03-08T16:00:00Z'),
    },
  });

  await prisma.validatorFeedback.upsert({
    where: { assignmentId: assign4.id },
    update: {},
    create: {
      assignmentId: assign4.id,
      submissionId: sub4.id,
      decision: 'REJECTED',
      feedbackText: 'Topik ini terlalu bersifat praktis dan tidak memiliki kontribusi akademik yang memadai untuk skripsi. Silakan pilih topik yang melibatkan riset atau pengembangan metode/algoritma baru.',
    },
  });

  // sub5: student5 - PENDING_VALIDATOR_REVIEW
  const sub5 = await prisma.submission.upsert({
    where: { id: 'seed_sub_005' },
    update: {},
    create: {
      id: 'seed_sub_005',
      studentId: student5.id,
      status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
      submittedAt: new Date('2024-03-25T10:00:00Z'),
    },
  });

  await prisma.submissionTitle.createMany({
    data: [
      {
        submissionId: sub5.id,
        title: 'Deteksi Deepfake Video Menggunakan Convolutional Neural Network',
        description: 'Pengembangan model CNN untuk mendeteksi manipulasi video deepfake dengan akurasi tinggi.',
        sequenceNumber: 1,
      },
      {
        submissionId: sub5.id,
        title: 'Sistem Pengenalan Wajah dengan ArcFace untuk Keamanan Gedung Kampus',
        description: 'Implementasi sistem pengenalan wajah menggunakan metode ArcFace untuk akses keamanan otomatis.',
        sequenceNumber: 2,
      },
      {
        submissionId: sub5.id,
        title: 'Klasifikasi Emosi Berdasarkan Ekspresi Wajah Menggunakan Transfer Learning',
        description: 'Penerapan transfer learning pada model pre-trained untuk klasifikasi emosi manusia dari citra wajah.',
        sequenceNumber: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.assignment.upsert({
    where: { id: 'seed_assign_005' },
    update: {},
    create: {
      id: 'seed_assign_005',
      submissionId: sub5.id,
      validatorId: validator1.id,
      status: 'PENDING',
      assignedAt: new Date('2024-03-26T08:30:00Z'),
    },
  });

  console.log('Submissions seeded.');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findFirst();
  console.log('Before:', user.photoUrl);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { photoUrl: 'http://test.com/photo.jpg' }
  });
  console.log('After:', updated.photoUrl);
}
test().catch(console.error).finally(() => prisma.$disconnect());

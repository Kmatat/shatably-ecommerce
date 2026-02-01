import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPhone = '01000000000';
  const adminPassword = 'Admin@123'; // Default password - should be changed after first login

  console.log('🔐 Setting admin password...');

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Update admin user with password
  const admin = await prisma.user.update({
    where: { phone: adminPhone },
    data: {
      password: hashedPassword,
      passwordSetAt: new Date(),
    },
  });

  console.log(`✅ Admin password set for: ${admin.phone}`);
  console.log(`📱 Phone: ${adminPhone}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('');
  console.log('⚠️  Please change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

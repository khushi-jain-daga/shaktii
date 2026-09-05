import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Refusing to seed production without ALLOW_PRODUCTION_SEED=true');
  }

  const password = process.env.SEED_PASSWORD || 'ShaktiiDemo2026!';
  const passwordHash = await bcrypt.hash(password, 12);

  const users = [
    { email: 'admin@shaktii.local', name: 'SHAKTII Admin', role: 'ADMIN' as const },
    { email: 'analyst@shaktii.local', name: 'Security Analyst', role: 'SECURITY_ANALYST' as const },
    { email: 'user@shaktii.local', name: 'Demo User', role: 'USER' as const },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: { ...user, passwordHash },
    });
  }

  if (await prisma.securityEvent.count() === 0) {
    await prisma.securityEvent.createMany({
      data: [
        { type: 'INTEGRITY_MONITOR', severity: 'LOW', description: 'File integrity monitoring initialized', status: 'RESOLVED' },
        { type: 'AUTH_MONITOR', severity: 'MEDIUM', description: 'Demo authentication anomaly for analyst workflow', status: 'OPEN' },
      ],
    });
  }

  console.log('SHAKTII development seed complete.');
  console.log(`Demo users created. Password is controlled by SEED_PASSWORD (current fallback: ${password}).`);
}

main().finally(async () => prisma.$disconnect());

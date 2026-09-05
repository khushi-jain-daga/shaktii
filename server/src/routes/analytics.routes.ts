import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get('/overview', async (req, res, next) => {
  try {
    const ownerId = req.user!.sub;
    const [files, verifiedFiles, tamperedFiles, blockchainRecords, audits, securityEvents] = await Promise.all([
      prisma.secureFile.count({ where: { ownerId } }),
      prisma.secureFile.count({ where: { ownerId, status: 'VERIFIED' } }),
      prisma.secureFile.count({ where: { ownerId, status: 'TAMPERED' } }),
      prisma.blockchainRecord.count({ where: { ownerId } }),
      prisma.auditLog.count({ where: { userId: ownerId } }),
      prisma.securityEvent.count(),
    ]);

    const recentAudits = await prisma.auditLog.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { action: true, status: true, createdAt: true },
    });

    const dailyMap = new Map<string, { day: string; activity: number; success: number; failed: number }>();
    for (const audit of recentAudits) {
      const day = audit.createdAt.toISOString().slice(0, 10);
      const row = dailyMap.get(day) ?? { day, activity: 0, success: 0, failed: 0 };
      row.activity += 1;
      if (audit.status === 'SUCCESS') row.success += 1;
      else row.failed += 1;
      dailyMap.set(day, row);
    }

    const timeline = [...dailyMap.values()].sort((a, b) => a.day.localeCompare(b.day));

    res.json({
      success: true,
      data: {
        summary: { files, verifiedFiles, tamperedFiles, blockchainRecords, audits, securityEvents },
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 250,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

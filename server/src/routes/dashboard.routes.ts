import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get('/', async (req, res, next) => {
  try {
    const ownerId = req.user!.sub;
    const [protectedFiles, verifiedFiles, failedVerifications, activeUsers, securityAlerts, criticalAlerts, blockchainRecords, recentActivity] = await Promise.all([
      prisma.secureFile.count({ where: { ownerId } }),
      prisma.secureFile.count({ where: { ownerId, status: 'VERIFIED' } }),
      prisma.fileVerification.count({ where: { file: { ownerId }, valid: false } }),
      prisma.user.count(),
      prisma.securityEvent.count({ where: { status: 'OPEN' } }),
      prisma.securityEvent.count({ where: { status: 'OPEN', severity: 'CRITICAL' } }),
      prisma.blockchainRecord.count({ where: { ownerId } }),
      prisma.auditLog.findMany({
        where: { userId: ownerId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, action: true, resource: true, status: true, createdAt: true },
      }),
    ]);

    res.json({
      success: true,
      data: { protectedFiles, verifiedFiles, failedVerifications, activeUsers, securityAlerts, criticalAlerts, blockchainRecords, recentActivity },
    });
  } catch (error) {
    next(error);
  }
});

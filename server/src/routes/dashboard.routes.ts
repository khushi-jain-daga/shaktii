import { Router } from 'express';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res) => {
  res.json({
    success: true,
    data: {
      protectedFiles: 0,
      verifiedFiles: 0,
      failedVerifications: 0,
      activeUsers: 0,
      securityAlerts: 0,
      criticalAlerts: 0,
      blockchainRecords: 0,
      recentActivity: [],
    },
  });
});

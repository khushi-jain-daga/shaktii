import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.get('/summary', async (req, res, next) => {
  try {
    const ownerId = req.user!.sub;
    const [files, verified, tampered, blockchain, security, audits] = await Promise.all([
      prisma.secureFile.count({ where: { ownerId } }),
      prisma.secureFile.count({ where: { ownerId, status: 'VERIFIED' } }),
      prisma.secureFile.count({ where: { ownerId, status: 'TAMPERED' } }),
      prisma.blockchainRecord.count({ where: { ownerId } }),
      prisma.securityEvent.count(),
      prisma.auditLog.count({ where: { userId: ownerId } }),
    ]);
    res.json({ success: true, data: { generatedAt: new Date().toISOString(), files, verified, tampered, blockchain, security, audits } });
  } catch (error) { next(error); }
});

reportsRouter.get('/export.csv', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: 'desc' }, take: 1000 });
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = ['timestamp,action,resource,status', ...logs.map((row) => [row.createdAt.toISOString(), row.action, row.resource ?? '', row.status].map(escape).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="shaktii-audit-report.csv"');
    res.send(csv);
  } catch (error) { next(error); }
});

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const securityRouter = Router();
securityRouter.use(requireAuth);

const eventSchema = z.object({
  type: z.string().min(2).max(120),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(3).max(1000),
  resource: z.string().max(200).optional(),
  ipAddress: z.string().max(100).optional(),
});

securityRouter.get('/overview', async (_req, res, next) => {
  try {
    const [total, open, critical, high] = await Promise.all([
      prisma.securityEvent.count(),
      prisma.securityEvent.count({ where: { status: 'OPEN' } }),
      prisma.securityEvent.count({ where: { severity: 'CRITICAL', status: 'OPEN' } }),
      prisma.securityEvent.count({ where: { severity: 'HIGH', status: 'OPEN' } }),
    ]);
    res.json({ success: true, data: { total, open, critical, high } });
  } catch (error) { next(error); }
});

securityRouter.get('/events', async (req, res, next) => {
  try {
    const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
    const events = await prisma.securityEvent.findMany({
      where: severity && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity) ? { severity: severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } : undefined,
      orderBy: { createdAt: 'desc' }, take: 200,
    });
    res.json({ success: true, data: events });
  } catch (error) { next(error); }
});

securityRouter.post('/events', requireRole('ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const event = await prisma.securityEvent.create({ data: eventSchema.parse(req.body) });
    res.status(201).json({ success: true, data: event });
  } catch (error) { next(error); }
});

securityRouter.patch('/events/:id/resolve', requireRole('ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const event = await prisma.securityEvent.update({ where: { id: req.params.id }, data: { status: 'RESOLVED' } });
    await prisma.auditLog.create({ data: { userId: req.user!.sub, action: 'SECURITY_EVENT_RESOLVE', resource: event.id, status: 'SUCCESS' } });
    res.json({ success: true, data: event });
  } catch (error) { next(error); }
});

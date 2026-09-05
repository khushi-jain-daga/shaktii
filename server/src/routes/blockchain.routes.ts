import { createHash, randomUUID } from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const blockchainRouter = Router();
blockchainRouter.use(requireAuth);

blockchainRouter.get('/', async (req, res, next) => {
  try {
    const records = await prisma.blockchainRecord.findMany({
      where: { ownerId: req.user!.sub },
      include: { file: { select: { originalName: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
});

blockchainRouter.post('/register/:fileId', async (req, res, next) => {
  try {
    const file = await prisma.secureFile.findFirst({
      where: { id: req.params.fileId, ownerId: req.user!.sub },
    });
    if (!file) return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'File not found' });

    const existing = await prisma.blockchainRecord.findFirst({ where: { fileId: file.id, ownerId: req.user!.sub } });
    if (existing) return res.json({ success: true, data: existing });

    const transactionId = `0x${createHash('sha256').update(`${file.sha256}:${randomUUID()}`).digest('hex')}`;
    const record = await prisma.blockchainRecord.create({
      data: {
        transactionId,
        fileHash: file.sha256,
        fileId: file.id,
        ownerId: req.user!.sub,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: 'BLOCKCHAIN_REGISTER',
        resource: file.id,
        status: 'SUCCESS',
        metadata: { transactionId },
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

blockchainRouter.post('/verify/:id', async (req, res, next) => {
  try {
    const record = await prisma.blockchainRecord.findFirst({
      where: { id: req.params.id, ownerId: req.user!.sub },
      include: { file: true },
    });
    if (!record) return res.status(404).json({ success: false, code: 'RECORD_NOT_FOUND', message: 'Blockchain record not found' });

    const verified = record.file.sha256 === record.fileHash;
    const updated = await prisma.blockchainRecord.update({
      where: { id: record.id },
      data: { verified },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: 'BLOCKCHAIN_VERIFY',
        resource: record.id,
        status: verified ? 'SUCCESS' : 'FAILED',
      },
    });

    res.json({ success: true, data: { ...updated, verified } });
  } catch (error) {
    next(error);
  }
});

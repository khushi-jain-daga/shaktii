import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptFile, ensureUploadDirs, sha256File } from '../services/file-security.service.js';

export const filesRouter = Router();

await ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve('server/storage/uploads')),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).slice(0, 10).replace(/[^.a-zA-Z0-9]/g, '');
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

filesRouter.use(requireAuth);

filesRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, code: 'FILE_REQUIRED', message: 'Choose a file to upload' });
    const hash = await sha256File(req.file.path);
    const record = await prisma.secureFile.create({
      data: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype || 'application/octet-stream',
        size: req.file.size,
        path: req.file.path,
        sha256: hash,
        ownerId: req.user!.sub,
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: 'FILE_UPLOAD', resource: record.id, status: 'SUCCESS' },
    });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

filesRouter.get('/', async (req, res, next) => {
  try {
    const files = await prisma.secureFile.findMany({
      where: req.user!.role === 'ADMIN' ? {} : { ownerId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, originalName: true, mimeType: true, size: true, sha256: true,
        status: true, createdAt: true, updatedAt: true, ownerId: true,
      },
    });
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

filesRouter.get('/:id', async (req, res, next) => {
  try {
    const file = await prisma.secureFile.findUnique({
      where: { id: req.params.id },
      include: { verifications: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!file || (req.user!.role !== 'ADMIN' && file.ownerId !== req.user!.sub)) {
      return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'File not found' });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
});

filesRouter.post('/:id/encrypt', async (req, res, next) => {
  try {
    const file = await prisma.secureFile.findUnique({ where: { id: req.params.id } });
    if (!file || (req.user!.role !== 'ADMIN' && file.ownerId !== req.user!.sub)) {
      return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'File not found' });
    }
    const encryptedPath = path.resolve('server/storage/encrypted', `${file.storedName}.enc`);
    const cryptoMeta = await encryptFile(file.path, encryptedPath);
    const updated = await prisma.secureFile.update({
      where: { id: file.id },
      data: { encryptedPath, iv: cryptoMeta.iv, authTag: cryptoMeta.authTag, status: 'ENCRYPTED' },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: 'FILE_ENCRYPT', resource: file.id, status: 'SUCCESS' },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

filesRouter.post('/:id/verify', async (req, res, next) => {
  try {
    const file = await prisma.secureFile.findUnique({ where: { id: req.params.id } });
    if (!file || (req.user!.role !== 'ADMIN' && file.ownerId !== req.user!.sub)) {
      return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'File not found' });
    }
    const currentHash = await sha256File(file.path);
    const valid = currentHash === file.sha256;
    await prisma.fileVerification.create({ data: { fileId: file.id, hash: currentHash, valid } });
    await prisma.secureFile.update({ where: { id: file.id }, data: { status: valid ? 'VERIFIED' : 'TAMPERED' } });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: 'FILE_VERIFY', resource: file.id, status: valid ? 'SUCCESS' : 'FAILED', metadata: { currentHash } },
    });
    res.json({ success: true, data: { valid, storedHash: file.sha256, currentHash } });
  } catch (error) {
    next(error);
  }
});

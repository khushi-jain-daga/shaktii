import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = credentialsSchema.extend({ name: z.string().min(2).max(80) });
const refreshSchema = z.object({ refreshToken: z.string().min(20) });

function signAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30m' });
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function issueRefreshToken(userId: string) {
  const token = randomBytes(48).toString('base64url');
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 14);
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  await prisma.refreshToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  return token;
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ success: false, code: 'EMAIL_EXISTS', message: 'Email already registered' });
    const user = await prisma.user.create({ data: { name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12) }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    res.status(201).json({ success: true, data: { user, token: signAccessToken(user), refreshToken: await issueRefreshToken(user.id) } });
  } catch (error) { next(error); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = credentialsSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN', status: 'SUCCESS' } });
    res.json({ success: true, data: { token: signAccessToken(user), refreshToken: await issueRefreshToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
  } catch (error) { next(error); }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: true } });
    if (!record || record.revokedAt || record.expiresAt <= new Date()) return res.status(401).json({ success: false, code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' });
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const nextRefreshToken = await issueRefreshToken(record.userId);
    res.json({ success: true, data: { token: signAccessToken(record.user), refreshToken: nextRefreshToken } });
  } catch (error) { next(error); }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (parsed.success) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(parsed.data.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    res.json({ success: true, data: { loggedOut: true } });
  } catch (error) { next(error); }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

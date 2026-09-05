import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().min(2).max(80),
});

function signAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '30m' },
  );
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) return res.status(409).json({ success: false, code: 'EMAIL_EXISTS', message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email.toLowerCase(), passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = signAccessToken(user);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = credentialsSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN', status: 'SUCCESS' } });
    res.json({
      success: true,
      data: {
        token: signAccessToken(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

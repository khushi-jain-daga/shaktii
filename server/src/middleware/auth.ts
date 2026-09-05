import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type AuthPayload = { sub: string; role: 'ADMIN' | 'USER' | 'SECURITY_ANALYST'; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Authentication required' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret') as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: AuthPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have permission to perform this action' });
    next();
  };
}

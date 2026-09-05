import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type AuthPayload = { sub: string; role: string; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}

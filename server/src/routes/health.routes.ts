import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'shaktii-node-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

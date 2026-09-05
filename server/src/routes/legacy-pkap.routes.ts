import { Router } from 'express';

export const legacyPkapRouter = Router();

legacyPkapRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      migrated: false,
      legacyEndpoints: [
        'pkap-analyze',
        'pkap-threat-intel',
        'pkap-investigate',
        'pkap-block-ip',
        'pkap-generate-report',
      ],
      message: 'Existing PKAP serverless handlers are preserved and will be migrated into Node service modules incrementally.',
    },
  });
});

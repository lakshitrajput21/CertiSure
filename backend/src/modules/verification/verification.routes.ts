import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { verificationController } from './verification.controller.js';

export const verificationRouter = Router();

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: {
    outcome: 'SERVICE_ERROR',
    message: 'Rate limit exceeded for public verification queries. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public verification by document ID or QR scan
verificationRouter.get('/:id', verifyLimiter, verificationController.verifyById);

// Verification telemetry / audit history
verificationRouter.get('/', authenticateToken, requireRoles(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN), verificationController.getHistory);

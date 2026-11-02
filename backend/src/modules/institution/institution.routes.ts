import { Router } from 'express';
import { institutionController } from './institution.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

export const institutionRouter = Router();

// Profile retrieval
institutionRouter.get('/profile', authenticateToken, institutionController.getProfile);

// Profile updates require INSTITUTION_ADMIN or SUPER_ADMIN
institutionRouter.put(
  '/profile',
  authenticateToken,
  requireRoles(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN),
  institutionController.updateProfile
);

institutionRouter.patch(
  '/settings',
  authenticateToken,
  requireRoles(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN),
  institutionController.updateProfile
);

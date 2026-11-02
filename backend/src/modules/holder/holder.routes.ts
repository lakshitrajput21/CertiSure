import { Router } from 'express';
import { holderController } from './holder.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

export const holderRouter = Router();

// Candidate credential locker requires authenticated CERTIFICATE_HOLDER or admin
holderRouter.use(authenticateToken);
holderRouter.get('/certificates', requireRoles(UserRole.CERTIFICATE_HOLDER, UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN), holderController.getMyCertificates);
holderRouter.get('/certificates/:id', requireRoles(UserRole.CERTIFICATE_HOLDER, UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN), holderController.getMyCertificateById);

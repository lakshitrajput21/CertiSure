import { Router } from 'express';
import { certificateController } from './certificate.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { issueCertificateSchema, revokeCertificateSchema, queryCertificatesSchema } from './certificate.schema.js';
import {
  authenticateToken,
  optionalAuth,
  requireRoles,
  requireApprovedInstitution,
} from '../../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

export const certificateRouter = Router();

// Issuance requires authenticated INSTITUTION_ADMIN or SUPER_ADMIN, and an APPROVED institution
certificateRouter.post(
  '/',
  authenticateToken,
  requireRoles(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN),
  requireApprovedInstitution,
  validate(issueCertificateSchema),
  certificateController.issue
);

// List certificates (scoped to caller's role)
certificateRouter.get(
  '/',
  authenticateToken,
  validate(queryCertificatesSchema),
  certificateController.getAll
);

// Get single certificate details
certificateRouter.get('/:id', authenticateToken, certificateController.getById);

// Revocation requires authenticated INSTITUTION_ADMIN or SUPER_ADMIN
certificateRouter.post(
  '/:id/revoke',
  authenticateToken,
  requireRoles(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN),
  validate(revokeCertificateSchema),
  certificateController.revoke
);

// PDF Download
certificateRouter.get('/:id/pdf', authenticateToken, certificateController.downloadPdf);

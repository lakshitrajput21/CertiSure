import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

export const adminRouter = Router();

// All admin routes require authentication and SUPER_ADMIN role
adminRouter.use(authenticateToken);
adminRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN));

// Institution management
adminRouter.get('/institutions', adminController.listInstitutions);
adminRouter.patch('/institutions/:id/status', adminController.updateStatus);
adminRouter.put('/institutions/:id/status', adminController.updateStatus);

// List all users (admin view)
adminRouter.get('/users', adminController.listUsers);

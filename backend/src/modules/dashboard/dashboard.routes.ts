import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export const dashboardRouter = Router();

// Endpoint for dashboard metrics
dashboardRouter.get('/stats', authenticateToken, dashboardController.getStats);
dashboardRouter.get('/institution/dashboard-stats', authenticateToken, dashboardController.getStats);

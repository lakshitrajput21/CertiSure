import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.institutionId;
      const stats = await dashboardService.getStats(institutionId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

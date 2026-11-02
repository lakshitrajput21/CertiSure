import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { InstitutionStatus } from '@prisma/client';

export class AdminController {
  async listInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const institutions = await adminService.listInstitutions(status);
      res.json({
        success: true,
        data: { institutions },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const status = req.body.status as InstitutionStatus;
      const reason = req.body.reason;
      const result = await adminService.updateInstitutionStatus(id, status, reason);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.listUsers();
      res.json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

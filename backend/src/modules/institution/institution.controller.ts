import { Request, Response, NextFunction } from 'express';
import { institutionService } from './institution.service.js';

export class InstitutionController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.institutionId;
      const profile = await institutionService.getProfile(institutionId);
      res.json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const profile = await institutionService.updateProfile(req.body, user);
      res.json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const institutionController = new InstitutionController();

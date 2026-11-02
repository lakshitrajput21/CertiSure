import { Request, Response, NextFunction } from 'express';
import { holderService } from './holder.service.js';

export class HolderController {
  async getMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const certificates = await holderService.getMyCertificates(user);
      res.json({
        success: true,
        data: { certificates },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCertificateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const certificate = await holderService.getMyCertificateById(id, user);
      res.json({
        success: true,
        data: { certificate },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const holderController = new HolderController();

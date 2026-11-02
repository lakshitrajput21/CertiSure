import { Request, Response, NextFunction } from 'express';
import { verificationService } from './verification.service.js';
import { VerificationMethod } from '@prisma/client';

export class VerificationController {
  async verifyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const rawMethod = (req.query.method as string) || 'DIRECT_SEARCH';
      const method = (Object.values(VerificationMethod) as string[]).includes(rawMethod)
        ? (rawMethod as VerificationMethod)
        : VerificationMethod.DIRECT_SEARCH;

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await verificationService.verifyById(id, method, ipAddress, userAgent);
      res.status(result.statusCode).json(result.response);
    } catch (error) {
      next(error);
    }
  }

  async checkFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file || !file.buffer) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A valid PDF document file must be uploaded.',
          },
        });
        return;
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress;
      const result = await verificationService.checkFileHash(file.buffer, ipAddress);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const outcome = req.query.outcome as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await verificationService.getVerificationHistory({
        outcome,
        search,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();

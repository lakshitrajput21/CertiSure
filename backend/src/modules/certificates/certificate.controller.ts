import { Request, Response, NextFunction } from 'express';
import { certificateService } from './certificate.service.js';

export class CertificateController {
  async issue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issuer = req.user!;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const cert = await certificateService.issueCertificate(req.body, issuer, ipAddress);
      res.status(201).json({
        success: true,
        data: { certificate: cert },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issuer = req.user;
      const result = await certificateService.getAllCertificates(req.query as any, issuer);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const cert = await certificateService.getCertificateById(id, req.user);
      res.json({
        success: true,
        data: { certificate: cert },
      });
    } catch (error) {
      next(error);
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const reason = req.body.reason;
      const actor = req.user!;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const updated = await certificateService.revokeCertificate(id, reason, actor, ipAddress);
      res.json({
        success: true,
        data: { certificate: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const filePath = await certificateService.getPdfPath(id, req.user!);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="CertiSure-${id}.pdf"`);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

export const certificateController = new CertificateController();

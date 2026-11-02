import { prisma } from '../../db/client.js';
import { AppError } from '../../middleware/error.middleware.js';
import { AuthenticatedUser } from '../../middleware/auth.middleware.js';
import { CertificateStatus } from '@prisma/client';

export class HolderService {
  async getMyCertificates(user: AuthenticatedUser) {
    const cleanEmail = user.email.toLowerCase().trim();

    const certificates = await prisma.certificate.findMany({
      where: {
        OR: [
          { holderId: user.id },
          { holderEmail: cleanEmail },
        ],
      },
      include: {
        institution: true,
        auditTrail: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { issueDate: 'desc' },
    });

    const now = new Date();
    return certificates.map((cert) => {
      let computedStatus: string = cert.status;
      if (cert.status === CertificateStatus.ACTIVE && cert.expiryDate && new Date(cert.expiryDate) < now) {
        computedStatus = 'EXPIRED';
      } else if (cert.status === CertificateStatus.ACTIVE) {
        computedStatus = 'VALID';
      }

      return {
        id: cert.documentId,
        holderName: cert.holderName,
        holderEmail: cert.holderEmail,
        title: cert.title,
        type: cert.type,
        institutionName: cert.institution.name,
        institutionId: cert.institution.id,
        issueDate: cert.issueDate.toISOString().split('T')[0],
        expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : undefined,
        status: computedStatus,
        description: cert.description,
        gradeOrScore: cert.gradeOrScore || undefined,
        signatoryName: cert.signatoryName,
        signatoryTitle: cert.signatoryTitle,
        digitalFingerprint: cert.fileHash,
        revocationReason: cert.revocationReason || undefined,
        revocationDate: cert.revocationDate ? cert.revocationDate.toISOString() : undefined,
        auditTrail: cert.auditTrail.map((ev) => ({
          id: ev.id,
          timestamp: ev.createdAt.toISOString(),
          action: ev.action,
          actor: ev.actorName,
          notes: ev.notes,
        })),
        createdAt: cert.createdAt.toISOString(),
      };
    });
  }

  async getMyCertificateById(documentIdOrId: string, user: AuthenticatedUser) {
    const cleanId = documentIdOrId.trim();
    const cleanEmail = user.email.toLowerCase().trim();

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { documentId: cleanId.toUpperCase() },
          { id: cleanId },
        ],
      },
      include: {
        institution: true,
        auditTrail: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!cert) {
      throw new AppError(`Certificate "${documentIdOrId}" not found.`, 404, 'NOT_FOUND');
    }

    // Ownership Enforcement (AT-12, TC-10): Only the rightful recipient can view
    const isOwner = cert.holderId === user.id || cert.holderEmail.toLowerCase() === cleanEmail;
    if (!isOwner) {
      throw new AppError('Forbidden: You do not have permission to view another recipient\'s private certificate.', 403, 'FORBIDDEN');
    }

    const now = new Date();
    let computedStatus: string = cert.status;
    if (cert.status === CertificateStatus.ACTIVE && cert.expiryDate && new Date(cert.expiryDate) < now) {
      computedStatus = 'EXPIRED';
    } else if (cert.status === CertificateStatus.ACTIVE) {
      computedStatus = 'VALID';
    }

    return {
      id: cert.documentId,
      holderName: cert.holderName,
      holderEmail: cert.holderEmail,
      title: cert.title,
      type: cert.type,
      institutionName: cert.institution.name,
      institutionId: cert.institution.id,
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : undefined,
      status: computedStatus,
      description: cert.description,
      gradeOrScore: cert.gradeOrScore || undefined,
      signatoryName: cert.signatoryName,
      signatoryTitle: cert.signatoryTitle,
      digitalFingerprint: cert.fileHash,
      revocationReason: cert.revocationReason || undefined,
      revocationDate: cert.revocationDate ? cert.revocationDate.toISOString() : undefined,
      auditTrail: cert.auditTrail.map((ev) => ({
        id: ev.id,
        timestamp: ev.createdAt.toISOString(),
        action: ev.action,
        actor: ev.actorName,
        notes: ev.notes,
      })),
      createdAt: cert.createdAt.toISOString(),
    };
  }
}

export const holderService = new HolderService();

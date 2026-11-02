import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../db/client.js';
import { AppError } from '../../middleware/error.middleware.js';
import { AuthenticatedUser } from '../../middleware/auth.middleware.js';
import { IssueCertificateInput, QueryCertificatesInput } from './certificate.schema.js';
import { generateProductionCertificateId } from '../../utils/idGenerator.js';
import { renderServerCertificatePdf } from '../pdf/pdf.service.js';
import { computeCanonicalCertificateHash } from '../../utils/canonicalHash.js';
import { CertificateType, CertificateStatus, Prisma, UserRole } from '@prisma/client';

function mapCertificateType(rawType: string): CertificateType {
  const normalized = rawType.toUpperCase().replace(/\s+/g, '_');
  if (normalized in CertificateType) {
    return normalized as CertificateType;
  }
  return CertificateType.DEGREE;
}

export class CertificateService {
  async issueCertificate(input: IssueCertificateInput, issuer: AuthenticatedUser, ipAddress?: string) {
    if (!issuer.institutionId) {
      throw new AppError('Issuer account is not affiliated with any educational institution.', 403, 'NO_INSTITUTION');
    }

    const institution = await prisma.institution.findUnique({
      where: { id: issuer.institutionId },
    });

    if (!institution) {
      throw new AppError('Issuing institution not found.', 404, 'INSTITUTION_NOT_FOUND');
    }

    if (institution.status !== 'APPROVED') {
      throw new AppError(
        `Institution "${institution.name}" is currently ${institution.status}. Only APPROVED institutions may issue credentials.`,
        403,
        'INSTITUTION_NOT_APPROVED'
      );
    }

    const documentId = generateProductionCertificateId();
    const certType = mapCertificateType(input.type);

    const storageDir = path.resolve(process.env.STORAGE_PATH || 'storage/certificates');
    const tempDir = path.resolve(process.env.STORAGE_TEMP_PATH || 'storage/temp');
    await fs.promises.mkdir(storageDir, { recursive: true });
    await fs.promises.mkdir(tempDir, { recursive: true });

    const stagingPath = path.join(tempDir, `staging-${crypto.randomUUID()}.tmp`);
    const finalFileName = `CertiSure-${documentId}.pdf`;
    const finalFilePath = path.join(storageDir, finalFileName);

    let stagingWritten = false;
    let dbCommitted = false;
    let createdRecord: any = null;

    try {
      // 1. Generate Physical Vector PDF
      const pdfBuffer = await renderServerCertificatePdf({
        documentId,
        holderName: input.holderName.trim(),
        title: input.title.trim(),
        type: input.type,
        institutionName: institution.name,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate || undefined,
        description: input.description.trim(),
        gradeOrScore: input.gradeOrScore?.trim(),
        signatoryName: input.signatoryName || institution.defaultSignatoryName,
        signatoryTitle: input.signatoryTitle || institution.defaultSignatoryTitle,
      });

      // 2. Compute Physical SHA-256 Digest
      const fileHash = 'sha256:' + crypto.createHash('sha256').update(pdfBuffer).digest('hex');

      // 3. Compute Deterministic Canonical Metadata Hash
      const canonicalHash = computeCanonicalCertificateHash({
        documentId,
        holderName: input.holderName.trim(),
        holderEmail: input.holderEmail.trim().toLowerCase(),
        title: input.title.trim(),
        type: input.type,
        institutionId: institution.id,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate,
        description: input.description.trim(),
        gradeOrScore: input.gradeOrScore?.trim(),
        signatoryName: input.signatoryName || institution.defaultSignatoryName,
        signatoryTitle: input.signatoryTitle || institution.defaultSignatoryTitle,
      });

      // 4. Stage PDF to temporary filesystem location
      await fs.promises.writeFile(stagingPath, pdfBuffer);
      stagingWritten = true;

      // 5. Look up existing holder account by email to link account (if registered)
      const existingHolder = await prisma.user.findUnique({
        where: { email: input.holderEmail.trim().toLowerCase() },
      });

      // 6. Transactional Database Commit (Two-Phase Boundary)
      createdRecord = await prisma.$transaction(async (tx) => {
        const cert = await tx.certificate.create({
          data: {
            documentId,
            institutionId: institution.id,
            holderId: existingHolder ? existingHolder.id : null,
            holderName: input.holderName.trim(),
            holderEmail: input.holderEmail.trim().toLowerCase(),
            title: input.title.trim(),
            type: certType,
            description: input.description.trim(),
            gradeOrScore: input.gradeOrScore?.trim(),
            signatoryName: input.signatoryName || institution.defaultSignatoryName,
            signatoryTitle: input.signatoryTitle || institution.defaultSignatoryTitle,
            issueDate: new Date(input.issueDate),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            status: CertificateStatus.ACTIVE,
            pdfPath: finalFilePath,
            pdfFileName: finalFileName,
            pdfFileSize: pdfBuffer.length,
            fileHash,
            canonicalHash,
          },
        });

        await tx.certificateEvent.create({
          data: {
            certificateId: cert.id,
            action: 'ISSUED',
            actorId: issuer.id,
            actorName: `${issuer.name} (${issuer.designation || 'Institutional Issuer'})`,
            notes: 'Official academic credential registered in institutional repository.',
            ipAddress: ipAddress || '127.0.0.1',
          },
        });

        return cert;
      });

      dbCommitted = true;

      // 7. Promote Staged File to Authoritative Storage Location
      await fs.promises.rename(stagingPath, finalFilePath);

      // Return fully hydrated certificate
      return this.formatCertificateOutput(createdRecord, institution);
    } catch (err: any) {
      // Two-Phase Compensation Logic
      if (stagingWritten && !dbCommitted) {
        await fs.promises.unlink(stagingPath).catch(() => {});
      } else if (stagingWritten && dbCommitted && createdRecord) {
        // Extreme edge case: promotion failed after database commit
        await prisma.certificate.delete({ where: { id: createdRecord.id } }).catch(() => {});
        await fs.promises.unlink(stagingPath).catch(() => {});
      }
      throw new AppError(`Certificate issuance failed: ${err.message}`, 500, 'ISSUANCE_FAILED');
    }
  }

  async getAllCertificates(query: QueryCertificatesInput, issuer?: AuthenticatedUser) {
    const where: Prisma.CertificateWhereInput = {};

    // Scope to institution if caller is INSTITUTION_ADMIN
    if (issuer && issuer.role === UserRole.INSTITUTION_ADMIN && issuer.institutionId) {
      where.institutionId = issuer.institutionId;
    }

    // Holders can only list certificates issued to their own verified account/email.
    if (issuer && issuer.role === UserRole.CERTIFICATE_HOLDER) {
      where.OR = [{ holderId: issuer.id }, { holderEmail: issuer.email.toLowerCase() }];
    }

    // Search query
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.AND = [{ OR: [
        { documentId: { contains: q, mode: 'insensitive' } },
        { holderName: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { holderEmail: { contains: q, mode: 'insensitive' } },
      ] }];
    }

    // Status filter
    const now = new Date();
    if (query.status && query.status !== 'ALL') {
      if (query.status === 'VALID' || query.status === 'ACTIVE') {
        where.status = CertificateStatus.ACTIVE;
        where.OR = [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ];
      } else if (query.status === 'REVOKED') {
        where.status = CertificateStatus.REVOKED;
      } else if (query.status === 'EXPIRED') {
        where.status = CertificateStatus.ACTIVE;
        where.expiryDate = { lt: now };
      }
    }

    // Type filter
    if (query.type && query.type !== 'ALL') {
      where.type = mapCertificateType(query.type);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({
        where,
        include: {
          institution: true,
          auditTrail: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formatted = records.map((cert) => this.formatCertificateOutput(cert, cert.institution));

    return {
      certificates: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCertificateById(id: string, caller?: AuthenticatedUser) {
    const trimmed = id.trim();
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { documentId: trimmed.toUpperCase() },
          { id: trimmed },
        ],
      },
      include: {
        institution: true,
        auditTrail: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!cert) {
      throw new AppError(`Certificate "${id}" not found.`, 404, 'CERTIFICATE_NOT_FOUND');
    }

    if (caller?.role === UserRole.CERTIFICATE_HOLDER && cert.holderId !== caller.id && cert.holderEmail.toLowerCase() !== caller.email.toLowerCase()) {
      throw new AppError('You cannot view another holder’s certificate.', 403, 'FORBIDDEN');
    }

    // Access control: If caller is INSTITUTION_ADMIN, must match institution
    if (
      caller &&
      caller.role === UserRole.INSTITUTION_ADMIN &&
      caller.institutionId &&
      cert.institutionId !== caller.institutionId
    ) {
      throw new AppError('Forbidden: You can only view certificates issued by your institution.', 403, 'FORBIDDEN');
    }

    return this.formatCertificateOutput(cert, cert.institution);
  }

  async revokeCertificate(id: string, reason: string, actor: AuthenticatedUser, ipAddress?: string) {
    const cert = await this.getCertificateById(id, actor);

    if (cert.status === 'REVOKED') {
      throw new AppError(`Certificate "${cert.id}" is already revoked.`, 409, 'ALREADY_REVOKED');
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.certificate.update({
        where: { documentId: cert.id },
        data: {
          status: CertificateStatus.REVOKED,
          revocationReason: reason.trim(),
          revocationDate: now,
          revokedById: actor.id,
        },
        include: {
          institution: true,
          auditTrail: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.certificateEvent.create({
        data: {
          certificateId: record.id,
          action: 'REVOKED',
          actorId: actor.id,
          actorName: `${actor.name} (${actor.designation || 'Administrator'})`,
          notes: `Official Revocation Directive: ${reason.trim()}`,
          ipAddress: ipAddress || '127.0.0.1',
        },
      });

      return record;
    });

    return this.formatCertificateOutput(updated, updated.institution);
  }

  async getPdfPath(id: string, caller: AuthenticatedUser): Promise<string> {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { documentId: id.trim().toUpperCase() },
          { id: id.trim() },
        ],
      },
    });

    if (!cert) {
      throw new AppError(`Certificate "${id}" not found.`, 404, 'NOT_FOUND');
    }

    if (caller.role === UserRole.CERTIFICATE_HOLDER && cert.holderId !== caller.id && cert.holderEmail.toLowerCase() !== caller.email.toLowerCase()) {
      throw new AppError('Not authorized to download this certificate.', 403, 'FORBIDDEN');
    }
    if (caller.role === UserRole.INSTITUTION_ADMIN && cert.institutionId !== caller.institutionId) {
      throw new AppError('Not authorized to download this certificate.', 403, 'FORBIDDEN');
    }
    if (!fs.existsSync(cert.pdfPath)) {
      throw new AppError('Document PDF is currently unavailable on storage.', 404, 'PDF_NOT_FOUND');
    }

    return cert.pdfPath;
  }

  private formatCertificateOutput(cert: any, institution: any) {
    // Dynamic Expiry Calculation
    let computedStatus = cert.status;
    if (cert.status === CertificateStatus.ACTIVE && cert.expiryDate && new Date(cert.expiryDate) < new Date()) {
      computedStatus = 'EXPIRED';
    } else if (cert.status === CertificateStatus.ACTIVE) {
      computedStatus = 'VALID';
    }

    // Normalize type string for frontend specimen display (e.g. DEGREE -> 'Degree')
    const typeLabelMap: Record<string, string> = {
      DEGREE: 'Degree',
      DIPLOMA: 'Diploma',
      COURSE_COMPLETION: 'Course Completion',
      ACADEMIC_MERIT: 'Academic Merit',
      PROFESSIONAL_LICENSE: 'Professional License',
      INTERNSHIP_CREDENTIAL: 'Internship Credential',
    };

    return {
      id: cert.documentId,
      internalId: cert.id,
      holderName: cert.holderName,
      holderEmail: cert.holderEmail,
      title: cert.title,
      type: typeLabelMap[cert.type] || cert.type,
      institutionName: institution.name,
      institutionId: institution.id,
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : undefined,
      status: computedStatus,
      description: cert.description,
      gradeOrScore: cert.gradeOrScore || undefined,
      signatoryName: cert.signatoryName,
      signatoryTitle: cert.signatoryTitle,
      digitalFingerprint: cert.fileHash,
      canonicalHash: cert.canonicalHash,
      revocationReason: cert.revocationReason || undefined,
      revocationDate: cert.revocationDate ? cert.revocationDate.toISOString() : undefined,
      auditTrail: (cert.auditTrail || []).map((ev: any) => ({
        id: ev.id,
        timestamp: ev.createdAt.toISOString(),
        action: ev.action,
        actor: ev.actorName,
        notes: ev.notes,
        ipAddress: ev.ipAddress,
      })),
      createdAt: cert.createdAt.toISOString(),
    };
  }
}

export const certificateService = new CertificateService();

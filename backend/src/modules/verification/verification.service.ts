import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../../db/client.js';
import { CERTIFICATE_ID_REGEX } from '../../utils/idGenerator.js';
import { emergencyAuditLogger } from '../../utils/auditLogger.js';
import { computeCanonicalCertificateHash } from '../../utils/canonicalHash.js';
import { VerificationMethod, VerificationOutcome, CertificateStatus } from '@prisma/client';

export interface VerificationResponse {
  outcome: VerificationOutcome;
  searchedId: string;
  verifiedAt: string;
  method: VerificationMethod;
  certificate?: PublicCertificateDto;
  tamperDetails?: string;
  revocationReason?: string;
  revocationDate?: string;
  message?: string;
}

export interface PublicCertificateDto {
  id: string; // Business documentId e.g. "CS-2024-88491"
  holderName: string;
  title: string;
  type: string;
  institutionName: string;
  institutionId: string;
  issueDate: string;
  expiryDate?: string;
  status: string; // 'VALID' | 'REVOKED' | 'EXPIRED' | 'INTEGRITY_FAILED'
  description: string;
  gradeOrScore?: string;
  signatoryName: string;
  signatoryTitle: string;
  digitalFingerprint: string;
  revocationReason?: string;
  revocationDate?: string;
  createdAt: string;
}

function mapTypeLabel(rawType: string): string {
  const map: Record<string, string> = {
    DEGREE: 'Degree',
    DIPLOMA: 'Diploma',
    COURSE_COMPLETION: 'Course Completion',
    ACADEMIC_MERIT: 'Academic Merit',
    PROFESSIONAL_LICENSE: 'Professional License',
    INTERNSHIP_CREDENTIAL: 'Internship Credential',
  };
  return map[rawType] || rawType;
}

export class VerificationService {
  async verifyById(
    rawId: string,
    method: VerificationMethod = VerificationMethod.DIRECT_SEARCH,
    ipAddress?: string,
    userAgent?: string,
    uploadedFileBuffer?: Buffer
  ): Promise<{ statusCode: number; response: VerificationResponse }> {
    const verifiedAt = new Date().toISOString();
    const sanitizedId = (rawId || '').trim().toUpperCase();

    // Helper to log audit event with emergency fallback (Point 9)
    const logAudit = async (
      outcome: VerificationOutcome,
      certId?: string,
      title?: string,
      holder?: string,
      inst?: string,
      notes?: string
    ) => {
      try {
        await prisma.verificationLog.create({
          data: {
            certificateId: certId || null,
            searchedId: sanitizedId.slice(0, 100),
            certificateTitle: title,
            holderName: holder,
            institutionName: inst,
            outcome,
            method,
            ipAddress,
            userAgent,
            notes,
          },
        });
      } catch (err) {
        emergencyAuditLogger.warn('Verification log write to database failed; logged to disk', {
          sanitizedId,
          outcome,
          method,
          ipAddress,
          err,
        });
      }
    };

    // Rule R1: Format Validation
    if (!sanitizedId || !CERTIFICATE_ID_REGEX.test(sanitizedId)) {
      await logAudit(
        VerificationOutcome.INVALID_INPUT,
        undefined,
        undefined,
        undefined,
        undefined,
        'Malformed Certificate ID format'
      );
      return {
        statusCode: 400,
        response: {
          outcome: VerificationOutcome.INVALID_INPUT,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          message: 'Certificate ID format is malformed. Expected format: CS-YYYY-XXXXX or CS-YYYY-[A-Z0-9]{12,24}.',
        },
      };
    }

    // Rule R2: Store Reachability Check & Lookup
    let cert: any = null;
    try {
      cert = await prisma.certificate.findUnique({
        where: { documentId: sanitizedId },
        include: { institution: true },
      });
    } catch (dbErr) {
      // DFD Safeguard: A database failure is a SERVICE_ERROR, NEVER a NOT_FOUND
      await logAudit(
        VerificationOutcome.SERVICE_ERROR,
        undefined,
        undefined,
        undefined,
        undefined,
        'Registry database unreachable'
      );
      return {
        statusCode: 503,
        response: {
          outcome: VerificationOutcome.SERVICE_ERROR,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          message: 'The official institutional registry is temporarily unavailable. Please retry shortly.',
        },
      };
    }

    // Rule R3: Existence Check
    if (!cert) {
      await logAudit(
        VerificationOutcome.NOT_FOUND,
        undefined,
        undefined,
        undefined,
        undefined,
        'No record matching Certificate ID found in registry'
      );
      return {
        statusCode: 404,
        response: {
          outcome: VerificationOutcome.NOT_FOUND,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          message: 'No certificate record exists for the provided identifier in the official registry.',
        },
      };
    }

    // Rule R4: Revocation Precedence (Takes precedence over expiry and integrity)
    if (cert.status === CertificateStatus.REVOKED) {
      await logAudit(
        VerificationOutcome.REVOKED,
        cert.id,
        cert.title,
        cert.holderName,
        cert.institution.name,
        cert.revocationReason || 'Officially revoked'
      );
      return {
        statusCode: 200,
        response: {
          outcome: VerificationOutcome.REVOKED,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          certificate: this.sanitizePublicCertificate(cert, 'REVOKED'),
          revocationReason: cert.revocationReason || 'Revoked per official administrative directive.',
          revocationDate: cert.revocationDate?.toISOString() || cert.updatedAt.toISOString(),
        },
      };
    }

    // Rule R5: Dynamic Expiration Check
    const now = new Date();
    if (cert.expiryDate && new Date(cert.expiryDate) < now) {
      await logAudit(
        VerificationOutcome.EXPIRED,
        cert.id,
        cert.title,
        cert.holderName,
        cert.institution.name,
        `Certificate expired on ${cert.expiryDate.toISOString().split('T')[0]}`
      );
      return {
        statusCode: 200,
        response: {
          outcome: VerificationOutcome.EXPIRED,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          certificate: this.sanitizePublicCertificate(cert, 'EXPIRED'),
        },
      };
    }

    // Check Issuer Approval (FR-07, FR-23)
    if (cert.institution.status !== 'APPROVED') {
      await logAudit(
        VerificationOutcome.ISSUER_SUSPENDED,
        cert.id,
        cert.title,
        cert.holderName,
        cert.institution.name,
        `Issuing institution status is ${cert.institution.status}`
      );
      return {
        statusCode: 422,
        response: {
          outcome: VerificationOutcome.ISSUER_SUSPENDED,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          message: 'The issuing institution is currently suspended or pending approval. Authenticity cannot be confirmed.',
        },
      };
    }

    // Rule R6 & R7: Real Cryptographic Integrity Verification
    // 1. Physical PDF Byte Hash Check
    let storedPdfBytes: Buffer;
    try {
      storedPdfBytes = await fs.promises.readFile(cert.pdfPath);
    } catch {
      // Rule R7: Stored file inaccessible -> INTEGRITY_NOT_CHECKED
      await logAudit(
        VerificationOutcome.INTEGRITY_NOT_CHECKED,
        cert.id,
        cert.title,
        cert.holderName,
        cert.institution.name,
        'Authoritative PDF file missing on disk'
      );
      return {
        statusCode: 200,
        response: {
          outcome: VerificationOutcome.INTEGRITY_NOT_CHECKED,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          certificate: this.sanitizePublicCertificate(cert, 'VALID'),
          message: 'Cryptographic file integrity could not be verified because the physical document is temporarily inaccessible.',
        },
      };
    }

    const computedByteHash = 'sha256:' + crypto.createHash('sha256').update(storedPdfBytes).digest('hex');
    const physicalHashMatches = computedByteHash === cert.fileHash;

    // 2. Canonical Metadata Check (Protects against direct database manipulation)
    const expectedCanonical = computeCanonicalCertificateHash({
      documentId: cert.documentId,
      holderName: cert.holderName,
      holderEmail: cert.holderEmail,
      title: cert.title,
      type: cert.type,
      institutionId: cert.institutionId,
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : null,
      description: cert.description,
      gradeOrScore: cert.gradeOrScore,
      signatoryName: cert.signatoryName,
      signatoryTitle: cert.signatoryTitle,
    });

    const canonicalMatches = !cert.canonicalHash || cert.canonicalHash === expectedCanonical;

    // If either physical file or canonical metadata has been altered:
    if (!physicalHashMatches || !canonicalMatches) {
      await logAudit(
        VerificationOutcome.INTEGRITY_FAILED,
        cert.id,
        cert.title,
        cert.holderName,
        cert.institution.name,
        `Cryptographic integrity mismatch. PhysicalMatch=${physicalHashMatches}, CanonicalMatch=${canonicalMatches}`
      );
      return {
        statusCode: 200,
        response: {
          outcome: VerificationOutcome.INTEGRITY_FAILED,
          searchedId: sanitizedId,
          verifiedAt,
          method,
          certificate: this.sanitizePublicCertificate(cert, 'INTEGRITY_FAILED'),
          tamperDetails: 'Cryptographic checksum failure. The document fingerprint does not match the official registry record.',
        },
      };
    }

    // 3. Optional Uploaded File Check (FR-25 / TC-06)
    if (uploadedFileBuffer) {
      const uploadedByteHash = 'sha256:' + crypto.createHash('sha256').update(uploadedFileBuffer).digest('hex');
      if (uploadedByteHash !== cert.fileHash) {
        await logAudit(
          VerificationOutcome.INTEGRITY_FAILED,
          cert.id,
          cert.title,
          cert.holderName,
          cert.institution.name,
          'Uploaded file hash differs from authoritative registered document'
        );
        return {
          statusCode: 200,
          response: {
            outcome: VerificationOutcome.INTEGRITY_FAILED,
            searchedId: sanitizedId,
            verifiedAt,
            method,
            certificate: this.sanitizePublicCertificate(cert, 'INTEGRITY_FAILED'),
            tamperDetails: 'The uploaded PDF document does not match the byte-level hash of the authentic issued certificate.',
          },
        };
      }
    }

    // Rule R8: Valid
    await logAudit(
      VerificationOutcome.VALID,
      cert.id,
      cert.title,
      cert.holderName,
      cert.institution.name,
      'Status validated as Authentic and Valid'
    );

    return {
      statusCode: 200,
      response: {
        outcome: VerificationOutcome.VALID,
        searchedId: sanitizedId,
        verifiedAt,
        method,
        certificate: this.sanitizePublicCertificate(cert, 'VALID'),
      },
    };
  }

  async checkFileHash(fileBuffer: Buffer, ipAddress?: string): Promise<any> {
    const computedHash = 'sha256:' + crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const cert = await prisma.certificate.findFirst({
      where: { fileHash: computedHash },
      include: { institution: true },
    });

    if (!cert) {
      return {
        match: false,
        computedHash,
        outcome: VerificationOutcome.NOT_FOUND,
        message: 'No issued certificate in the registry matches the cryptographic fingerprint of the uploaded file.',
      };
    }

    const verification = await this.verifyById(cert.documentId, VerificationMethod.FILE_UPLOAD, ipAddress, undefined, fileBuffer);
    return {
      match: verification.response.outcome === VerificationOutcome.VALID,
      computedHash,
      verificationResult: verification.response,
    };
  }

  async getVerificationHistory(options: {
    outcome?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (options.outcome && options.outcome !== 'ALL') {
      where.outcome = options.outcome as VerificationOutcome;
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { searchedId: { contains: q, mode: 'insensitive' } },
        { certificateTitle: { contains: q, mode: 'insensitive' } },
        { holderName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.verificationLog.count({ where }),
      prisma.verificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formatted = logs.map((log) => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      certificateId: log.searchedId,
      certificateTitle: log.certificateTitle || 'Unknown Document',
      holderName: log.holderName || 'Unknown',
      institutionName: log.institutionName || 'Unknown',
      outcome: log.outcome,
      method: log.method,
      ipLocation: log.ipLocation || 'Chandigarh, India',
      notes: log.notes || undefined,
    }));

    return { logs: formatted, total, page, totalPages: Math.ceil(total / limit) };
  }

  private sanitizePublicCertificate(cert: any, displayStatus: string): PublicCertificateDto {
    return {
      id: cert.documentId,
      holderName: cert.holderName, // Approved public holder identifier
      title: cert.title,
      type: mapTypeLabel(cert.type),
      institutionName: cert.institution?.name || 'Punjab Engineering College',
      institutionId: cert.institution?.id || cert.institutionId,
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : undefined,
      status: displayStatus,
      description: cert.description,
      gradeOrScore: cert.gradeOrScore || undefined,
      signatoryName: cert.signatoryName,
      signatoryTitle: cert.signatoryTitle,
      digitalFingerprint: cert.fileHash,
      revocationReason: cert.status === CertificateStatus.REVOKED ? cert.revocationReason : undefined,
      revocationDate: cert.status === CertificateStatus.REVOKED && cert.revocationDate ? cert.revocationDate.toISOString() : undefined,
      createdAt: cert.createdAt.toISOString(),
    };
  }
}

export const verificationService = new VerificationService();

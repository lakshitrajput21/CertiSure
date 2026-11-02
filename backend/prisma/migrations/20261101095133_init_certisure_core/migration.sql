-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'CERTIFICATE_HOLDER', 'PUBLIC_VERIFIER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('DEGREE', 'DIPLOMA', 'COURSE_COMPLETION', 'ACADEMIC_MERIT', 'PROFESSIONAL_LICENSE', 'INTERNSHIP_CREDENTIAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ISSUED', 'VERIFIED', 'REVOKED', 'MODIFIED', 'VIEWED', 'REISSUED');

-- CreateEnum
CREATE TYPE "VerificationOutcome" AS ENUM ('VALID', 'REVOKED', 'EXPIRED', 'INTEGRITY_FAILED', 'INTEGRITY_NOT_CHECKED', 'NOT_FOUND', 'INVALID_INPUT', 'SERVICE_ERROR', 'ISSUER_SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('QR_CODE', 'DIRECT_SEARCH', 'URL_LOOKUP', 'API_DEMO', 'FILE_UPLOAD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CERTIFICATE_HOLDER',
    "designation" TEXT,
    "avatarUrl" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "accreditationId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "defaultSignatoryName" TEXT NOT NULL,
    "defaultSignatoryTitle" TEXT NOT NULL,
    "establishedYear" INTEGER NOT NULL DEFAULT 1921,
    "status" "InstitutionStatus" NOT NULL DEFAULT 'APPROVED',
    "verificationBadgeText" TEXT NOT NULL DEFAULT 'Accredited Autonomous Institution Registry',
    "logoUrl" TEXT,
    "publicKey" TEXT,
    "keyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "holderId" TEXT,
    "holderName" TEXT NOT NULL,
    "holderEmail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "description" TEXT NOT NULL,
    "gradeOrScore" TEXT,
    "signatoryName" TEXT NOT NULL,
    "signatoryTitle" TEXT NOT NULL,
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "pdfPath" TEXT NOT NULL,
    "pdfFileName" TEXT NOT NULL,
    "pdfFileSize" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "digitalSignature" TEXT,
    "signatureKeyId" TEXT,
    "revocationReason" TEXT,
    "revocationDate" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateEvent" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT,
    "searchedId" TEXT NOT NULL,
    "certificateTitle" TEXT,
    "holderName" TEXT,
    "institutionName" TEXT,
    "outcome" "VerificationOutcome" NOT NULL,
    "method" "VerificationMethod" NOT NULL DEFAULT 'DIRECT_SEARCH',
    "ipLocation" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReissueLink" (
    "id" TEXT NOT NULL,
    "originalCertificateId" TEXT NOT NULL,
    "replacementCertificateId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reissuedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReissueLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_institutionId_idx" ON "User"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");

-- CreateIndex
CREATE INDEX "Institution_code_idx" ON "Institution"("code");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "Institution"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_documentId_key" ON "Certificate"("documentId");

-- CreateIndex
CREATE INDEX "Certificate_documentId_idx" ON "Certificate"("documentId");

-- CreateIndex
CREATE INDEX "Certificate_holderEmail_idx" ON "Certificate"("holderEmail");

-- CreateIndex
CREATE INDEX "Certificate_institutionId_idx" ON "Certificate"("institutionId");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "Certificate_expiryDate_idx" ON "Certificate"("expiryDate");

-- CreateIndex
CREATE INDEX "CertificateEvent_certificateId_idx" ON "CertificateEvent"("certificateId");

-- CreateIndex
CREATE INDEX "CertificateEvent_createdAt_idx" ON "CertificateEvent"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationLog_searchedId_idx" ON "VerificationLog"("searchedId");

-- CreateIndex
CREATE INDEX "VerificationLog_outcome_idx" ON "VerificationLog"("outcome");

-- CreateIndex
CREATE INDEX "VerificationLog_createdAt_idx" ON "VerificationLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReissueLink_originalCertificateId_key" ON "ReissueLink"("originalCertificateId");

-- CreateIndex
CREATE UNIQUE INDEX "ReissueLink_replacementCertificateId_key" ON "ReissueLink"("replacementCertificateId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateEvent" ADD CONSTRAINT "CertificateEvent_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateEvent" ADD CONSTRAINT "CertificateEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReissueLink" ADD CONSTRAINT "ReissueLink_originalCertificateId_fkey" FOREIGN KEY ("originalCertificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReissueLink" ADD CONSTRAINT "ReissueLink_replacementCertificateId_fkey" FOREIGN KEY ("replacementCertificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReissueLink" ADD CONSTRAINT "ReissueLink_reissuedById_fkey" FOREIGN KEY ("reissuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

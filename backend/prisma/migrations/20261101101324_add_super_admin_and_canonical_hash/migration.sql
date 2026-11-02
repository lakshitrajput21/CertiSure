-- AlterEnum
ALTER TYPE "InstitutionStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "canonicalHash" TEXT;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rejectionReason" TEXT;

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../src/db/client.js';
import { renderServerCertificatePdf } from '../src/modules/pdf/pdf.service.js';
import { computeCanonicalCertificateHash } from '../src/utils/canonicalHash.js';
import { CertificateType, UserRole } from '@prisma/client';

async function main() {
  console.log('[Seed] Starting CertiSure development database seed...');

  if (process.env.NODE_ENV === 'production') {
    console.warn('[Seed] Refusing to execute development seed in production environment.');
    process.exit(0);
  }

  // Ensure storage directories exist
  const storageDir = path.resolve('storage/certificates');
  const tempDir = path.resolve('storage/temp');
  fs.mkdirSync(storageDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  // 1. Seed Institution: Punjab Engineering College (Approved)
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-pec-chd' },
    update: {},
    create: {
      id: 'inst-pec-chd',
      name: 'Punjab Engineering College (Deemed to be University)',
      code: 'PEC-CHD',
      accreditationId: 'NAAC-A-PLUS-2023-9918',
      contactEmail: 'academic.verification@pec.edu.in',
      phone: '+91 (172) 275-3051',
      website: 'https://pec.ac.in',
      address: 'Sector 12, Vidya Path',
      city: 'Chandigarh',
      state: 'Chandigarh (UT)',
      country: 'India',
      defaultSignatoryName: 'Prof. Rajesh Kumar Sharma',
      defaultSignatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      establishedYear: 1921,
      status: 'APPROVED',
      verificationBadgeText: 'Accredited Autonomous Institution Registry',
    },
  });
  console.log(`[Seed] Seeded institution: ${institution.name} (${institution.code})`);

  // 2. Seed Demo Personas (password: DemoPassword123!)
  const passwordHash = await bcrypt.hash('DemoPassword123!', 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@certisure.edu.in' },
    update: { passwordHash, role: UserRole.SUPER_ADMIN },
    create: {
      id: 'user-superadmin-1',
      email: 'superadmin@certisure.edu.in',
      passwordHash,
      name: 'System Super Administrator',
      role: UserRole.SUPER_ADMIN,
      designation: 'Central Accreditation Authority & Registry Overseer',
      isEmailVerified: true,
    },
  });

  // Institution Admin (Issuer)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pec.edu.in' },
    update: { passwordHash, role: UserRole.INSTITUTION_ADMIN },
    create: {
      id: 'user-admin-1',
      email: 'admin@pec.edu.in',
      passwordHash,
      name: 'Dr. Rajiv Sharma',
      role: UserRole.INSTITUTION_ADMIN,
      institutionId: institution.id,
      designation: 'Controller of Examinations & Registry Admin',
      isEmailVerified: true,
    },
  });

  // Certificate Holder 1
  const holderLakshit = await prisma.user.upsert({
    where: { email: 'lakshit.rajput@pec.edu.in' },
    update: { passwordHash, role: UserRole.CERTIFICATE_HOLDER },
    create: {
      id: 'user-holder-1',
      email: 'lakshit.rajput@pec.edu.in',
      passwordHash,
      name: 'Lakshit Rajput',
      role: UserRole.CERTIFICATE_HOLDER,
      designation: 'Student / Graduate (SID: 24106061)',
      isEmailVerified: true,
    },
  });

  // Certificate Holder 2
  const holderAgampal = await prisma.user.upsert({
    where: { email: 'agampal.singh@pec.edu.in' },
    update: { passwordHash, role: UserRole.CERTIFICATE_HOLDER },
    create: {
      id: 'user-holder-2',
      email: 'agampal.singh@pec.edu.in',
      passwordHash,
      name: 'Agampal Singh',
      role: UserRole.CERTIFICATE_HOLDER,
      designation: 'Student / Graduate (SID: 24106036)',
      isEmailVerified: true,
    },
  });

  // Public Verifier
  const verifierUser = await prisma.user.upsert({
    where: { email: 'verifier@globaltalent.org' },
    update: { passwordHash, role: UserRole.PUBLIC_VERIFIER },
    create: {
      id: 'user-verifier-1',
      email: 'verifier@globaltalent.org',
      passwordHash,
      name: 'Sarah Jenkins',
      role: UserRole.PUBLIC_VERIFIER,
      designation: 'Senior Credentials Evaluator, TalentCheck Global',
      isEmailVerified: true,
    },
  });
  console.log('[Seed] Seeded 5 demo users (SuperAdmin, InstAdmin, 2 Holders, Public Verifier).');

  // 3. Certificate Data Specifications
  const certificateSeeds = [
    {
      documentId: 'CS-2024-88491',
      holderId: holderLakshit.id,
      holderName: 'Lakshit Rajput',
      holderEmail: 'lakshit.rajput@pec.edu.in',
      title: 'Bachelor of Technology in Computer Science & Engineering',
      type: CertificateType.DEGREE,
      description: 'Conferred with First Class with Distinction upon successfully completing the prescribed curriculum, research project, and university examinations.',
      gradeOrScore: 'CGPA: 9.42 / 10.00 (Distinction)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2024-06-15',
      expiryDate: undefined,
      status: 'ACTIVE' as const,
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2024-88492',
      holderId: holderAgampal.id,
      holderName: 'Agampal Singh',
      holderEmail: 'agampal.singh@pec.edu.in',
      title: 'Bachelor of Technology in Computer Science & Engineering',
      type: CertificateType.DEGREE,
      description: 'Conferred with First Class with Honors upon completing the prescribed coursework in Software Systems, Distributed Computing, and Capstone Engineering.',
      gradeOrScore: 'CGPA: 9.38 / 10.00 (Honors)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2024-06-15',
      expiryDate: undefined,
      status: 'ACTIVE' as const,
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2024-77120',
      holderName: 'Priya Verma',
      holderEmail: 'priya.verma@alumni.pec.edu.in',
      title: 'Master of Technology in Information Security',
      type: CertificateType.DEGREE,
      description: 'Awarded for postgraduate excellence in cryptographic protocols, network defense, and thesis defense on decentralized public registries.',
      gradeOrScore: 'CGPA: 9.60 / 10.00 (Gold Medalist)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2024-05-20',
      expiryDate: undefined,
      status: 'ACTIVE' as const,
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2024-65219',
      holderName: 'Kabir Mehta',
      holderEmail: 'kabir.mehta@alumni.pec.edu.in',
      title: 'Advanced Certificate in Distributed Systems Architecture',
      type: CertificateType.COURSE_COMPLETION,
      description: 'Successfully completed 120 contact hours covering microservices, fault tolerance, consensus engines, and real-time streaming architectures.',
      gradeOrScore: 'Grade: A+ (Executive Continuing Education)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2024-03-10',
      expiryDate: '2027-03-10', // Active with future expiration
      status: 'ACTIVE' as const,
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2023-41092',
      holderName: 'Rohan Batra',
      holderEmail: 'rohan.batra@example.com',
      title: 'Diploma in Industrial Computing & Automation',
      type: CertificateType.DIPLOMA,
      description: 'Conferred for two-year industrial computing program.',
      gradeOrScore: 'Grade: B (Withdrawn)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2023-04-12',
      expiryDate: undefined,
      status: 'REVOKED' as const,
      revocationReason: 'Official revocation by University Disciplinary Board (Resolution #2024-DB-88) due to submission of fraudulent eligibility documentation at admission.',
      revocationDate: new Date('2024-02-14T11:20:00Z'),
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2022-10482',
      holderName: 'Ananya Sen',
      holderEmail: 'ananya.sen@example.com',
      title: 'Certified Information Systems Auditor & Security Assessor',
      type: CertificateType.PROFESSIONAL_LICENSE,
      description: 'Two-year professional credential for compliance audits and cybersecurity vulnerability assessments.',
      gradeOrScore: 'Status: Term Expired (Requires Periodic Re-examination)',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2022-01-10',
      expiryDate: '2023-12-31', // Past date -> Evaluates dynamically to EXPIRED
      status: 'ACTIVE' as const,
      tamperChecksum: false,
    },
    {
      documentId: 'CS-2024-99999',
      holderName: 'Vikramaditya Rao (Tampered Sample)',
      holderEmail: 'vikram.rao@example.com',
      title: 'Honors Fellowship in Cryptography & Cybersecurity',
      type: CertificateType.ACADEMIC_MERIT,
      description: 'Demonstration record: This simulated certificate contains altered metadata or an invalid cryptographic hash signature.',
      gradeOrScore: 'Verification Result: Cryptographic Checksum Mismatch',
      signatoryName: 'Prof. Rajesh Kumar Sharma',
      signatoryTitle: 'Dean of Academic Affairs & Controller of Examinations',
      issueDate: '2024-01-15',
      expiryDate: undefined,
      status: 'ACTIVE' as const,
      tamperChecksum: true, // Controlled test fixture for INTEGRITY_FAILED / TAMPERED
    },
  ];

  // 4. Generate Physical PDFs & Insert Records
  for (const item of certificateSeeds) {
    console.log(`[Seed] Generating physical vector PDF for ${item.documentId}...`);
    
    const pdfBuffer = await renderServerCertificatePdf({
      documentId: item.documentId,
      holderName: item.holderName,
      title: item.title,
      type: item.type,
      institutionName: institution.name,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      description: item.description,
      gradeOrScore: item.gradeOrScore,
      signatoryName: item.signatoryName,
      signatoryTitle: item.signatoryTitle,
    });

    const pdfFileName = `CertiSure-${item.documentId}.pdf`;
    const finalFilePath = path.join(storageDir, pdfFileName);
    fs.writeFileSync(finalFilePath, pdfBuffer);

    // Compute real SHA-256 byte digest
    const realSha256 = 'sha256:' + crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    const recordedHash = item.tamperChecksum
      ? 'sha256:CORRUPTED_OR_TAMPERED_HASH_PAYLOAD_8899aabbccddeeff'
      : realSha256;

    // Compute canonical deterministic metadata hash
    const canonicalHash = computeCanonicalCertificateHash({
      documentId: item.documentId,
      holderName: item.holderName,
      holderEmail: item.holderEmail,
      title: item.title,
      type: item.type,
      institutionId: institution.id,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      description: item.description,
      gradeOrScore: item.gradeOrScore,
      signatoryName: item.signatoryName,
      signatoryTitle: item.signatoryTitle,
    });

    const cert = await prisma.certificate.upsert({
      where: { documentId: item.documentId },
      update: {
        fileHash: recordedHash,
        canonicalHash: item.tamperChecksum ? 'sha256:CORRUPTED_CANONICAL_HASH_8899aabb' : canonicalHash,
        status: item.status,
        revocationReason: (item as any).revocationReason,
        revocationDate: (item as any).revocationDate,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      },
      create: {
        documentId: item.documentId,
        institutionId: institution.id,
        holderId: item.holderId,
        holderName: item.holderName,
        holderEmail: item.holderEmail,
        title: item.title,
        type: item.type,
        description: item.description,
        gradeOrScore: item.gradeOrScore,
        signatoryName: item.signatoryName,
        signatoryTitle: item.signatoryTitle,
        issueDate: new Date(item.issueDate),
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        status: item.status,
        pdfPath: finalFilePath,
        pdfFileName,
        pdfFileSize: pdfBuffer.length,
        fileHash: recordedHash,
        canonicalHash: item.tamperChecksum ? 'sha256:CORRUPTED_CANONICAL_HASH_8899aabb' : canonicalHash,
        revocationReason: (item as any).revocationReason,
        revocationDate: (item as any).revocationDate,
      },
    });

    // Seed events only once; repeated seeds must not duplicate the audit timeline.
    const existingSeedEvents = await prisma.certificateEvent.count({ where: { certificateId: cert.id } });
    if (existingSeedEvents === 0) {
    await prisma.certificateEvent.create({
      data: {
        certificateId: cert.id,
        action: 'ISSUED',
        actorId: adminUser.id,
        actorName: 'Dr. Rajiv Sharma (Exam Controller)',
        notes: 'Credential formally registered in institutional repository.',
        ipAddress: '14.139.227.12',
      },
    });

    if (item.status === 'REVOKED') {
      await prisma.certificateEvent.create({
        data: {
          certificateId: cert.id,
          action: 'REVOKED',
          actorId: adminUser.id,
          actorName: 'Dr. Rajiv Sharma (Exam Controller)',
          notes: (item as any).revocationReason,
          ipAddress: '14.139.227.12',
        },
      });
    }

    }
    console.log(`[Seed] Seeded ${item.documentId} -> ${item.status} (${recordedHash.slice(0, 20)}...)`);
  }

  // Notice: CS-0000-00000 is intentionally NOT seeded. It tests Rule R3 (NOT_FOUND).
  console.log('[Seed] Notice: CS-0000-00000 is deliberately excluded from DB to test Rule R3 (NOT_FOUND).');
  console.log('[Seed] Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

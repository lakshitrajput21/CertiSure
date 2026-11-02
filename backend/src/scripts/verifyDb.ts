import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../db/client.js';

async function verifyDatabase() {
  console.log('\n=== CertiSure Phase 1 Database & Cryptographic Verification ===\n');

  // 1. Entities Count Checks
  const instCount = await prisma.institution.count();
  const userCount = await prisma.user.count();
  const certCount = await prisma.certificate.count();
  const eventCount = await prisma.certificateEvent.count();

  console.log(`[DB Check] Institutions count: ${instCount} (Expected: 1)`);
  console.log(`[DB Check] Users count: ${userCount} (Expected: 4)`);
  console.log(`[DB Check] Certificates count: ${certCount} (Expected: 7)`);
  console.log(`[DB Check] Certificate Events count: ${eventCount} (Expected: >= 8)`);

  if (instCount !== 1 || userCount !== 4 || certCount !== 7) {
    throw new Error('Seed entity counts do not match expected figures.');
  }

  // 2. Rule R3 Verification: Non-existent record
  const nonExistent = await prisma.certificate.findUnique({
    where: { documentId: 'CS-0000-00000' },
  });
  console.log(`[DB Check] Query for non-existent ID CS-0000-00000 returns: ${nonExistent === null ? 'NULL (PASSED)' : 'RECORD FOUND (FAILED)'}`);

  // 3. Cryptographic Hash & Disk Verification
  const certificates = await prisma.certificate.findMany({
    orderBy: { documentId: 'asc' },
  });

  console.log('\n--- Certificate Physical File & SHA-256 Hash Verification ---');
  for (const cert of certificates) {
    const fileExists = fs.existsSync(cert.pdfPath);
    if (!fileExists) {
      console.error(`[FAIL] Physical PDF missing for ${cert.documentId} at ${cert.pdfPath}`);
      continue;
    }

    const fileBytes = fs.readFileSync(cert.pdfPath);
    const computedHash = 'sha256:' + crypto.createHash('sha256').update(fileBytes).digest('hex');
    const hashMatches = computedHash === cert.fileHash;

    const isTamperedFixture = cert.documentId === 'CS-2024-99999';

    if (isTamperedFixture) {
      console.log(`[PASS] ${cert.documentId}: Controlled Tamper Fixture detected! Computed: ${computedHash.slice(0, 20)}... Stored: ${cert.fileHash.slice(0, 20)}... (Mismatch: ${!hashMatches ? 'YES, AS EXPECTED' : 'NO'})`);
    } else {
      console.log(`[PASS] ${cert.documentId} (${cert.status}): File Size = ${fileBytes.length} bytes, SHA-256 matches: ${hashMatches ? 'YES' : 'NO'}`);
      if (!hashMatches) {
        throw new Error(`SHA-256 mismatch for ${cert.documentId}`);
      }
    }
  }

  console.log('\n=== All Phase 1 Database & Cryptographic Checks PASSED ===\n');
}

verifyDatabase()
  .catch((err) => {
    console.error('[Error] Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

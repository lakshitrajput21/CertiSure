import PDFDocument from 'pdfkit';
import { generateQrCodeBuffer } from './qr.service.js';

export interface CertificatePdfData {
  documentId: string;
  holderName: string;
  title: string;
  type: string;
  institutionName: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string;
  description: string;
  gradeOrScore?: string;
  signatoryName: string;
  signatoryTitle: string;
  verificationBaseUrl?: string;
}

/**
 * Renders an official vector PDF certificate to an in-memory Buffer.
 * Generates exact physical document bytes for SHA-256 cryptographic hashing.
 */
export async function renderServerCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const baseUrl = data.verificationBaseUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify/${data.documentId}`;
  const qrBuffer = await generateQrCodeBuffer(verificationUrl);

  return new Promise<Buffer>((resolve, reject) => {
    // Landscape A4: 841.89 x 595.28 points
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `CertiSure - ${data.documentId}`,
        Author: data.institutionName,
        Subject: data.title,
        Keywords: `certificate, verification, ${data.documentId}`,
        Creator: 'CertiSure Digital Document Verification System',
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const width = 841.89;
    const height = 595.28;

    // Background fill (Crisp off-white / ivory)
    doc.rect(0, 0, width, height).fill('#FCFCFD');

    // Outer Decorative Border (Deep Navy #0B192C)
    doc.lineWidth(4);
    doc.rect(28, 28, width - 56, height - 56).stroke('#0B192C');

    // Inner Decorative Border (Gold #B48232)
    doc.lineWidth(1.2);
    doc.rect(36, 36, width - 72, height - 72).stroke('#B48232');

    // Corner Ornaments
    const cornerSize = 18;
    // Top-Left
    doc.rect(42, 42, cornerSize, cornerSize).lineWidth(0.8).stroke('#B48232');
    // Top-Right
    doc.rect(width - 42 - cornerSize, 42, cornerSize, cornerSize).stroke('#B48232');
    // Bottom-Left
    doc.rect(42, height - 42 - cornerSize, cornerSize, cornerSize).stroke('#B48232');
    // Bottom-Right
    doc.rect(width - 42 - cornerSize, height - 42 - cornerSize, cornerSize, cornerSize).stroke('#B48232');

    // Institution Header
    doc
      .fillColor('#0B192C')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(data.institutionName.toUpperCase(), 0, 68, { align: 'center', width });

    doc
      .fillColor('#64748B')
      .fontSize(9)
      .font('Helvetica')
      .text('ACADEMIC & CREDENTIAL REGISTRY REPOSITORY', 0, 94, { align: 'center', width });

    // Certificate Subtitle
    doc
      .fillColor('#1E3E62')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF ACADEMIC ACHIEVEMENT', 0, 128, { align: 'center', width });

    // Preamble
    doc
      .fillColor('#475569')
      .fontSize(10)
      .font('Helvetica')
      .text('THIS IS TO CERTIFY THAT', 0, 154, { align: 'center', width });

    // Recipient Name
    doc
      .fillColor('#0B192C')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(data.holderName, 0, 178, { align: 'center', width });

    // Decorative underline for candidate name
    doc
      .lineWidth(0.8)
      .moveTo(width / 2 - 140, 208)
      .lineTo(width / 2 + 140, 208)
      .stroke('#CBD5E1');

    // Conferred degree title
    doc
      .fillColor('#475569')
      .fontSize(11)
      .font('Helvetica')
      .text('has successfully completed the requirements for the conferral of', 0, 222, { align: 'center', width });

    doc
      .fillColor('#2563EB')
      .fontSize(17)
      .font('Helvetica-Bold')
      .text(data.title, 0, 244, { align: 'center', width });

    // Description text
    doc
      .fillColor('#334155')
      .fontSize(10)
      .font('Helvetica')
      .text(data.description, width / 2 - 240, 274, {
        align: 'center',
        width: 480,
        lineGap: 3,
      });

    // Honors / Evaluation
    if (data.gradeOrScore) {
      doc
        .fillColor('#0F172A')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Academic Merit / Evaluation: ${data.gradeOrScore}`, 0, 318, { align: 'center', width });
    }

    // Bottom Metadata & Signatures
    const bottomY = 400;

    // Left Column: Dates
    doc.fillColor('#64748B').fontSize(9).font('Helvetica-Bold').text('DATE OF ISSUANCE', 80, bottomY);
    doc.fillColor('#0F172A').fontSize(10).font('Helvetica').text(data.issueDate, 80, bottomY + 14);

    if (data.expiryDate) {
      doc.fillColor('#64748B').fontSize(9).font('Helvetica-Bold').text('VALID THROUGH', 80, bottomY + 34);
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica').text(data.expiryDate, 80, bottomY + 48);
    } else {
      doc.fillColor('#64748B').fontSize(9).font('Helvetica-Bold').text('VALIDITY', 80, bottomY + 34);
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica').text('Lifetime Conferred Credential', 80, bottomY + 48);
    }

    // Center Column: Official Verification QR Code Box
    const qrBoxX = width / 2 - 50;
    const qrBoxY = bottomY - 30;
    doc.image(qrBuffer, qrBoxX, qrBoxY, { width: 100, height: 100 });

    doc
      .fillColor('#2563EB')
      .fontSize(9)
      .font('Courier-Bold')
      .text(data.documentId, 0, qrBoxY + 104, { align: 'center', width });

    doc
      .fillColor('#64748B')
      .fontSize(7.5)
      .font('Helvetica')
      .text('Scan QR or enter ID at official portal to verify authenticity', 0, qrBoxY + 117, { align: 'center', width });

    // Right Column: Signatory
    const signX = width - 260;
    doc.lineWidth(0.8).moveTo(signX, bottomY + 40).lineTo(signX + 180, bottomY + 40).stroke('#94A3B8');

    doc
      .fillColor('#0F172A')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(data.signatoryName, signX, bottomY + 46, { width: 180, align: 'center' });

    doc
      .fillColor('#64748B')
      .fontSize(8.5)
      .font('Helvetica')
      .text(data.signatoryTitle, signX, bottomY + 59, { width: 180, align: 'center' });

    // Legal / Academic Disclaimer Footnote
    doc
      .fillColor('#94A3B8')
      .fontSize(7)
      .font('Helvetica')
      .text(
        'CertiSure Verified Credential | Punjab Engineering College (Deemed to be University) Academic Registry',
        0,
        height - 45,
        { align: 'center', width }
      );

    doc.end();
  });
}

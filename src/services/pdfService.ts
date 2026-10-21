import jsPDF from 'jspdf';
import { Certificate } from '../types/certificate';
import { formatDate } from '../utils/dateUtils';

export class PdfService {
  /**
   * Generates a vector PDF certificate using jsPDF.
   * Labeled clearly with DEMONSTRATION / SPECIMEN indicators.
   */
  async generateCertificatePdf(cert: Certificate): Promise<void> {
    // Landscape A4 dimensions: 297mm x 210mm
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Background surface: clean off-white
    doc.setFillColor(252, 252, 253);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative Borders
    // Outer Border (Deep Navy)
    doc.setDrawColor(11, 25, 44); // #0B192C
    doc.setLineWidth(2.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner Border (Gold/Accent)
    doc.setDrawColor(180, 130, 50); // Gold accent
    doc.setLineWidth(0.8);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

    // Corner Ornaments
    doc.setLineWidth(0.5);
    const cornerSize = 8;
    // Top Left
    doc.rect(15, 15, cornerSize, cornerSize);
    // Top Right
    doc.rect(pageWidth - 15 - cornerSize, 15, cornerSize, cornerSize);
    // Bottom Left
    doc.rect(15, pageHeight - 15 - cornerSize, cornerSize, cornerSize);
    // Bottom Right
    doc.rect(pageWidth - 15 - cornerSize, pageHeight - 15 - cornerSize, cornerSize, cornerSize);

    // Watermark (Faint Demonstration Warning)
    doc.setTextColor(230, 230, 235);
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMONSTRATION DOCUMENT', pageWidth / 2, pageHeight / 2 + 5, {
      align: 'center',
      angle: 25,
    });

    // Institution Header
    doc.setTextColor(11, 25, 44);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(cert.institutionName.toUpperCase(), pageWidth / 2, 32, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('ACADEMIC & CREDENTIAL REGISTRY REPOSITORY', pageWidth / 2, 38, { align: 'center' });

    // Certificate Type / Banner
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 62, 98);
    doc.text('CERTIFICATE OF ACADEMIC ACHIEVEMENT', pageWidth / 2, 54, { align: 'center' });

    // Preamble text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('THIS IS TO CERTIFY THAT', pageWidth / 2, 65, { align: 'center' });

    // Recipient Name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 25, 44);
    doc.text(cert.holderName, pageWidth / 2, 78, { align: 'center' });

    // Underline for name
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 60, 81, pageWidth / 2 + 60, 81);

    // Degree / Program Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('has successfully completed the requirements for', pageWidth / 2, 91, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(cert.title, pageWidth / 2, 102, { align: 'center' });

    // Description text (wrapped)
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(cert.description, 180);
    doc.text(splitDesc, pageWidth / 2, 114, { align: 'center' });

    if (cert.gradeOrScore) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Evaluation / Honors: ${cert.gradeOrScore}`, pageWidth / 2, 128, { align: 'center' });
    }

    // Signatures and Verification section
    const bottomY = 158;

    // Left: Issue Date & Expiry
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ISSUE DATE', 35, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(formatDate(cert.issueDate), 35, bottomY + 6);

    if (cert.expiryDate) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('VALID UNTIL', 35, bottomY + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(formatDate(cert.expiryDate), 35, bottomY + 20);
    }

    // Center: Verification badge / QR box placeholder
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(pageWidth / 2 - 35, bottomY - 12, 70, 36, 2, 2);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('ONLINE VERIFICATION', pageWidth / 2, bottomY - 5, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('courier', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(cert.id, pageWidth / 2, bottomY + 2, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Inspect authenticity on CertiSure Portal', pageWidth / 2, bottomY + 9, { align: 'center' });
    doc.text(`Status: ${cert.status}`, pageWidth / 2, bottomY + 16, { align: 'center' });

    // Right: Authorized Signatory
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 85, bottomY + 2, pageWidth - 25, bottomY + 2);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(cert.signatoryName, pageWidth - 55, bottomY + 8, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(cert.signatoryTitle, pageWidth - 55, bottomY + 14, { align: 'center' });

    // Bottom Footer note
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Digital Fingerprint: ${cert.digitalFingerprint.substring(0, 40)}... | Simulated CertiSure Demonstration Credential`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );

    // Save PDF
    doc.save(`CertiSure-${cert.id}.pdf`);
  }
}

export const pdfService = new PdfService();

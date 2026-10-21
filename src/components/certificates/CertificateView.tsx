import React, { useState, useRef } from 'react';
import { Certificate } from '../../types/certificate';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { pdfService } from '../../services/pdfService';
import { formatDate } from '../../utils/dateUtils';
import { Download, Printer, Share2, Shield, Award, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CertificateViewProps {
  certificate: Certificate;
  onRevokeClick?: () => void;
  showAdminActions?: boolean;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificate,
  onRevokeClick,
  showAdminActions = true,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { role } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await pdfService.generateCertificatePdf(certificate);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/verify/${certificate.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <Badge status={certificate.status} size="md" />
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            ID: {certificate.id}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            icon={copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
          >
            {copied ? 'Link Copied' : 'Share / Copy URL'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer size={14} />}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            icon={<Download size={14} />}
          >
            Download Specimen PDF
          </Button>

          {showAdminActions && role === 'INSTITUTION_ADMIN' && certificate.status === 'VALID' && onRevokeClick && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRevokeClick}
            >
              Revoke Credential
            </Button>
          )}
        </div>
      </div>

      {/* Visual Certificate Card (Printable & Viewable) */}
      <div
        ref={certRef}
        className="relative bg-[#FCFCFD] text-slate-900 rounded-xl border-4 border-navy-900 p-6 sm:p-10 shadow-lg overflow-hidden"
      >
        {/* Inner Gold Frame Border */}
        <div className="absolute inset-3 border-2 border-amber-600/60 pointer-events-none rounded-lg" />
        <div className="absolute inset-4 border border-amber-600/30 pointer-events-none rounded-md" />

        {/* Faint Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] -rotate-12">
          <div className="text-center font-bold tracking-widest text-8xl text-navy-950 uppercase">
            DEMO SPECIMEN
          </div>
        </div>

        {/* Status Stamp if Revoked or Expired */}
        {certificate.status === 'REVOKED' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20 pointer-events-none select-none">
            <div className="border-4 border-dashed border-rose-600 text-rose-600 text-4xl sm:text-6xl font-black px-8 py-3 tracking-widest uppercase opacity-85 rounded-lg bg-rose-50/70">
              REVOKED
            </div>
          </div>
        )}
        {certificate.status === 'EXPIRED' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20 pointer-events-none select-none">
            <div className="border-4 border-dashed border-amber-600 text-amber-600 text-4xl sm:text-6xl font-black px-8 py-3 tracking-widest uppercase opacity-85 rounded-lg bg-amber-50/70">
              EXPIRED
            </div>
          </div>
        )}

        {/* Certificate Body Content */}
        <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          {/* Header Insignia and Institution */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-900 text-amber-400 border-2 border-amber-500/50 shadow-sm">
              <Shield size={28} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-950 uppercase font-sans">
              {certificate.institutionName}
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              Official Academic & Professional Credentials Registry
            </p>
            <div className="w-24 h-0.5 bg-amber-600/70 mx-auto mt-2" />
          </div>

          {/* Certificate Sub-title */}
          <div className="py-2">
            <span className="text-xs sm:text-sm font-serif italic text-slate-600 uppercase tracking-widest">
              This is to certify that
            </span>
            <div className="mt-3">
              <span className="text-2xl sm:text-4xl font-extrabold text-navy-900 tracking-tight underline decoration-amber-500/60 decoration-2 underline-offset-8">
                {certificate.holderName}
              </span>
            </div>
          </div>

          {/* Program / Title */}
          <div className="space-y-2 py-1">
            <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
              has satisfactorily completed all prescribed requirements and is awarded the credential of
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700 tracking-tight font-sans">
              {certificate.title}
            </h2>
            <div className="inline-block px-3 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-200">
              {certificate.type}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">
            {certificate.description}
          </p>

          {/* Honors or Grade */}
          {certificate.gradeOrScore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Award size={14} className="text-amber-600" />
              <span>{certificate.gradeOrScore}</span>
            </div>
          )}

          {/* Bottom Grid: Issue Date, QR Code, Signature */}
          <div className="pt-8 border-t border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-left">
            {/* Left: Dates & Status */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                  Issue Date
                </span>
                <span className="text-slate-800 font-medium">{formatDate(certificate.issueDate)}</span>
              </div>
              {certificate.expiryDate && (
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                    Expiry Date
                  </span>
                  <span className="text-slate-800 font-medium">{formatDate(certificate.expiryDate)}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                  Registry Status
                </span>
                <span className="font-semibold text-slate-900">{certificate.status}</span>
              </div>
            </div>

            {/* Center: QR Code & Verification link */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <QRCodeDisplay certificateId={certificate.id} size={90} showLinkCopy={false} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Scan to Verify
              </span>
            </div>

            {/* Right: Signature */}
            <div className="text-right space-y-1">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic text-lg text-navy-900 tracking-wide">
                  {certificate.signatoryName}
                </span>
              </div>
              <div className="w-36 h-0.5 bg-slate-300 ml-auto" />
              <div className="text-xs font-semibold text-slate-800">
                {certificate.signatoryName}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {certificate.signatoryTitle}
              </div>
            </div>
          </div>

          {/* Specimen Notice Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
            <span>
              CertiSure Digital Fingerprint:{' '}
              <span className="font-mono">{certificate.digitalFingerprint.substring(0, 32)}...</span>
            </span>
            <span className="italic">
              Simulated Frontend Demonstration Credential — Not a Legal Instrument
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

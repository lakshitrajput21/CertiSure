import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verificationService } from '../services/verificationService';
import { VerificationResult } from '../types/verification';
import { VerificationBanner } from '../components/certificates/VerificationBanner';
import { CertificateView } from '../components/certificates/CertificateView';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/dateUtils';
import {
  Search,
  ShieldCheck,
  QrCode,
  FileText,
  Building2,
  Calendar,
  User,
  Info,
  HelpCircle,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState(id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showFullCertificate, setShowFullCertificate] = useState(false);

  // Quick preset test IDs
  const presets = [
    { id: 'CS-2024-88491', label: 'Valid Degree (Lakshit Rajput)', status: 'VALID' },
    { id: 'CS-2024-88492', label: 'Valid Degree (Agampal Singh)', status: 'VALID' },
    { id: 'CS-2023-41092', label: 'Revoked Credential', status: 'REVOKED' },
    { id: 'CS-2022-10482', label: 'Expired License', status: 'EXPIRED' },
    { id: 'CS-2024-99999', label: 'Tampered Credential (Integrity Failed)', status: 'INTEGRITY_FAILED' },
    { id: 'CS-0000-00000', label: 'Non-Existent Record', status: 'NOT_FOUND' },
  ];

  const performVerification = async (certId: string, method: any = 'DIRECT_SEARCH') => {
    if (!certId.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      // Simulate network verification delay (500ms)
      await new Promise((r) => setTimeout(r, 500));
      const verificationData = await verificationService.verifyCertificate(certId.trim(), method);
      setResult(verificationData);
    } catch (err) {
      console.error('Verification error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setInputQuery(id);
      performVerification(id, 'URL_LOOKUP');
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    navigate(`/verify/${encodeURIComponent(inputQuery.trim().toUpperCase())}`);
  };

  const handlePresetClick = (presetId: string) => {
    setInputQuery(presetId);
    navigate(`/verify/${presetId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <ShieldCheck size={14} />
          <span>Public Credential Verification Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
          Verify Certificate Authenticity
        </h1>
        <p className="text-slate-600 text-sm">
          Enter the unique Certificate ID or simulate a QR scan to query the official institutional
          registry.
        </p>
      </div>

      {/* Search Input Box */}
      <Card className="p-4 sm:p-6 shadow-md border-slate-300">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CS-2024-88491)"
              icon={<Search size={18} />}
              className="text-base font-mono uppercase"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="sm:w-36 font-semibold"
          >
            Verify Status
          </Button>
        </form>

        {/* Evaluation Presets Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <QrCode size={13} />
              <span>Simulate QR Scan / Test Presets:</span>
            </span>
            <span className="text-[11px] text-slate-400">Click to run instant lookup</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-all text-left flex items-center gap-2 ${
                  inputQuery.toUpperCase() === preset.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{preset.id}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                    preset.status === 'VALID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : preset.status === 'REVOKED'
                      ? 'bg-rose-100 text-rose-800'
                      : preset.status === 'EXPIRED'
                      ? 'bg-amber-100 text-amber-800'
                      : preset.status === 'INTEGRITY_FAILED'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {preset.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 animate-spin">
            <ShieldCheck size={36} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Querying Institutional Registry...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Checking document hash integrity, validity thresholds, and revocation databases.
          </p>
        </Card>
      )}

      {/* Verification Result Display */}
      {!isLoading && result && (
        <div className="space-y-6">
          {/* Result Banner */}
          <VerificationBanner
            outcome={result.outcome}
            searchedId={result.searchedId}
            verifiedAt={result.verifiedAt}
            tamperDetails={result.tamperDetails}
            revocationReason={result.certificate?.revocationReason}
            revocationDate={result.certificate?.revocationDate}
          />

          {/* If Certificate Record exists */}
          {result.certificate && (
            <Card className="overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Official Public Registry Record
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {result.certificate.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={result.certificate.status} size="md" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullCertificate(!showFullCertificate)}
                    icon={<FileText size={14} />}
                  >
                    {showFullCertificate ? 'Hide Visual Specimen' : 'View Visual Specimen'}
                  </Button>
                </div>
              </div>

              {/* Public verification metadata grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    <span>Candidate / Holder Name</span>
                  </div>
                  <div className="font-bold text-slate-900 text-base">
                    {result.certificate.holderName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Registration ID: {result.certificate.id}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400" />
                    <span>Issuing Institution</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {result.certificate.institutionName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Authority Code: {result.certificate.institutionId}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Issuance & Validity</span>
                  </div>
                  <div className="text-slate-800">
                    Issued: <strong>{formatDate(result.certificate.issueDate)}</strong>
                  </div>
                  <div className="text-xs text-slate-500">
                    {result.certificate.expiryDate
                      ? `Valid Through: ${formatDate(result.certificate.expiryDate)}`
                      : 'Lifetime Validity (Academic Conferred)'}
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-3 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-600">Simulated Digital Fingerprint:</span>
                    <p className="font-mono text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200 break-all">
                      {result.certificate.digitalFingerprint}
                    </p>
                  </div>
                  <div className="shrink-0 text-slate-400 text-right">
                    Verified via: <strong className="text-slate-700">{result.method}</strong>
                  </div>
                </div>
              </div>

              {/* Full visual certificate toggle section */}
              {showFullCertificate && (
                <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/50">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span>Visual Certificate Specimen View</span>
                  </h4>
                  <CertificateView
                    certificate={result.certificate}
                    showAdminActions={false}
                  />
                </div>
              )}
            </Card>
          )}

          {/* Not Found State Card */}
          {result.outcome === 'NOT_FOUND' && (
            <Card className="p-8 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500">
                <HelpCircle size={36} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No Certificate Record Found for "{result.searchedId}"
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Please double-check the entered Certificate ID for typographical errors. IDs must match
                the institutional format (e.g. <span className="font-mono font-bold">CS-2024-88491</span>).
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputQuery('CS-2024-88491')}
                >
                  Load Sample Valid ID
                </Button>
              </div>
            </Card>
          )}

          {/* Disclaimer Box */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-800">Verification Demonstration Notice:</span>
              <p>
                The outcome displayed is computed from local mock test records stored in the CertiSure
                frontend demonstration client. In a production environment, verification queries will
                execute against an institutional registry API backed by tamper-evident digital signatures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State before any search */}
      {!isLoading && !result && (
        <Card className="p-10 text-center space-y-3 border-dashed">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Awaiting Verification Query
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter a certificate registration ID in the search field above or click one of the test
            sample presets to view the simulated verification result.
          </p>
        </Card>
      )}
    </div>
  );
};

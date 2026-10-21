import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCertificates } from '../../context/CertificateContext';
import { CertificateView } from '../../components/certificates/CertificateView';
import { AuditTimeline } from '../../components/certificates/AuditTimeline';
import { RevokeModal } from '../../components/certificates/RevokeModal';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { formatDateTime } from '../../utils/dateUtils';
import {
  ArrowLeft,
  ShieldCheck,
  Ban,
} from 'lucide-react';

export const CertificateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { certificates, revokeCertificate } = useCertificates();

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  const certificate = certificates.find(
    (c) => c.id.toUpperCase() === id?.trim().toUpperCase()
  );

  if (!certificate) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Certificate Record Not Found</h2>
        <p className="text-sm text-slate-500">
          The certificate ID "{id}" does not exist in the institutional registry.
        </p>
        <Link to="/institution/certificates">
          <Button variant="primary" size="sm" icon={<ArrowLeft size={14} />}>
            Back to Certificate Registry
          </Button>
        </Link>
      </div>
    );
  }

  const handleRevokeConfirm = async (reason: string) => {
    await revokeCertificate(certificate.id, reason);
    setIsRevokeModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/institution/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Certificate Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to={`/verify/${certificate.id}`}>
            <Button variant="outline" size="sm" icon={<ShieldCheck size={14} />}>
              Open Public Verification URL
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Certificate Visual Specimen + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Certificate Document Specimen (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <CertificateView
            certificate={certificate}
            onRevokeClick={() => setIsRevokeModalOpen(true)}
            showAdminActions={true}
          />

          {/* Metadata Card */}
          <Card>
            <CardHeader
              title="Registry Metadata & Integrity Parameters"
              subtitle="Machine-verifiable parameters stored in repository record"
            />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Certificate ID</span>
                  <span className="font-mono text-slate-900 font-bold">{certificate.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Candidate Email</span>
                  <span className="text-slate-900">{certificate.holderEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Issuing Authority</span>
                  <span className="text-slate-900">{certificate.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Date Created In System</span>
                  <span className="text-slate-900">{formatDateTime(certificate.createdAt)}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold uppercase block">Cryptographic Hash</span>
                  <span className="font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 block break-all mt-1">
                    {certificate.digitalFingerprint}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Timeline Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader
              title="Lifecycle Audit Trail"
              subtitle="Chronological log of all recorded events"
            />
            <CardContent>
              <AuditTimeline events={certificate.auditTrail} />
            </CardContent>
          </Card>

          {certificate.status === 'VALID' && (
            <Card className="p-4 bg-rose-50/50 border-rose-200">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Ban size={14} className="text-rose-600" />
                <span>Administrative Revocation</span>
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed mb-3">
                Revoking this credential will immediately update the centralized registry. All future
                verification queries will flag this document as REVOKED.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setIsRevokeModalOpen(true)}
              >
                Initiate Revocation
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Revocation Confirmation Modal */}
      <RevokeModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        certificateId={certificate.id}
        holderName={certificate.holderName}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  );
};

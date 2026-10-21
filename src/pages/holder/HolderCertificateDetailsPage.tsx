import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCertificates } from '../../context/CertificateContext';
import { CertificateView } from '../../components/certificates/CertificateView';
import { QRCodeDisplay } from '../../components/certificates/QRCodeDisplay';
import { AuditTimeline } from '../../components/certificates/AuditTimeline';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const HolderCertificateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { certificates } = useCertificates();

  const certificate = certificates.find(
    (c) => c.id.toUpperCase() === id?.trim().toUpperCase()
  );

  if (!certificate) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Certificate Not Found</h2>
        <p className="text-sm text-slate-500">
          We could not locate this certificate record in your locker.
        </p>
        <Link to="/holder/dashboard">
          <Button variant="primary" size="sm" icon={<ArrowLeft size={14} />}>
            Back to My Locker
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/holder/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to My Credentials</span>
        </Link>

        <Link to={`/verify/${certificate.id}`}>
          <Button variant="outline" size="sm" icon={<ShieldCheck size={14} />}>
            Public Verification Portal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Certificate Display (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <CertificateView
            certificate={certificate}
            showAdminActions={false}
          />
        </div>

        {/* QR & Verification Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-2">
              Shareable QR Verification
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scanners will be directed to the official CertiSure verification page.
            </p>
            <QRCodeDisplay certificateId={certificate.id} size={160} showLinkCopy={true} />
          </Card>

          <Card>
            <CardHeader
              title="Official Audit Events"
              subtitle="Recorded registry issuance and verification timestamps"
            />
            <CardContent>
              <AuditTimeline events={certificate.auditTrail} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

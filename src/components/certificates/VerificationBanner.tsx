import React from 'react';
import { VerificationOutcome } from '../../types/verification';
import { OUTCOME_CONFIG } from '../../utils/statusConfig';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, HelpCircle, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

interface VerificationBannerProps {
  outcome: VerificationOutcome;
  searchedId: string;
  verifiedAt?: string;
  tamperDetails?: string;
  revocationReason?: string;
  revocationDate?: string;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({
  outcome,
  searchedId,
  verifiedAt,
  tamperDetails,
  revocationReason,
  revocationDate,
}) => {
  const config = OUTCOME_CONFIG[outcome];

  const renderIcon = () => {
    switch (config.iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />;
      case 'XCircle':
        return <XCircle size={32} className="text-rose-600 shrink-0" />;
      case 'AlertTriangle':
        return <AlertTriangle size={32} className="text-amber-600 shrink-0" />;
      case 'ShieldAlert':
        return <ShieldAlert size={32} className="text-red-600 shrink-0" />;
      default:
        return <HelpCircle size={32} className="text-slate-500 shrink-0" />;
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 md:p-6 transition-all ${config.bannerBg} ${config.bannerBorder} ${config.bannerText}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-white/80 shadow-sm border border-slate-200/50">
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-bold opacity-75">
                Verification Result
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/60 border border-current/20">
                {searchedId}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              {config.label}
            </h2>
            <p className="text-sm mt-1 max-w-2xl opacity-90 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {verifiedAt && (
          <div className="text-xs opacity-75 flex items-center gap-1.5 shrink-0 self-end sm:self-center bg-white/50 px-3 py-1.5 rounded-lg border border-current/10">
            <Clock size={13} />
            <span>Checked: {formatDateTime(verifiedAt)}</span>
          </div>
        )}
      </div>

      {/* Revocation Details alert */}
      {outcome === 'REVOKED' && (
        <div className="mt-4 pt-4 border-t border-rose-200 text-xs text-rose-900 bg-rose-100/60 p-3 rounded-lg">
          <p className="font-semibold">Official Revocation Notice:</p>
          <p className="mt-1">{revocationReason || 'No specific revocation reason specified in registry.'}</p>
          {revocationDate && (
            <p className="mt-1 text-rose-700 opacity-80">
              Revocation Date: {formatDateTime(revocationDate)}
            </p>
          )}
        </div>
      )}

      {/* Tampering Details alert */}
      {outcome === 'INTEGRITY_FAILED' && (
        <div className="mt-4 pt-4 border-t border-red-300 text-xs text-red-950 bg-red-100/70 p-3 rounded-lg">
          <p className="font-bold flex items-center gap-1">
            <ShieldAlert size={14} className="text-red-700" />
            Security Audit Alert:
          </p>
          <p className="mt-1">
            {tamperDetails ||
              'Simulated Cryptographic Fingerprint Failure: The digital hash generated from the credential payload does not match the authority signature in the registry.'}
          </p>
        </div>
      )}
    </div>
  );
};

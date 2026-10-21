import React from 'react';
import { Link } from 'react-router-dom';
import { VerificationLog } from '../../types/verification';
import { Badge } from '../ui/Badge';
import { formatDateTime } from '../../utils/dateUtils';
import { Card, CardHeader } from '../ui/Card';
import { ArrowRight, QrCode, Search, Globe } from 'lucide-react';

interface RecentVerificationsListProps {
  logs: VerificationLog[];
}

export const RecentVerificationsList: React.FC<RecentVerificationsListProps> = ({ logs }) => {
  const recent = logs.slice(0, 5);

  const getMethodIcon = (method: VerificationLog['method']) => {
    switch (method) {
      case 'QR_CODE':
        return <QrCode size={14} className="text-blue-500" />;
      case 'DIRECT_SEARCH':
        return <Search size={14} className="text-slate-500" />;
      default:
        return <Globe size={14} className="text-emerald-500" />;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Recent Verification Activity"
        subtitle="Simulated public lookups and QR scans across external verifiers"
        action={
          <Link
            to="/institution/verifications"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Log</span>
            <ArrowRight size={14} />
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {recent.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No verification events recorded yet.
          </div>
        ) : (
          recent.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0">
                  {getMethodIcon(log.method)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {log.certificateId}
                    </span>
                    <Badge status={log.outcome} size="sm" />
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {log.certificateTitle || 'Certificate Lookup'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{formatDateTime(log.timestamp)}</span>
                    {log.ipLocation && <span>• {log.ipLocation}</span>}
                  </div>
                </div>
              </div>

              <Link
                to={`/verify/${log.certificateId}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                Inspect
              </Link>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

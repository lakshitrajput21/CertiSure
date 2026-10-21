import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { verificationService } from '../../services/verificationService';
import { VerificationLog } from '../../types/verification';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDateTime } from '../../utils/dateUtils';
import {
  Search,
  Filter,
  QrCode,
  Globe,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const VerificationHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');

  useEffect(() => {
    verificationService.getVerificationLogs().then((res) => {
      setLogs(res);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.certificateId.toLowerCase().includes(q) ||
        (log.certificateTitle && log.certificateTitle.toLowerCase().includes(q)) ||
        (log.holderName && log.holderName.toLowerCase().includes(q));

      const matchesOutcome =
        outcomeFilter === 'ALL' || log.outcome === outcomeFilter;

      return matchesQuery && matchesOutcome;
    });
  }, [logs, searchQuery, outcomeFilter]);

  const getMethodBadge = (method: VerificationLog['method']) => {
    switch (method) {
      case 'QR_CODE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <QrCode size={12} />
            <span>QR Scan</span>
          </span>
        );
      case 'URL_LOOKUP':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Globe size={12} />
            <span>URL Lookup</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Search size={12} />
            <span>Portal Search</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Verification Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit history of public and institutional verification queries across credentials.
          </p>
        </div>

        <Link to="/verify">
          <Button variant="outline" size="sm" icon={<ShieldCheck size={14} />}>
            Run New Verification Query
          </Button>
        </Link>
      </div>

      {/* Demonstration Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold">Simulated Audit Telemetry:</strong>
          All records shown below reflect mock verification queries captured during this session.
          Every query performed on the Public Verification page is recorded here in real time.
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Certificate ID, candidate or title..."
              icon={<Search size={16} />}
              className="py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter size={13} />
              Outcome:
            </span>
            {['ALL', 'VALID', 'REVOKED', 'EXPIRED', 'INTEGRITY_FAILED', 'NOT_FOUND'].map((st) => (
              <button
                key={st}
                onClick={() => setOutcomeFilter(st)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  outcomeFilter === st
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All Outcomes' : st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Verification History Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Timestamp</th>
                <th scope="col" className="px-5 py-3.5">Certificate ID</th>
                <th scope="col" className="px-5 py-3.5">Title & Candidate</th>
                <th scope="col" className="px-5 py-3.5">Method</th>
                <th scope="col" className="px-5 py-3.5">Location (Simulated)</th>
                <th scope="col" className="px-5 py-3.5">Outcome</th>
                <th scope="col" className="px-5 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading audit telemetry...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No verification records matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <Link
                        to={`/verify/${log.certificateId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {log.certificateId}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 max-w-xs truncate">
                        {log.certificateTitle || 'Unknown Document'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {log.holderName || 'Unregistered'}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getMethodBadge(log.method)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {log.ipLocation || 'Localhost Gateway'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge status={log.outcome} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/verify/${log.certificateId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        <span>Verify</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          Total Verification Events Logged: <strong className="text-slate-800">{filteredLogs.length}</strong>
        </div>
      </Card>
    </div>
  );
};

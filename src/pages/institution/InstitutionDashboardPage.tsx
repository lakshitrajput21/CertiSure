import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCertificates } from '../../context/CertificateContext';
import { useAuth } from '../../context/AuthContext';
import { verificationService } from '../../services/verificationService';
import { VerificationLog } from '../../types/verification';
import { StatCard } from '../../components/dashboard/StatCard';
import { IssuanceChart } from '../../components/dashboard/IssuanceChart';
import { StatusPieChart } from '../../components/dashboard/StatusPieChart';
import { RecentIssuancesTable } from '../../components/dashboard/RecentIssuancesTable';
import { RecentVerificationsList } from '../../components/dashboard/RecentVerificationsList';
import { Button } from '../../components/ui/Button';
import {
  Award,
  CheckCircle2,
  FileX2,
  Clock,
  FilePlus2,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const InstitutionDashboardPage: React.FC = () => {
  const { certificates, stats, institution, isLoading } = useCertificates();
  const { user } = useAuth();
  const [logs, setLogs] = useState<VerificationLog[]>([]);

  useEffect(() => {
    verificationService.getVerificationLogs().then(setLogs);
  }, [certificates]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading institution metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Building2 size={15} />
            <span>{institution.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Institutional Registry Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome back, <strong className="text-slate-800">{user?.name || 'Administrator'}</strong>.
            Managing official credentials, verifiable records, and revocation events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/verify">
            <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
              Public Portal
            </Button>
          </Link>
          <Link to="/institution/issue">
            <Button variant="primary" size="sm" icon={<FilePlus2 size={15} />}>
              Issue Certificate
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered"
          value={stats.total}
          change="+12.4%"
          trend="up"
          icon={<Award size={22} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Active & Valid"
          value={stats.active}
          change="+9.1%"
          trend="up"
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Revoked Records"
          value={stats.revoked}
          change="+1"
          trend="down"
          icon={<FileX2 size={22} />}
          iconBg="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Expired Credentials"
          value={stats.expired}
          change="0%"
          trend="neutral"
          icon={<Clock size={22} />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IssuanceChart data={stats.monthlyTrends} />
        </div>
        <div>
          <StatusPieChart data={stats.statusDistribution} />
        </div>
      </div>

      {/* Tables Row: Recent Issuances & Verification Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentIssuancesTable certificates={certificates} />
        </div>
        <div>
          <RecentVerificationsList logs={logs} />
        </div>
      </div>
    </div>
  );
};

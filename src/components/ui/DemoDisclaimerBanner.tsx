import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCertificates } from '../../context/CertificateContext';
import { UserCheck, RotateCcw } from 'lucide-react';

export const DemoDisclaimerBanner: React.FC = () => {
  const { user, role, switchDemoUser, demoUsers } = useAuth();
  const { resetAllDemoData } = useCertificates();

  return (
    <div className="bg-navy-900 border-b border-navy-800 text-slate-300 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold tracking-wider uppercase border border-blue-400/30">
            Frontend Prototype
          </span>
          <span className="text-slate-300 font-medium">
            CertiSure Academic SE Project — Local Mock Data & Simulated Verification
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-slate-300">
          <div className="flex items-center gap-1.5 bg-navy-800/80 px-2.5 py-1 rounded-md border border-navy-700">
            <UserCheck size={12} className="text-blue-400" />
            <span>Role:</span>
            <span className="text-white font-semibold capitalize">
              {role === 'INSTITUTION_ADMIN'
                ? 'Admin (PEC)'
                : role === 'CERTIFICATE_HOLDER'
                ? 'Holder'
                : 'Public Verifier'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] hidden lg:inline">Quick Switch:</span>
            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => switchDemoUser(u)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors border ${
                  user?.id === u.id
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-navy-800 text-slate-300 hover:text-white border-navy-700 hover:border-slate-500'
                }`}
                title={`Switch demo persona to ${u.name} (${u.role})`}
              >
                {u.name.split(' ')[0]} ({u.role === 'INSTITUTION_ADMIN' ? 'Admin' : u.role === 'CERTIFICATE_HOLDER' ? 'Holder' : 'Verifier'})
              </button>
            ))}
          </div>

          <button
            onClick={() => resetAllDemoData()}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white ml-2 transition-colors"
            title="Reset all mock data to initial samples"
          >
            <RotateCcw size={11} />
            <span>Reset Samples</span>
          </button>
        </div>
      </div>
    </div>
  );
};

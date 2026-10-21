import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Certi<span className="text-blue-400">Sure</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              CertiSure is a digital document verification and certificate lifecycle management
              system designed for academic and professional institutions. Providing verifiable
              tamper-evident records, QR verification, and instant status inspection.
            </p>
            <div className="text-xs text-slate-500 pt-2 border-t border-navy-900">
              <strong className="text-slate-400">Note:</strong> Frontend prototype for academic
              evaluation. Employs mock data and simulated integrity checks.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-white transition-colors">
                  Verify a Certificate
                </Link>
              </li>
              <li>
                <Link to="/institution/dashboard" className="hover:text-white transition-colors">
                  Institution Dashboard
                </Link>
              </li>
              <li>
                <Link to="/institution/certificates" className="hover:text-white transition-colors">
                  Certificate Management
                </Link>
              </li>
              <li>
                <Link to="/verifications" className="hover:text-white transition-colors">
                  Verification History
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Authors / Academic Credits */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              <GraduationCap size={15} className="text-blue-400" />
              <span>Project Authors</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-navy-900/90 p-2.5 rounded-lg border border-navy-800">
                <div className="text-white font-medium">Lakshit Rajput</div>
                <div className="text-slate-400">SID: 24106061</div>
              </div>
              <div className="bg-navy-900/90 p-2.5 rounded-lg border border-navy-800">
                <div className="text-white font-medium">Agampal Singh</div>
                <div className="text-slate-400">SID: 24106036</div>
              </div>
              <div className="text-[11px] text-slate-400">
                Software Engineering Project
                <br />
                <span className="text-slate-300 font-medium">
                  Punjab Engineering College (PEC), Chandigarh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CertiSure. Developed by Lakshit Rajput & Agampal Singh.</p>
          <div className="flex items-center space-x-6">
            <Link to="/verify" className="hover:text-slate-400 transition-colors">
              Public Portal
            </Link>
            <Link to="/login" className="hover:text-slate-400 transition-colors">
              Demo Access
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">PEC Chandigarh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

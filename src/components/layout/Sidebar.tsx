import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  FilePlus2,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  Building2,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCertificates } from '../../context/CertificateContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, role, logout } = useAuth();
  const { institution } = useCertificates();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHolder = role === 'CERTIFICATE_HOLDER';

  const adminLinks = [
    { to: '/institution/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/institution/certificates', label: 'Certificates', icon: Award },
    { to: '/institution/issue', label: 'Issue Certificate', icon: FilePlus2 },
    { to: '/institution/verifications', label: 'Verification History', icon: History },
    { to: '/institution/settings', label: 'Settings', icon: Settings },
  ];

  const holderLinks = [
    { to: '/holder/dashboard', label: 'My Credentials', icon: Award },
    { to: '/verifications', label: 'Verification History', icon: History },
  ];

  const links = isHolder ? holderLinks : adminLinks;

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-navy-900">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-900 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight leading-none">
              Certi<span className="text-blue-400">Sure</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase mt-1">
              {isHolder ? 'Holder Portal' : 'Institution Portal'}
            </div>
          </div>
        </NavLink>
      </div>

      {/* Institution / User Context Card */}
      <div className="p-4 mx-3 my-3 rounded-lg bg-navy-900/80 border border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            {isHolder ? <User size={16} /> : <Building2 size={16} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {isHolder ? user?.name : institution.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {isHolder ? user?.email : institution.code}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          {isHolder ? 'Student Portal' : 'Administration'}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Public Verifier Shortcut */}
        <div className="pt-4 mt-4 border-t border-navy-900">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Public Utilities
          </div>
          <NavLink
            to="/verify"
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-900 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck size={16} />
              <span>Verify Portal</span>
            </span>
            <ExternalLink size={12} className="text-slate-500" />
          </NavLink>
        </div>
      </div>

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-navy-900">
        <div className="flex items-center justify-between p-2 rounded-lg bg-navy-900/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.name || 'Demo User'}</div>
              <div className="text-[10px] text-slate-400 capitalize truncate">{role.replace('_', ' ').toLowerCase()}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-navy-800 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

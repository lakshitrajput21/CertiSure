import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Wordmark */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center shadow-subtle group-hover:bg-blue-600 transition-colors">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-navy-900 flex items-center gap-1">
                  Certi<span className="text-blue-600">Sure</span>
                </span>
                <span className="block text-[10px] text-slate-500 font-medium -mt-1 tracking-wider uppercase">
                  Document Integrity System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/')
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-navy-900 hover:border-slate-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/verify"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/verify')
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-navy-900 hover:border-slate-300'
                }`}
              >
                <Search size={15} className="mr-1.5" />
                Verify Certificate
              </Link>
              <Link
                to="/verifications"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/verifications')
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-navy-900 hover:border-slate-300'
                }`}
              >
                Verification Log
              </Link>
              <Link
                to="/institution/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith('/institution')
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-navy-900 hover:border-slate-300'
                }`}
              >
                For Institutions
              </Link>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === 'CERTIFICATE_HOLDER' ? '/holder/dashboard' : '/institution/dashboard'}
                >
                  <Button variant="outline" size="sm" icon={<LayoutDashboard size={15} />}>
                    {role === 'CERTIFICATE_HOLDER' ? 'My Credentials' : 'Portal Dashboard'}
                  </Button>
                </Link>
                <div className="text-right pl-2 border-l border-slate-200">
                  <div className="text-xs font-semibold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {role === 'INSTITUTION_ADMIN'
                      ? 'PEC Admin'
                      : role === 'CERTIFICATE_HOLDER'
                      ? 'Student / Holder'
                      : 'Public Verifier'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign out of demo session"
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/verify">
                  <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                    Verify Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50"
          >
            Verify Certificate
          </Link>
          <Link
            to="/verifications"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50"
          >
            Verification Log
          </Link>
          <Link
            to="/institution/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50"
          >
            Institution Dashboard
          </Link>
          <Link
            to="/holder/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50"
          >
            Holder Dashboard
          </Link>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-slate-500">
                  Signed in as: <strong className="text-slate-800">{user.name}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign In / Role Access
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

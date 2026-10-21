import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DemoDisclaimerBanner } from '../ui/DemoDisclaimerBanner';
import { ToastContainer } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ShieldCheck, FilePlus2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoDisclaimerBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Modal/Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-950">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Header */}
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="text-sm font-semibold text-slate-900 hidden sm:block">
                {role === 'INSTITUTION_ADMIN' ? 'Institution Registry & Management' : 'Candidate Credential Locker'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {role === 'INSTITUTION_ADMIN' && (
                <Link to="/institution/issue">
                  <Button variant="primary" size="sm" icon={<FilePlus2 size={15} />}>
                    <span className="hidden sm:inline">Issue Certificate</span>
                    <span className="sm:hidden">Issue</span>
                  </Button>
                </Link>
              )}

              <Link to="/verify">
                <Button variant="outline" size="sm" icon={<ShieldCheck size={15} />}>
                  <span className="hidden sm:inline">Verify Credential</span>
                  <span className="sm:hidden">Verify</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

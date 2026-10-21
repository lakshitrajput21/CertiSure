import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 border border-rose-200 shadow-sm">
        <ShieldAlert size={36} />
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-navy-950 tracking-tight">
        404 — Page Not Found
      </h1>

      <p className="mt-3 text-slate-600 text-sm max-w-md">
        The destination URL you navigated to does not exist or may have been relocated within the
        CertiSure platform.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home size={16} />}>
            Return Home
          </Button>
        </Link>
        <Link to="/verify">
          <Button variant="outline" size="md" icon={<Search size={16} />}>
            Verify a Certificate
          </Button>
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldAlert, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, isAuthenticated, isLoading, loginAsDemoRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    const targetRole = allowedRoles[0];
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold text-navy-950">Restricted Route</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This section requires the <strong className="font-semibold">{targetRole}</strong> role.
            Your active demo account is currently configured as{' '}
            <strong className="font-semibold capitalize">{role.toLowerCase().replace('_', ' ')}</strong>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => loginAsDemoRole(targetRole)}
              icon={<UserCheck size={14} />}
            >
              Switch to {targetRole === 'INSTITUTION_ADMIN' ? 'Institution Admin' : 'Certificate Holder'} Persona
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Simulated frontend role check for evaluation purposes.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

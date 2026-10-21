import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  User,
  Search,
  AlertCircle,
  Lock,
  Mail,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsDemoRole } = useAuth();

  const [email, setEmail] = useState('admin@pec.edu.in');
  const [password, setPassword] = useState('demo-password-123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please provide a password.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'CERTIFICATE_HOLDER') {
        navigate('/holder/dashboard');
      } else {
        navigate('/institution/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const user = await loginAsDemoRole(role);
      if (user.role === 'CERTIFICATE_HOLDER') {
        navigate('/holder/dashboard');
      } else {
        navigate('/institution/dashboard');
      }
    } catch (err: any) {
      setError('Failed to switch demo role.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center shadow-subtle group-hover:bg-blue-600 transition-colors">
            <ShieldCheck size={26} />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Sign In to CertiSure
        </h2>
        <p className="text-xs text-slate-500">
          Digital Document Verification & Certificate Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 shadow-card border-slate-200">
          {/* Security / Prototype Notice */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
            <Info size={16} className="shrink-0 text-blue-600 mt-0.5" />
            <div>
              <strong className="block font-semibold">Demo Authentication Notice:</strong>
              This is a frontend demonstration. You can sign in using any mock credentials or click
              one of the 1-click demo role personas below.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                icon={<Mail size={16} />}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                icon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert(
                    'Demo Notice: In this frontend prototype, passwords are not stored or managed on a backend. Select any demo persona below.'
                  )
                }
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold"
              isLoading={isLoading}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* 1-Click Demo Personas */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select a Demo Role Persona
              </span>
            </div>

            <div className="space-y-2">
              {/* Institution Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoRole('INSTITUTION_ADMIN')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      Institution Administrator
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dr. Rajiv Sharma (admin@pec.edu.in)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-600">Enter &rarr;</span>
              </button>

              {/* Certificate Holder */}
              <button
                type="button"
                onClick={() => handleQuickDemoRole('CERTIFICATE_HOLDER')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Certificate Holder
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Lakshit Rajput (lakshit.rajput@pec.edu.in)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">Enter &rarr;</span>
              </button>

              {/* Public Verifier */}
              <button
                type="button"
                onClick={() => handleQuickDemoRole('PUBLIC_VERIFIER')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-100 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Search size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-slate-900">
                      Public Verifier / Screener
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sarah Jenkins (verifier@globaltalent.org)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">Enter &rarr;</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

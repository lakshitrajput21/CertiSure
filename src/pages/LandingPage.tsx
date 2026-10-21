import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  QrCode,
  FileX2,
  ShieldAlert,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/verify/${encodeURIComponent(searchId.trim().toUpperCase())}`);
  };

  const sampleTestCertificates = [
    { id: 'CS-2024-88491', status: 'VALID', label: 'Valid Degree (Lakshit Rajput)' },
    { id: 'CS-2024-88492', status: 'VALID', label: 'Valid Degree (Agampal Singh)' },
    { id: 'CS-2023-41092', status: 'REVOKED', label: 'Revoked Diploma' },
    { id: 'CS-2022-10482', status: 'EXPIRED', label: 'Expired License' },
    { id: 'CS-2024-99999', status: 'INTEGRITY_FAILED', label: 'Integrity Check Failed' },
  ];

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Project Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck size={16} />
              <span>Institutional Certificate Management & Verification</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-navy-950 tracking-tight leading-tight">
              Trust Every <span className="text-blue-600">Credential.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              CertiSure helps educational and professional institutions issue digital certificates
              with verifiable metadata, and empowers verifiers to instantly inspect their validity
              status in real time.
            </p>

            {/* Verification Search Bar in Hero */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl border-2 border-slate-300 shadow-card focus-within:border-blue-600 transition-colors"
              >
                <div className="relative flex-1 w-full flex items-center pl-3">
                  <Search size={20} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. CS-2024-88491)"
                    className="w-full py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none uppercase font-mono"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto px-6 py-3 font-semibold"
                  icon={<ArrowRight size={16} />}
                >
                  Verify Certificate
                </Button>
              </form>

              {/* Quick sample chips for evaluation */}
              <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
                <span className="text-slate-500 font-medium">Try Sample Credentials:</span>
                {sampleTestCertificates.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => navigate(`/verify/${sample.id}`)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-mono text-[11px]"
                  >
                    {sample.id} ({sample.status})
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/verify">
                <Button variant="secondary" size="lg" icon={<Search size={18} />}>
                  Open Full Verification Portal
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" icon={<Building2 size={18} />}>
                  Institution Portal Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-2">
              Workflow Overview
            </h2>
            <h3 className="text-3xl font-bold text-navy-950 tracking-tight">
              How CertiSure Works
            </h3>
            <p className="text-slate-600 mt-3 text-sm">
              A straightforward three-step credential lifecycle connecting institutions, candidates,
              and background screeners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-subtle hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 border border-blue-100">
                1
              </div>
              <h4 className="text-lg font-bold text-navy-950 mb-2">Issue a Certificate</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Authorized educational administrators input candidate records and generate an official
                digital certificate with a unique registry identifier and tamper-evident metadata.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-subtle hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 border border-blue-100">
                2
              </div>
              <h4 className="text-lg font-bold text-navy-950 mb-2">Share Securely</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Credential recipients receive their official credential link and embedded high-density
                QR code to share with potential employers, universities, and verification agencies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-subtle hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 border border-blue-100">
                3
              </div>
              <h4 className="text-lg font-bold text-navy-950 mb-2">Verify Instantly</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Verifiers scan the QR code or enter the certificate ID to instantly receive an
                official status report showing whether the credential is Valid, Revoked, or Expired.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Section */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-2">
              Enterprise Features
            </h2>
            <h3 className="text-3xl font-bold text-navy-950 tracking-tight">
              Designed for Credential Integrity
            </h3>
            <p className="text-slate-600 mt-3 text-sm">
              Robust tools engineered to replace slow manual credential inquiries with instant,
              reliable digital status verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: QR Verification */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <QrCode size={22} />
              </div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">QR-Based Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every certificate embeds a unique QR code directing scanners to its official registry
                record for rapid mobile inspection.
              </p>
            </div>

            {/* Feature 2: Lifecycle Status Tracking */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle2 size={22} />
              </div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">Status Tracking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear distinction between Valid, Expired, and Suspended records so relying parties
                always have up-to-date credential standing.
              </p>
            </div>

            {/* Feature 3: Revocation Support */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <FileX2 size={22} />
              </div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">Revocation Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Institutions can revoke compromised or fraudulent credentials with formal justification,
                immediately alerting subsequent verifiers.
              </p>
            </div>

            {/* Feature 4: Document Integrity Checks */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <ShieldAlert size={22} />
              </div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">Integrity Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulated cryptographic fingerprints ensure that tampered or falsified document hashes
                trigger clear warnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional CTA Strip */}
      <section className="py-14 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to test certificate issuance and verification?
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Experience the complete demo with preloaded Punjab Engineering College credentials,
            or sign in as an institution administrator to issue a new certificate.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/verify/CS-2024-88491">
              <Button variant="primary" size="md">
                Test Valid Credential (CS-2024-88491)
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="md" className="bg-transparent text-white border-white/40 hover:bg-white/10">
                Explore Demo Logins
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCertificates } from '../../context/CertificateContext';
import { CertificateType, CertificateIssueInput } from '../../types/certificate';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CertificateView } from '../../components/certificates/CertificateView';
import { generateCertificateId, generateFingerprint } from '../../utils/idGenerator';
import {
  FilePlus2,
  CheckCircle2,
  Eye,
  Building2,
  User,
  Award,
} from 'lucide-react';

const CERTIFICATE_TYPES: { value: CertificateType; label: string }[] = [
  { value: 'Degree', label: 'Degree (Bachelor / Master / Doctorate)' },
  { value: 'Diploma', label: 'Postgraduate / Vocational Diploma' },
  { value: 'Course Completion', label: 'Course Completion Credential' },
  { value: 'Academic Merit', label: 'Academic Merit & Honors Award' },
  { value: 'Professional License', label: 'Professional Practice License' },
  { value: 'Internship Credential', label: 'Internship / Capstone Certificate' },
];

export const IssueCertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const { institution, issueCertificate } = useCertificates();

  const today = new Date().toISOString().split('T')[0];

  // Temporary ID generated for preview
  const [previewId] = useState(() => generateCertificateId());

  // Form State
  const [formData, setFormData] = useState<CertificateIssueInput>({
    holderName: '',
    holderEmail: '',
    title: '',
    type: 'Degree',
    issueDate: today,
    expiryDate: '',
    description: '',
    gradeOrScore: '',
    signatoryName: institution.defaultSignatoryName,
    signatoryTitle: institution.defaultSignatoryTitle,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState<any | null>(null);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.holderName.trim()) {
      newErrors.holderName = 'Candidate name is required.';
    }

    if (!formData.holderEmail.trim()) {
      newErrors.holderEmail = 'Candidate email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.holderEmail.trim())) {
      newErrors.holderEmail = 'Please provide a valid email address.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Certificate title or degree program is required.';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (formData.expiryDate && formData.expiryDate < formData.issueDate) {
      newErrors.expiryDate = 'Expiry date cannot precede the issue date.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Achievement summary or conferral text is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate cryptographic calculation latency
      await new Promise((r) => setTimeout(r, 600));

      const newCert = await issueCertificate(formData);
      setIssuedCertificate(newCert);
    } catch (err: any) {
      console.error('Issuance failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct real-time preview certificate object
  const previewCertificate = {
    id: previewId,
    holderName: formData.holderName || 'Candidate Full Name',
    holderEmail: formData.holderEmail || 'candidate@domain.com',
    title: formData.title || 'Degree or Credential Title',
    type: formData.type,
    institutionName: institution.name,
    institutionId: institution.id,
    issueDate: formData.issueDate || today,
    expiryDate: formData.expiryDate || undefined,
    status: 'VALID' as const,
    description:
      formData.description ||
      'Conferred upon the candidate for satisfactorily completing the required academic coursework and university examinations.',
    gradeOrScore: formData.gradeOrScore || 'First Class with Distinction',
    signatoryName: formData.signatoryName || institution.defaultSignatoryName,
    signatoryTitle: formData.signatoryTitle || institution.defaultSignatoryTitle,
    digitalFingerprint: generateFingerprint(`${previewId}:${formData.holderName}:${formData.title}`),
    auditTrail: [],
    createdAt: new Date().toISOString(),
  };

  // If already successfully issued, show success screen
  if (issuedCertificate) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">
                Credential Issued & Registered Successfully!
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Certificate ID <strong className="font-mono">{issuedCertificate.id}</strong> is now
                active and instantly verifiable across the public portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIssuedCertificate(null);
                setFormData({
                  holderName: '',
                  holderEmail: '',
                  title: '',
                  type: 'Degree',
                  issueDate: today,
                  expiryDate: '',
                  description: '',
                  gradeOrScore: '',
                  signatoryName: institution.defaultSignatoryName,
                  signatoryTitle: institution.defaultSignatoryTitle,
                });
              }}
            >
              Issue Another
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/institution/certificates/${issuedCertificate.id}`)}
            >
              Manage Record
            </Button>
          </div>
        </div>

        <CertificateView certificate={issuedCertificate} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Issue Official Credential
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Register a new academic award or certificate. Live preview updates as you input candidate details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <User size={15} className="text-blue-600" />
                <span>Candidate Information</span>
              </h3>

              <Input
                label="Candidate Full Name"
                value={formData.holderName}
                onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                placeholder="e.g. Vikramaditya Rathore"
                error={errors.holderName}
                required
              />

              <Input
                label="Candidate Email Address"
                type="email"
                value={formData.holderEmail}
                onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                placeholder="candidate@pec.edu.in"
                error={errors.holderEmail}
                required
              />

              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider pt-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Award size={15} className="text-blue-600" />
                <span>Credential Specifics</span>
              </h3>

              <Input
                label="Certificate / Program Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Bachelor of Technology in Electrical Engineering"
                error={errors.title}
                required
              />

              <Select
                label="Credential Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CertificateType })
                }
                options={CERTIFICATE_TYPES}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Conferral / Issue Date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  error={errors.issueDate}
                  required
                />

                <Input
                  label="Expiration Date (Optional)"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  error={errors.expiryDate}
                  helperText="Leave empty for lifetime"
                />
              </div>

              <Input
                label="Evaluation, Honors or CGPA"
                value={formData.gradeOrScore}
                onChange={(e) => setFormData({ ...formData, gradeOrScore: e.target.value })}
                placeholder="e.g. CGPA: 9.20 / 10.00 (First Class with Distinction)"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Conferral Description / Achievement Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Conferred by the Senate of Punjab Engineering College upon satisfying all graduation requirements..."
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                  required
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.description}</p>
                )}
              </div>

              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider pt-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 size={15} className="text-blue-600" />
                <span>Authority Signatory</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Signatory Name"
                  value={formData.signatoryName}
                  onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                />
                <Input
                  label="Signatory Title"
                  value={formData.signatoryTitle}
                  onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-semibold"
                  isLoading={isSubmitting}
                  icon={<FilePlus2 size={16} />}
                >
                  Publish & Register Credential
                </Button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Simulated local mock registration with auto-generated ID & QR verification link.
                </p>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Preview Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} className="text-blue-600" />
              <span>Real-Time Certificate Specimen Preview</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Draft ID: {previewId}
            </span>
          </div>

          <div className="sticky top-20">
            <CertificateView
              certificate={previewCertificate}
              showAdminActions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

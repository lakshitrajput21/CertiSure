import React, { useState } from 'react';
import { useCertificates } from '../../context/CertificateContext';
import { InstitutionProfile } from '../../types/institution';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Building2, MapPin, UserCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export const InstitutionSettingsPage: React.FC = () => {
  const { institution, updateInstitution, resetAllDemoData } = useCertificates();

  const [formData, setFormData] = useState<InstitutionProfile>({ ...institution });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Institution name is required.';
    if (!formData.contactEmail.trim()) {
      errs.contactEmail = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
      errs.contactEmail = 'Valid email is required.';
    }
    if (!formData.defaultSignatoryName.trim()) {
      errs.defaultSignatoryName = 'Default signatory name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setSuccessMsg(false);
    try {
      await updateInstitution(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Institution Profile & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure default signatory parameters, contact information, and public portal details.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Profile configuration saved and persisted to local mock storage!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Profile Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Institutional Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Institution Legal Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />
            </div>

            <Input
              label="Institutional Short Code / Acronym"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. PEC-CHD"
            />

            <Input
              label="Accreditation Identifier"
              value={formData.accreditationId}
              onChange={(e) => setFormData({ ...formData, accreditationId: e.target.value })}
              placeholder="e.g. NAAC-A-PLUS-2023-9918"
            />
          </div>
        </Card>

        {/* Default Authority Signatory Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Default Authority Signatory
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            These parameters will pre-fill new certificate issuances automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Signatory Full Name"
              value={formData.defaultSignatoryName}
              onChange={(e) => setFormData({ ...formData, defaultSignatoryName: e.target.value })}
              error={errors.defaultSignatoryName}
              required
            />

            <Input
              label="Signatory Official Title / Designation"
              value={formData.defaultSignatoryTitle}
              onChange={(e) => setFormData({ ...formData, defaultSignatoryTitle: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Contact & Address Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Public Contact & Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Verification Inquiries Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              error={errors.contactEmail}
              required
            />

            <Input
              label="Registry Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Official Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />

            <Input
              label="Campus Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Input
              label="State / Union Territory"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </Card>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Restore initial sample institution settings?')) {
                resetAllDemoData();
                setFormData(institution);
              }
            }}
            icon={<RotateCcw size={14} />}
          >
            Reset Default Settings
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="font-semibold px-6"
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  holderName: string;
  onConfirm: (reason: string) => Promise<void>;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({
  isOpen,
  onClose,
  certificateId,
  holderName,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide an official justification for revoking this credential.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Credential"
      description="Initiate administrative revocation of an issued digital certificate."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Alert */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-600 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-semibold">Irreversible Simulated Action:</strong>
            Revoking certificate <span className="font-mono font-bold">{certificateId}</span> for{' '}
            <span className="font-bold">{holderName}</span> will immediately flag it as REVOKED across
            the system. Public verifiers scanning this certificate will see a REVOKED banner.
          </div>
        </div>

        <div>
          <label
            htmlFor="revoke-reason"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Revocation Reason / Administrative Order Number <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="revoke-reason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Administrative order #2024-DB-12 regarding submission of fraudulent prerequisite documentation..."
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-900"
            required
          />
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
            Confirm & Revoke Credential
          </Button>
        </div>
      </form>
    </Modal>
  );
};

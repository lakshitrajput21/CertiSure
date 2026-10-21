import React from 'react';
import { useCertificates } from '../../context/CertificateContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCertificates();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="text-blue-500 shrink-0" size={18} />;
        let borderClass = 'border-blue-200 bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />;
          borderClass = 'border-emerald-200 bg-emerald-50/70';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="text-rose-500 shrink-0" size={18} />;
          borderClass = 'border-rose-200 bg-rose-50/70';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
          borderClass = 'border-amber-200 bg-amber-50/70';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-dropdown flex items-start gap-3 transition-all duration-200 ${borderClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-600 mt-1">{toast.message}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { CertificateStatus } from '../../types/certificate';
import { STATUS_CONFIG } from '../../utils/statusConfig';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, HelpCircle } from 'lucide-react';

interface BadgeProps {
  status?: CertificateStatus | 'NOT_FOUND';
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  variant,
  size = 'sm',
  showIcon = true,
}) => {
  if (status) {
    const config = STATUS_CONFIG[status as CertificateStatus] || {
      label: status,
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-300',
      iconName: 'HelpCircle' as const,
    };

    const renderIcon = () => {
      const iconSize = size === 'sm' ? 12 : 14;
      switch (config.iconName) {
        case 'CheckCircle2':
          return <CheckCircle2 size={iconSize} className="mr-1 text-emerald-600" />;
        case 'AlertTriangle':
          return <AlertTriangle size={iconSize} className="mr-1 text-amber-600" />;
        case 'XCircle':
          return <XCircle size={iconSize} className="mr-1 text-rose-600" />;
        case 'ShieldAlert':
          return <ShieldAlert size={iconSize} className="mr-1 text-red-600" />;
        default:
          return <HelpCircle size={iconSize} className="mr-1 text-slate-500" />;
      }
    };

    return (
      <span
        className={`inline-flex items-center font-medium border rounded-full ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        } ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
      >
        {showIcon && renderIcon()}
        {label || config.label}
      </span>
    );
  }

  // Variant-based styling fallback
  let classes = 'bg-slate-100 text-slate-700 border-slate-200';
  if (variant === 'success') classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (variant === 'warning') classes = 'bg-amber-50 text-amber-700 border-amber-200';
  if (variant === 'danger') classes = 'bg-rose-50 text-rose-700 border-rose-200';
  if (variant === 'info') classes = 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${classes}`}
    >
      {label}
    </span>
  );
};

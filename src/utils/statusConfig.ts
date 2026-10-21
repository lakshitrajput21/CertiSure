import { CertificateStatus } from '../types/certificate';
import { VerificationOutcome } from '../types/verification';

export interface StatusUIConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  bannerBg: string;
  bannerBorder: string;
  bannerText: string;
  iconName: 'CheckCircle2' | 'AlertTriangle' | 'XCircle' | 'ShieldAlert' | 'HelpCircle';
  description: string;
  auditBadgeClass: string;
}

export const STATUS_CONFIG: Record<CertificateStatus, StatusUIConfig> = {
  VALID: {
    label: 'Verified & Valid',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    bannerBg: 'bg-emerald-50/90',
    bannerBorder: 'border-emerald-300',
    bannerText: 'text-emerald-900',
    iconName: 'CheckCircle2',
    description: 'This credential is authentic, actively registered with the institution, and has not been revoked or expired.',
    auditBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  REVOKED: {
    label: 'Revoked',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    bannerBg: 'bg-rose-50/90',
    bannerBorder: 'border-rose-300',
    bannerText: 'text-rose-900',
    iconName: 'XCircle',
    description: 'This credential was officially revoked by the issuing institution. It is no longer recognized as valid.',
    auditBadgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  EXPIRED: {
    label: 'Expired',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    bannerBg: 'bg-amber-50/90',
    bannerBorder: 'border-amber-300',
    bannerText: 'text-amber-900',
    iconName: 'AlertTriangle',
    description: 'This credential has passed its validity window and is currently expired.',
    auditBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  INTEGRITY_FAILED: {
    label: 'Integrity Check Failed',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-300',
    bannerBg: 'bg-red-50/95',
    bannerBorder: 'border-red-400',
    bannerText: 'text-red-950',
    iconName: 'ShieldAlert',
    description: 'Simulated tampering detected: The calculated document fingerprint does not match the official registry record.',
    auditBadgeClass: 'bg-red-100 text-red-900 border-red-300',
  },
};

export const OUTCOME_CONFIG: Record<VerificationOutcome, StatusUIConfig> = {
  ...STATUS_CONFIG,
  NOT_FOUND: {
    label: 'Not Found',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    bannerBg: 'bg-slate-100/90',
    bannerBorder: 'border-slate-300',
    bannerText: 'text-slate-800',
    iconName: 'HelpCircle',
    description: 'No record exists for the provided Certificate ID in the institution registry.',
    auditBadgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
};

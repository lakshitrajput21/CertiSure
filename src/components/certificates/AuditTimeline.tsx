import React from 'react';
import { AuditEvent } from '../../types/certificate';
import { formatDateTime } from '../../utils/dateUtils';
import { CheckCircle2, XCircle, Clock, Eye, Edit3 } from 'lucide-react';

interface AuditTimelineProps {
  events: AuditEvent[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic p-4 text-center">
        No audit events recorded for this credential.
      </div>
    );
  }

  const getActionBadge = (action: AuditEvent['action']) => {
    switch (action) {
      case 'ISSUED':
        return {
          icon: <CheckCircle2 size={14} className="text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'VERIFIED':
        return {
          icon: <Clock size={14} className="text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'REVOKED':
        return {
          icon: <XCircle size={14} className="text-rose-600" />,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'MODIFIED':
        return {
          icon: <Edit3 size={14} className="text-amber-600" />,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          icon: <Eye size={14} className="text-slate-600" />,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const style = getActionBadge(event.action);
        return (
          <div key={event.id} className="relative group">
            {/* Timeline bullet dot */}
            <div
              className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${style.dot}`}
            />

            <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${style.bg}`}
                >
                  {style.icon}
                  {event.action}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-800">
                Actor: <span className="font-normal text-slate-600">{event.actor}</span>
              </div>

              {event.notes && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.notes}</p>
              )}

              {event.ipAddress && (
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Recorded IP: {event.ipAddress} (Institutional Gateway)
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

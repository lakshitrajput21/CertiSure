import React from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  iconBg = 'bg-blue-50 text-blue-600',
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span
                className={`font-semibold ${
                  trend === 'up'
                    ? 'text-emerald-600'
                    : trend === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {change}
              </span>
              <span>vs previous quarter</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
      </div>
    </Card>
  );
};

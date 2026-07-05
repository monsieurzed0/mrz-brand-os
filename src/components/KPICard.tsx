import type { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  accent?: boolean;
}

export default function KPICard({ label, value, icon, trend, accent }: KPICardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:border-copper/30 group ${
      accent 
        ? 'border-copper/25 bg-gradient-to-br from-carbon to-copper/5' 
        : 'border-exec/10 bg-carbon'
    }`}>
      {/* Subtle accent glow for highlighted cards */}
      {accent && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-copper/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${
            accent ? 'text-copper-light' : 'text-ivory'
          }`}>{value}</p>
          {trend && (
            <p className="mt-1 text-[10px] text-muted">{trend}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl transition-colors ${
          accent 
            ? 'bg-copper/20 text-copper group-hover:bg-copper/30' 
            : 'bg-exec/10 text-exec group-hover:bg-copper/10 group-hover:text-copper'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

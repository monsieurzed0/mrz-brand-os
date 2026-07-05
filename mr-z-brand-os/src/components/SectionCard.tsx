import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  noPad?: boolean;
}

export default function SectionCard({ title, subtitle, children, className = '', headerRight, noPad }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-exec/10 bg-carbon overflow-hidden ${className}`}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-ivory tracking-wide">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[10px] text-subtle mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'px-5 pb-5'}>{children}</div>
    </div>
  );
}

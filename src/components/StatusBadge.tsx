import { STATUS_MAP, STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

export default function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const label = STATUS_MAP[status] || status;
  const colors = STATUS_COLORS[status] || 'bg-subtle/20 text-muted';
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[9px]' 
    : 'px-2.5 py-1 text-[10px]';
  
  return (
    <span className={`inline-flex items-center rounded-full font-bold tracking-wide ${colors} ${sizeClasses}`}>
      {label}
    </span>
  );
}

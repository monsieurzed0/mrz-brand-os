import { useRef, useState } from 'react';
import type { ReactNode, MouseEvent, CSSProperties } from 'react';
import { useCountUp, usePrefersReducedMotion } from '@/hooks/useMotion';

interface KPICardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  accent?: boolean;
  /** Série réelle. Ignorée si elle contient moins de deux points. */
  sparkline?: number[];
  /** Mise en forme de la valeur numérique (ex. montant XAF). */
  format?: (value: number) => string;
  /** Count-up au premier affichage + pulsation sur changement. */
  animateValue?: boolean;
  /** Délai de la séquence d'entrée, en millisecondes. */
  enterDelay?: number;
  onClick?: () => void;
}

const TILT_MAX_DEG = 3;

export default function KPICard({
  label,
  value,
  icon,
  trend,
  accent,
  sparkline,
  format,
  animateValue,
  enterDelay,
  onClick,
}: KPICardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);
  const reduced = usePrefersReducedMotion();

  const numeric = typeof value === 'number' ? value : null;
  const { display, pulsing } = useCountUp(numeric ?? 0, { enabled: Boolean(animateValue) && numeric !== null });

  const shownValue =
    numeric === null
      ? value
      : format
        ? format(animateValue ? display : numeric)
        : (animateValue ? display : numeric).toLocaleString('fr-FR');

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * TILT_MAX_DEG * 2, y: px * TILT_MAX_DEG * 2 });
  }

  const interactive = typeof onClick === 'function';

  const style: CSSProperties & Record<string, string> = {};
  if (enterDelay !== undefined) style['--enter-delay'] = `${enterDelay}ms`;
  if (tilt) {
    style.transform = `perspective(1200px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateZ(6px)`;
    style.transition = 'transform var(--motion-fast) var(--ease-soft)';
  } else {
    style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    style.transition = 'transform var(--motion-base) var(--ease-out-expo), border-color var(--motion-fast) var(--ease-soft)';
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt(null)}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick?.();
            }
          }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={style}
      className={`relative overflow-hidden rounded-xl border p-5 hover:border-copper/30 group ${
        enterDelay !== undefined ? 'mz-enter ' : ''
      }${interactive ? 'cursor-pointer ' : ''}${
        accent
          ? 'border-copper/25 bg-gradient-to-br from-carbon to-copper/5'
          : 'border-exec/10 bg-carbon'
      }`}
    >
      {accent && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-copper/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-subtle uppercase tracking-[0.12em]">{label}</p>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight truncate ${
              accent ? 'text-copper-light' : 'text-ivory'
            } ${pulsing ? 'mz-value-pulse' : ''}`}
          >
            {shownValue}
          </p>
          {trend && <p className="mt-1 text-[10px] text-muted">{trend}</p>}
        </div>

        <div
          className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            accent
              ? 'bg-copper/20 text-copper group-hover:bg-copper/30'
              : 'bg-exec/10 text-exec group-hover:bg-copper/10 group-hover:text-copper'
          }`}
        >
          {icon}
        </div>
      </div>

      <Sparkline points={sparkline} enterDelay={enterDelay} />
    </div>
  );
}

/** Micro-courbe SVG maison — 60×20, sans remplissage. */
function Sparkline({ points, enterDelay }: { points?: number[]; enterDelay?: number }) {
  const series = Array.isArray(points) ? points.filter((n) => Number.isFinite(n)) : [];

  // Série vide ou à un seul point : aucune courbe. On n'invente pas de tracé.
  if (series.length < 2) return null;

  const width = 60;
  const height = 20;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;

  const coords = series.map((value, index) => {
    const x = (index / (series.length - 1)) * width;
    const y = height - ((value - min) / span) * height;
    return { x, y };
  });

  const path = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  // Longueur approchée du tracé, pour le dessin progressif.
  let length = 0;
  for (let i = 1; i < coords.length; i += 1) {
    length += Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
  }

  const style: CSSProperties & Record<string, string> = {
    '--draw-length': `${length.toFixed(2)}`,
    '--draw-from': `${length.toFixed(2)}`,
    '--draw-to': '0',
  };
  if (enterDelay !== undefined) style['--enter-delay'] = `${enterDelay + 200}ms`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="mt-3 overflow-visible"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-copper mz-draw"
        style={style}
      />
    </svg>
  );
}

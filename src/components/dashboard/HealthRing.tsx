import type { CSSProperties } from 'react';
import { useCountUp } from '@/hooks/useMotion';
import { healthDotClass } from '@/lib/dashboardMetrics';
import type { EcosystemHealth } from '@/lib/dashboardMetrics';

const SIZE = 148;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Santé de l'écosystème — anneau SVG maison.
 * Le score est la moyenne des indicateurs réellement mesurables.
 * Aucune pastille rouge : la charte n'a pas de rouge.
 */
export default function HealthRing({ health, enterDelay = 0 }: { health: EcosystemHealth; enterDelay?: number }) {
  const { score, indicators } = health;
  const { display } = useCountUp(score ?? 0, { enabled: score !== null, durationMs: 1200 });

  if (score === null) {
    return (
      <p className="text-xs text-muted leading-relaxed">
        Pas encore assez de données pour calculer un score. Les indicateurs
        s'activeront dès que le contenu, les leads, les preuves ou le bilan
        seront alimentés.
      </p>
    );
  }

  const offset = CIRCUMFERENCE * (1 - score / 100);

  const arcStyle: CSSProperties & Record<string, string> = {
    '--draw-length': `${CIRCUMFERENCE.toFixed(2)}`,
    '--draw-from': `${CIRCUMFERENCE.toFixed(2)}`,
    '--draw-to': `${offset.toFixed(2)}`,
    '--enter-delay': `${enterDelay}ms`,
  };

  return (
    <div>
      <div className="relative flex justify-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-copper/10 blur-2xl mz-breathe" />
        </div>

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Santé de l'écosystème : ${score} %`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-exec/15"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className="stroke-copper mz-draw"
            style={arcStyle}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-copper-light tabular-nums">{display} %</span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-subtle mt-0.5">Santé</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {indicators.map((indicator, index) => (
          <li
            key={indicator.key}
            className="flex items-center gap-2.5 mz-enter"
            style={{ '--enter-delay': `${enterDelay + 200 + index * 60}ms` } as CSSProperties}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${healthDotClass(indicator.value)}`} />
            <span className="text-xs text-muted flex-1 min-w-0 truncate">{indicator.label}</span>
            <span className="text-[10px] text-subtle shrink-0">{indicator.detail}</span>
            <span className="text-xs font-bold text-ivory tabular-nums w-10 text-right shrink-0">
              {indicator.value === null ? '—' : `${indicator.value} %`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

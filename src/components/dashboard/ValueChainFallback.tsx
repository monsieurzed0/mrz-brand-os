import { useNavigate } from 'react-router-dom';
import type { PipelineStage } from '@/lib/dashboardMetrics';

/**
 * Repli 2D de la chaîne de valeur — SVG maison.
 * Utilisé quand WebGL est indisponible et sur les petites largeurs, où huit
 * nœuds en profondeur ne seraient plus lisibles. La même information est
 * portée : compteur réel, état actif ou vide, navigation vers le stade.
 */
export default function ValueChainFallback({ stages }: { stages: PipelineStage[] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <ul className="flex items-center gap-1 min-w-max px-1 py-3">
        {stages.map((stage, index) => {
          const active = stage.count > 0;

          return (
            <li key={stage.key} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate(stage.route)}
                title={`${stage.label} — ${stage.count} ${stage.detail}`}
                className="flex flex-col items-center gap-2 rounded-xl px-2 py-2 min-w-[72px] hover:bg-deep/60 transition-colors duration-200 group"
              >
                <span className="relative block w-11 h-11">
                  <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0">
                    <circle
                      cx="22"
                      cy="22"
                      r="19"
                      fill={active ? 'rgba(214, 122, 44, 0.12)' : 'rgba(20, 20, 22, 0.9)'}
                      strokeWidth="1.5"
                      className={active ? 'stroke-copper' : 'stroke-exec/25'}
                    />
                  </svg>
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular-nums ${
                      active ? 'text-copper-light' : 'text-subtle'
                    }`}
                  >
                    {stage.count}
                  </span>
                </span>

                <span
                  className={`text-[10px] uppercase tracking-[0.12em] ${
                    active ? 'text-muted group-hover:text-ivory' : 'text-subtle'
                  }`}
                >
                  {stage.label}
                </span>
                <span className="sr-only">{stage.detail}</span>
              </button>

              {index < stages.length - 1 && (
                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" className="shrink-0 mb-5">
                  <line
                    x1="0"
                    y1="6"
                    x2="18"
                    y2="6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={active ? 'stroke-copper/60' : 'stroke-exec/20'}
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface FunnelStep {
  label: string;
  value: number;
}

interface Props {
  steps: FunnelStep[];
}

export default function FunnelChart({ steps }: Props) {
  const max = Math.max(...steps.map(s => s.value), 1);

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const width = Math.max((step.value / max) * 100, 15);
        const opacity = 1 - (i * 0.12);
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 text-right shrink-0">
              <span className="text-[10px] text-subtle font-semibold">{step.label}</span>
            </div>
            <div className="flex-1 relative h-7">
              <div
                className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, rgba(214, 122, 44, ${opacity * 0.8}) 0%, rgba(239, 159, 39, ${opacity}) 100%)`,
                }}
              >
                <span className="text-xs font-bold text-ivory drop-shadow-sm">
                  {step.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

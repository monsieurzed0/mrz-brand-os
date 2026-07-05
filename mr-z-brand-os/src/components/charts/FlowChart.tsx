import { ChevronRight } from 'lucide-react';

interface FlowStep {
  label: string;
  value: number;
}

interface Props {
  steps: FlowStep[];
}

export default function FlowChart({ steps }: Props) {
  const max = Math.max(...steps.map(s => s.value), 1);
  
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const intensity = step.value / max;
        return (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <div className="flex flex-col items-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-ivory border transition-all"
                style={{
                  background: `rgba(214, 122, 44, ${0.08 + intensity * 0.25})`,
                  borderColor: `rgba(214, 122, 44, ${0.15 + intensity * 0.3})`,
                }}
              >
                {step.value}
              </div>
              <span className="text-[9px] text-subtle mt-1.5 text-center leading-tight font-semibold max-w-[50px]">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className="text-exec/30 shrink-0 mt-[-16px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

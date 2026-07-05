import { useStore } from '@/lib/useStore';
import { CheckCircle } from 'lucide-react';

export default function Toast() {
  const { toast } = useStore();
  
  if (!toast) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
      <div className="flex items-center gap-3 rounded-xl border border-copper/25 bg-carbon px-5 py-3.5 shadow-premium">
        <div className="p-1 rounded-full bg-copper/20">
          <CheckCircle size={14} className="text-copper" />
        </div>
        <span className="text-sm font-semibold text-ivory">{toast}</span>
      </div>
    </div>
  );
}

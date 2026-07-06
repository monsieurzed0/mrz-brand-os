import Topbar from '@/components/Topbar';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

export default function ContentLab() {
  const { data, loading, error } = useApiQuery(api.getContentIdeas, []);

  return (
    <div>
      <Topbar title="Content Lab" />

      <div className="p-6 space-y-6 animate-fade-in">
        {loading ? <div className="text-sm text-[#A1A1AA]">Chargement des idées...</div> : null}
        {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

        {!loading && !error ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(data || []).map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-[#141416] p-5">
                <div className="text-xs uppercase tracking-[0.12em] text-[#71717A]">
                  {item.produit || 'Produit'}
                </div>
                <div className="mt-2 text-lg font-semibold text-[#F0EDE8]">
                  {item.sujet}
                </div>
                <div className="mt-2 text-sm text-[#A1A1AA]">
                  {item.angle}
                </div>
                <div className="mt-3 text-xs text-[#71717A]">
                  {item.plateforme} · {item.duree}s · {item.status}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

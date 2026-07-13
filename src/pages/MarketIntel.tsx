import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Radar, Search, Target, Zap } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { api, type MarketIntelItem } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

function impactLabel(score?: number) {
  const n = Number(score || 0);
  if (n >= 5) return 'Impact fort';
  if (n >= 3) return 'Impact moyen';
  if (n > 0) return 'Impact faible';
  return 'Impact non noté';
}

function categoryLabel(category?: string) {
  const c = String(category || 'general');
  const map: Record<string, string> = {
    general: 'Général',
    competitors: 'Concurrence',
    trends: 'Tendances',
    opportunities: 'Opportunités',
  };
  return map[c] || c;
}

export default function MarketIntel() {
  const { showToast } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = new URLSearchParams(location.search).get('id');

  const { data, loading, error, refetch } = useApiQuery(api.getMarketIntel, []);
  const insights = Array.isArray(data) ? data : [];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(insights.map((i: MarketIntelItem) => i.category || 'general'));
    return ['all', ...Array.from(set)];
  }, [insights]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insights.filter((item: MarketIntelItem) => {
      const matchesCategory = category === 'all' || (item.category || 'general') === category;
      const haystack = `${item.title || ''} ${item.insight || ''} ${item.source || ''} ${item.category || ''}`.toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [insights, query, category]);

  const selected = selectedId ? insights.find((i: MarketIntelItem) => i.id === selectedId) : null;

  useEffect(() => {
    if (!selectedId) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(`[data-intel-id="${selectedId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [selectedId, filtered.length]);

  async function copyInsight(item: MarketIntelItem) {
    const text = `# ${item.title}\n\n${item.insight || ''}\n\nSource: ${item.source || '—'}\nImpact: ${item.impact_score || '—'}`;
    await navigator.clipboard.writeText(text);
    showToast('Insight copié');
  }

  return (
    <div>
      <Topbar title="Market Intel" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="rounded-xl border border-exec/10 bg-carbon p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-copper/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-deep border border-copper/20">
                <Radar size={22} className="text-copper" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ivory">Market Intel</h2>
                <p className="text-xs text-subtle mt-1 max-w-2xl">
                  Signaux marché sauvegardés par l’agent Market Intel et le chat /intel. Ces insights alimentent Chief of Staff, Content Strategist et Sales & Lead Ops.
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-bold hover:bg-copper/25 transition"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-exec/10 bg-carbon p-3">
            <p className="text-[10px] text-subtle uppercase font-bold">Insights</p>
            <p className="text-lg font-bold text-ivory">{insights.length}</p>
          </div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3">
            <p className="text-[10px] text-subtle uppercase font-bold">Affichés</p>
            <p className="text-lg font-bold text-copper-light">{filtered.length}</p>
          </div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3">
            <p className="text-[10px] text-subtle uppercase font-bold">Opportunités</p>
            <p className="text-lg font-bold text-ivory">{insights.filter((i: MarketIntelItem) => i.category === 'opportunities').length}</p>
          </div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3">
            <p className="text-[10px] text-subtle uppercase font-bold">Sélection</p>
            <p className="text-lg font-bold text-ivory truncate">{selected ? 'active' : '—'}</p>
          </div>
        </div>

        {selectedId && !selected && !loading && (
          <SectionCard title="Résultat introuvable">
            <p className="text-sm text-subtle">
              L’insight demandé n’est pas disponible ou a été supprimé. Tu peux revenir à la liste complète.
            </p>
            <button
              onClick={() => navigate('/market-intel')}
              className="mt-3 text-xs text-copper hover:text-copper-light underline"
            >
              Voir tous les insights
            </button>
          </SectionCard>
        )}

        <div className="rounded-xl border border-exec/10 bg-carbon p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : fragmentation, WhatsApp, PME, branding…"
              className="w-full bg-deep border border-exec/15 rounded-lg pl-9 pr-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Toutes les catégories' : categoryLabel(c)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-subtle">Chargement Market Intel…</div>
        ) : error ? (
          <SectionCard title="Erreur Market Intel">
            <p className="text-sm text-red-300">{error}</p>
          </SectionCard>
        ) : filtered.length === 0 ? (
          <SectionCard title="Aucun insight">
            <p className="text-sm text-subtle">Aucun résultat pour ce filtre. Lance /intel ou l’agent Market Intel pour alimenter le flux.</p>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filtered.map((item: MarketIntelItem) => {
              const isSelected = item.id === selectedId;
              return (
                <SectionCard
                  key={item.id}
                  title={item.title || 'Insight'}
                  subtitle={`${categoryLabel(item.category)} · ${impactLabel(item.impact_score)} · ${item.status || 'active'}`}
                  className={isSelected ? 'ring-1 ring-copper/50 border-copper/40' : ''}
                  headerRight={
                    <button onClick={() => copyInsight(item)} className="text-subtle hover:text-copper transition" title="Copier">
                      <Copy size={13} />
                    </button>
                  }
                >
                  <div data-intel-id={item.id}>
                    {isSelected && (
                      <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-copper/10 border border-copper/20 text-[10px] text-copper-light font-bold uppercase tracking-wider">
                        <Zap size={10} /> Résultat ouvert depuis la recherche
                      </div>
                    )}
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                      {item.insight || 'Aucun détail.'}
                    </p>
                    <div className="mt-4 pt-3 border-t border-exec/10 flex flex-wrap items-center gap-2 text-[10px] text-subtle">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-deep border border-exec/10">
                        <Target size={10} className="text-copper" /> {item.source || 'Source non précisée'}
                      </span>
                      {item.created_at && <span>{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Lightbulb, Plus, Sparkles, Grid3X3, List, Filter } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { PRODUCTS, PLATFORMS, DURATIONS, STATUS_MAP } from '@/lib/constants';
import type { Product, Platform, Duration, ContentIdeaStatus } from '@/types';

const IDEA_STATUSES: ContentIdeaStatus[] = [
  'idea_pending',
  'idea_ready',
  'script_pending',
  'archived',
];

type UiContentIdea = {
  id: string;
  subject: string;
  angle: string;
  target: string;
  product: Product;
  platform: Platform;
  duration: Duration;
  cta: string;
  caption?: string;
  source: string;
  status: ContentIdeaStatus;
};

function mapApiIdeaToUi(i: any): UiContentIdea {
  return {
    id: i.id,
    subject: i.sujet || '',
    angle: i.angle || '',
    target: i.cible || '',
    product: (i.produit || 'Mr Z Brand') as Product,
    platform: (i.plateforme || 'TikTok') as Platform,
    duration: Number(i.duree || 60) as Duration,
    cta: i.cta || '',
    caption: i.caption || '',
    source: i.source || '',
    status: (i.status || 'idea_pending') as ContentIdeaStatus,
  };
}

function mapUiIdeaToApi(form: Partial<UiContentIdea>) {
  return {
    sujet: form.subject || '',
    angle: form.angle || '',
    cible: form.target || '',
    produit: form.product || 'Mr Z Brand',
    plateforme: form.platform || 'TikTok',
    duree: form.duration || 60,
    cta: form.cta || '',
    caption: form.caption || '',
    source: form.source || '',
    status: form.status || 'idea_pending',
  };
}

export default function ContentLab() {
  const { showToast } = useStore();

  const {
    data: ideasData,
    loading,
    error,
    setData: setIdeasData,
  } = useApiQuery(api.getContentIdeas, []);

  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UiContentIdea>>({
    subject: '',
    angle: '',
    target: '',
    product: 'Mr Z Brand',
    platform: 'TikTok',
    duration: 60,
    cta: '',
    source: '',
    status: 'idea_pending',
  });

  const allIdeas: UiContentIdea[] = useMemo(() => {
    const safe = Array.isArray(ideasData) ? ideasData : [];
    return safe.map(mapApiIdeaToUi);
  }, [ideasData]);

  const ideas = allIdeas.filter((i) => {
    if (filterProduct && i.product !== filterProduct) return false;
    if (filterPlatform && i.platform !== filterPlatform) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const resetForm = () => {
    setForm({
      subject: '',
      angle: '',
      target: '',
      product: 'Mr Z Brand',
      platform: 'TikTok',
      duration: 60,
      cta: '',
      source: '',
      status: 'idea_pending',
    });
  };

  const handleSave = async () => {
    if (!form.subject) {
      showToast('Sujet manquant');
      return;
    }
    try {
      const payload = mapUiIdeaToApi(form);
      if (editId) {
        await api.updateContentIdea(editId, payload);
        setIdeasData((prev: any) =>
          (prev || []).map((item: any) =>
            item.id === editId ? { ...item, ...payload } : item
          )
        );
        showToast('Idée mise à jour');
        setEditId(null);
      } else {
        const result: any = await api.createContentIdea(payload);
        setIdeasData((prev: any) => [
          ...(prev || []),
          {
            id: result.id,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        showToast('Idée ajoutée');
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement');
    }
  };

  const generateIdeas = async () => {
    try {
      const result: any = await api.runContentStrategist({ count: 5 });
      if (result?.ideas && Array.isArray(result.ideas)) {
        setIdeasData((prev: any) => [...(prev || []), ...result.ideas]);
      }
      showToast(`${result?.count || 0} idées générées`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur génération idées');
    }
  };

  const editIdea = (idea: UiContentIdea) => {
    setForm(idea);
    setEditId(idea.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteContentIdea(id);
      setIdeasData((prev: any) => (prev || []).filter((item: any) => item.id !== id));
      showToast('Idée supprimée');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <div>
      <Topbar title="Content Lab" />
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Idées de contenu</h2>
            <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">
              {allIdeas.length} idées
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateIdeas}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/25 transition"
            >
              <Sparkles size={14} /> Générer 5 idées IA
            </button>
            <button
              onClick={() => {
                setEditId(null);
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm font-medium hover:border-copper/30 transition"
            >
              <Plus size={14} /> Nouvelle idée
            </button>
            <div className="flex border border-exec/15 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('table')}
                className={`p-2 ${view === 'table' ? 'bg-copper/15 text-copper' : 'text-subtle hover:text-muted'}`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`p-2 ${view === 'kanban' ? 'bg-copper/15 text-copper' : 'text-subtle hover:text-muted'}`}
              >
                <Grid3X3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {loading ? <div className="text-sm text-subtle">Chargement des idées...</div> : null}
        {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={14} className="text-subtle" />
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-deep border border-exec/15 rounded-lg px-3 py-1.5 text-sm text-ivory focus:outline-none focus:border-copper/30"
          >
            <option value="">Tous les produits</option>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-deep border border-exec/15 rounded-lg px-3 py-1.5 text-sm text-ivory focus:outline-none focus:border-copper/30"
          >
            <option value="">Toutes les plateformes</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-deep border border-exec/15 rounded-lg px-3 py-1.5 text-sm text-ivory focus:outline-none focus:border-copper/30"
          >
            <option value="">Tous les statuts</option>
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_MAP[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <SectionCard title={editId ? "Modifier l'idée" : 'Nouvelle idée'}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Sujet</label>
                <input
                  value={form.subject || ''}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Angle</label>
                <input
                  value={form.angle || ''}
                  onChange={(e) => setForm({ ...form, angle: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Cible</label>
                <input
                  value={form.target || ''}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Produit</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value as Product })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Plateforme</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Durée (s)</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) as Duration })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}s
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">CTA</label>
                <input
                  value={form.cta || ''}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Source</label>
                <input
                  value={form.source || ''}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ContentIdeaStatus })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {IDEA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_MAP[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"
              >
                {editId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition"
              >
                Annuler
              </button>
            </div>
          </SectionCard>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className="rounded-xl border border-exec/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep border-b border-exec/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Sujet</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Angle</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Produit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Plateforme</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Durée</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-exec/5">
                  {ideas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-carbon/40 transition">
                      <td className="px-4 py-3 text-ivory font-medium max-w-xs truncate">{idea.subject}</td>
                      <td className="px-4 py-3 text-muted">{idea.angle}</td>
                      <td className="px-4 py-3 text-muted text-xs">{idea.product}</td>
                      <td className="px-4 py-3 text-muted text-xs">{idea.platform}</td>
                      <td className="px-4 py-3 text-muted text-xs">{idea.duration}s</td>
                      <td className="px-4 py-3"><StatusBadge status={idea.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => editIdea(idea)}
                            className="text-xs text-muted hover:text-copper transition px-2 py-1 rounded hover:bg-copper/10"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="text-xs text-subtle hover:text-red-400 transition px-2 py-1 rounded hover:bg-red-900/10"
                          >
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {IDEA_STATUSES.map((status) => (
              <div key={status} className="rounded-xl border border-exec/10 bg-carbon">
                <div className="px-4 py-3 border-b border-exec/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory uppercase tracking-wider">
                    {STATUS_MAP[status]}
                  </span>
                  <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">
                    {ideas.filter((i) => i.status === status).length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[100px]">
                  {ideas
                    .filter((i) => i.status === status)
                    .map((idea) => (
                      <div
                        key={idea.id}
                        onClick={() => editIdea(idea)}
                        className="p-3 rounded-lg bg-deep border border-exec/5 hover:border-copper/20 cursor-pointer transition"
                      >
                        <p className="text-sm font-semibold text-ivory line-clamp-2">{idea.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-subtle bg-dark px-1.5 py-0.5 rounded">
                            {idea.product}
                          </span>
                          <span className="text-[10px] text-subtle bg-dark px-1.5 py-0.5 rounded">
                            {idea.platform}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Distribution par produit">
            <div className="space-y-2">
              {PRODUCTS.map((p) => {
                const count = allIdeas.filter((i) => i.product === p).length;
                const pct = allIdeas.length > 0 ? (count / allIdeas.length) * 100 : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-32 truncate">{p}</span>
                    <div className="flex-1 h-4 bg-deep rounded-full overflow-hidden">
                      <div
                        className="h-full bg-copper/40 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-ivory font-bold w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard title="Distribution par plateforme">
            <div className="space-y-2">
              {PLATFORMS.map((p) => {
                const count = allIdeas.filter((i) => i.platform === p).length;
                const pct = allIdeas.length > 0 ? (count / allIdeas.length) * 100 : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-32 truncate">{p}</span>
                    <div className="flex-1 h-4 bg-deep rounded-full overflow-hidden">
                      <div
                        className="h-full bg-copper-light/40 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-ivory font-bold w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

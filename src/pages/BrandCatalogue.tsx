import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Copy, Edit3, FileText, Plus, Save, Search, Tag, Trash2, X } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

type BrandCatalogBlock = {
  id: string;
  section_key: string;
  parent_key?: string | null;
  block_type: string;
  title: string;
  brand?: string | null;
  content_md: string;
  metadata_json?: string | null;
  sort_order?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  section_key: string;
  parent_key: string;
  block_type: string;
  title: string;
  brand: string;
  content_md: string;
  metadata_json: string;
  sort_order: string;
  status: string;
};

const SECTIONS = [
  { key: '00_source', label: 'Source intégrale' },
  { key: '00_document', label: 'Document & cadrage' },
  { key: '01_ce_que_fait_mrz_brand', label: 'Ce que fait Mr Z Brand' },
  { key: '02_cibles', label: 'Cibles prioritaires' },
  { key: '03_intervention', label: 'Mode d’intervention' },
  { key: '04_offres_coeur_mrz_brand', label: 'Offres cœur — Mr Z Brand' },
  { key: '05_signal_by_mrz', label: 'SIGNAL™ by Mr Z' },
  { key: '06_proskills_fr', label: 'PROSKILLS FR' },
  { key: '07_lecture_simple', label: 'Lecture simple du catalogue' },
  { key: '08_tableau_recapitulatif', label: 'Tableau récapitulatif' },
  { key: '09_formulations_commerciales', label: 'Formulations commerciales' },
  { key: '10_statut_usage', label: 'Statut d’usage' },
];

const BRANDS = ['Mr Z Brand', 'SIGNAL™ by Mr Z', 'PROSKILLS FR', 'Catalogue global'];
const BLOCK_TYPES = ['source', 'section', 'offer', 'pricing', 'mapping', 'formulation', 'usage', 'note'];

const emptyForm: FormState = {
  section_key: '04_offres_coeur_mrz_brand',
  parent_key: '',
  block_type: 'offer',
  title: '',
  brand: 'Mr Z Brand',
  content_md: '',
  metadata_json: '{}',
  sort_order: '100',
  status: 'active',
};

function sectionLabel(key: string) {
  return SECTIONS.find((s) => s.key === key)?.label || key;
}

function escapeHtml(text: string) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdownLite(text: string) {
  if (!text) return '';
  let html = escapeHtml(text.replace(/\\n/g, '\n'));
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^###\s+(.*)$/gm, '<span class="text-ivory font-bold">$1</span>');
  html = html.replace(/^##\s+(.*)$/gm, '<span class="text-copper-light font-bold">$1</span>');
  html = html.replace(/^#\s+(.*)$/gm, '<span class="text-copper-light font-bold text-base">$1</span>');
  html = html.replace(/^-\s+(.*)$/gm, '• $1');
  html = html.replace(/^→\s+(.*)$/gm, '→ $1');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

async function catalogFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Réponse API invalide');
  }
  if (!response.ok) throw new Error(data?.error || 'Erreur API');
  return data as T;
}

const catalogApi = {
  list: () => catalogFetch<BrandCatalogBlock[]>('/api/brand-catalog?limit=200'),
  create: (payload: Partial<BrandCatalogBlock>) =>
    catalogFetch<{ ok: boolean; id: string }>('/api/brand-catalog', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<BrandCatalogBlock>) =>
    catalogFetch<{ ok: boolean; id: string }>(`/api/brand-catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    catalogFetch<{ ok: boolean; id: string }>(`/api/brand-catalog/${id}`, { method: 'DELETE' }),
};

export default function BrandCatalogue() {
  const { showToast } = useStore();
  const [blocks, setBlocks] = useState<BrandCatalogBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const data = await catalogApi.list();
      const safe = Array.isArray(data) ? data : [];
      setBlocks(safe.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur chargement catalogue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blocks.filter((b) => {
      const matchesSection = sectionFilter === 'all' || b.section_key === sectionFilter;
      const haystack = `${b.title || ''} ${b.brand || ''} ${b.block_type || ''} ${b.content_md || ''}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesSection && matchesQuery;
    });
  }, [blocks, query, sectionFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, BrandCatalogBlock[]> = {};
    for (const block of filtered) {
      const key = block.section_key || 'autre';
      if (!map[key]) map[key] = [];
      map[key].push(block);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    return {
      total: blocks.length,
      offers: blocks.filter((b) => b.block_type === 'offer').length,
      mrz: blocks.filter((b) => b.brand === 'Mr Z Brand').length,
      signal: blocks.filter((b) => b.brand === 'SIGNAL™ by Mr Z').length,
      proskills: blocks.filter((b) => b.brand === 'PROSKILLS FR').length,
    };
  }, [blocks]);

  function startCreate(sectionKey?: string) {
    const maxSort = blocks.reduce((max, b) => Math.max(max, Number(b.sort_order || 0)), 0);
    setEditingId(null);
    setForm({
      ...emptyForm,
      section_key: sectionKey || (sectionFilter !== 'all' ? sectionFilter : emptyForm.section_key),
      sort_order: String(maxSort + 10),
    });
    setFormOpen(true);
  }

  function startEdit(block: BrandCatalogBlock) {
    setEditingId(block.id);
    setForm({
      section_key: block.section_key || '',
      parent_key: block.parent_key || '',
      block_type: block.block_type || 'section',
      title: block.title || '',
      brand: block.brand || 'Catalogue global',
      content_md: (block.content_md || '').replace(/\\n/g, '\n'),
      metadata_json: block.metadata_json || '{}',
      sort_order: String(block.sort_order ?? 100),
      status: block.status || 'active',
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveBlock() {
    if (!form.title.trim()) {
      showToast('Titre requis');
      return;
    }
    if (!form.section_key.trim()) {
      showToast('Section requise');
      return;
    }
    if (form.metadata_json.trim()) {
      try {
        JSON.parse(form.metadata_json);
      } catch {
        showToast('Métadonnées JSON invalides');
        return;
      }
    }

    const payload = {
      section_key: form.section_key.trim(),
      parent_key: form.parent_key.trim() || null,
      block_type: form.block_type.trim() || 'section',
      title: form.title.trim(),
      brand: form.brand.trim() || 'Catalogue global',
      content_md: form.content_md,
      metadata_json: form.metadata_json.trim() || '{}',
      sort_order: Number(form.sort_order) || 0,
      status: form.status || 'active',
    };

    setSaving(true);
    try {
      if (editingId) {
        await catalogApi.update(editingId, payload);
        showToast('Bloc catalogue mis à jour');
      } else {
        await catalogApi.create(payload);
        showToast('Bloc catalogue ajouté');
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock(block: BrandCatalogBlock) {
    const ok = window.confirm(`Supprimer définitivement : ${block.title} ?`);
    if (!ok) return;
    try {
      await catalogApi.delete(block.id);
      setBlocks((prev) => prev.filter((b) => b.id !== block.id));
      showToast('Bloc supprimé');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur suppression');
    }
  }

  async function copyBlock(block: BrandCatalogBlock) {
    const text = `# ${block.title}\n\n${block.content_md || ''}`;
    await navigator.clipboard.writeText(text);
    showToast('Bloc copié');
  }

  return (
    <div>
      <Topbar title="Catalogue commercial" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="rounded-xl border border-exec/10 bg-carbon p-5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-copper/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-deep border border-copper/20">
                <BookOpen size={22} className="text-copper" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ivory">Catalogue commercial premium</h2>
                <p className="text-xs text-subtle mt-1 max-w-2xl">
                  Source structurée des offres, prix indicatifs, formulations commerciales et règles d’usage. Chaque bloc est modifiable, ajoutable et supprimable.
                </p>
              </div>
            </div>
            <button
              onClick={() => startCreate()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"
            >
              <Plus size={14} /> Ajouter un bloc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-exec/10 bg-carbon p-3"><p className="text-[10px] text-subtle uppercase font-bold">Blocs</p><p className="text-lg font-bold text-ivory">{stats.total}</p></div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3"><p className="text-[10px] text-subtle uppercase font-bold">Offres</p><p className="text-lg font-bold text-copper-light">{stats.offers}</p></div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3"><p className="text-[10px] text-subtle uppercase font-bold">Mr Z Brand</p><p className="text-lg font-bold text-ivory">{stats.mrz}</p></div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3"><p className="text-[10px] text-subtle uppercase font-bold">SIGNAL™</p><p className="text-lg font-bold text-ivory">{stats.signal}</p></div>
          <div className="rounded-xl border border-exec/10 bg-carbon p-3"><p className="text-[10px] text-subtle uppercase font-bold">PROSKILLS FR</p><p className="text-lg font-bold text-ivory">{stats.proskills}</p></div>
        </div>

        {formOpen && (
          <SectionCard
            title={editingId ? 'Modifier un bloc du catalogue' : 'Ajouter un bloc au catalogue'}
            headerRight={
              <button onClick={() => { setFormOpen(false); setEditingId(null); }} className="text-subtle hover:text-copper transition">
                <X size={14} />
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Section prédéfinie</label>
                <select value={form.section_key} onChange={(e) => setForm({ ...form, section_key: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  {SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Clé section modifiable</label>
                <input value={form.section_key} onChange={(e) => setForm({ ...form, section_key: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Type</label>
                <select value={form.block_type} onChange={(e) => setForm({ ...form, block_type: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  {BLOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Marque</label>
                <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-subtle font-semibold">Titre</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Parent key facultatif</label>
                <input value={form.parent_key} onChange={(e) => setForm({ ...form, parent_key: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Ordre</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Statut</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <label className="text-xs text-subtle font-semibold">Contenu Markdown éditable</label>
                <textarea value={form.content_md} onChange={(e) => setForm({ ...form, content_md: e.target.value })} rows={14} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 font-mono resize-y" />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <label className="text-xs text-subtle font-semibold">Métadonnées JSON facultatives</label>
                <textarea value={form.metadata_json} onChange={(e) => setForm({ ...form, metadata_json: e.target.value })} rows={4} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-copper/30 font-mono resize-y" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={saveBlock} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition disabled:opacity-50">
                <Save size={13} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
              <button onClick={() => { setFormOpen(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}

        <div className="rounded-xl border border-exec/10 bg-carbon p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher dans le catalogue…" className="w-full bg-deep border border-exec/15 rounded-lg pl-9 pr-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
          </div>
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
            <option value="all">Toutes les sections</option>
            {SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-subtle">Chargement du catalogue…</div>
        ) : filtered.length === 0 ? (
          <SectionCard title="Catalogue vide">
            <p className="text-sm text-subtle">Aucun bloc trouvé. Ajoute un bloc ou exécute la migration du catalogue.</p>
          </SectionCard>
        ) : (
          Object.entries(grouped).map(([sectionKey, items]) => (
            <div key={sectionKey} className="space-y-3">
              <div className="flex items-center justify-between border-b border-exec/10 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-copper" />
                  <h3 className="text-sm font-bold text-ivory">{sectionLabel(sectionKey)}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-deep border border-exec/10 text-subtle">{items.length}</span>
                </div>
                <button onClick={() => startCreate(sectionKey)} className="text-xs text-copper hover:text-copper-light flex items-center gap-1 transition">
                  <Plus size={12} /> Ajouter ici
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {items.map((block) => (
                  <SectionCard
                    key={block.id}
                    title={block.title}
                    subtitle={`${block.block_type || 'section'} · ${block.brand || 'Catalogue global'} · ${block.status || 'active'}`}
                    headerRight={
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyBlock(block)} className="text-subtle hover:text-copper transition" title="Copier"><Copy size={13} /></button>
                        <button onClick={() => startEdit(block)} className="text-subtle hover:text-copper transition" title="Modifier"><Edit3 size={13} /></button>
                        <button onClick={() => deleteBlock(block)} className="text-subtle hover:text-red-400 transition" title="Supprimer"><Trash2 size={13} /></button>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-deep border border-exec/10 text-muted"><Tag size={10} />{block.section_key}</span>
                      <span className="text-[10px] text-subtle">ordre {block.sort_order ?? 0}</span>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto pr-2 text-sm text-muted leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdownLite(block.content_md || '') }} />
                    </div>
                  </SectionCard>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

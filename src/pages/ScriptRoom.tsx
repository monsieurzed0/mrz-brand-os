import { useState } from 'react';
import { FileText, Plus, Sparkles, Check, Eye, RefreshCw } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import { useStore } from '@/lib/useStore';
import { PRODUCTS, PLATFORMS } from '@/lib/constants';
import type { Script, Product, Platform } from '@/types';


export default function ScriptRoom() {
  const { state, addScript, updateScript, deleteScript, showToast } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<Partial<Script>>({
    subject: '', hook: '', script: '', ctaGenerated: '', caption: '', angle: '', target: '', product: 'Mr Z Brand', platform: 'TikTok', status: 'draft', versions: [],
  });

  const selected = state.scripts.find(s => s.id === selectedId);

  const handleSave = () => {
    if (!form.subject) return;
    addScript({
      ...form,
      versions: [{ version: 1, content: form.script || '', date: new Date().toISOString() }],
    } as Omit<Script, 'id' | 'createdAt'>);
    setForm({ subject: '', hook: '', script: '', ctaGenerated: '', caption: '', angle: '', target: '', product: 'Mr Z Brand', platform: 'TikTok', status: 'draft', versions: [] });
    setShowForm(false);
  };

  const generateScript = () => {
    const readyIdeas = state.contentIdeas.filter(i => i.status === 'idea_ready');
    if (readyIdeas.length === 0) { showToast('Aucune idée prête à scripter'); return; }
    const idea = readyIdeas[0];
    setForm({
      ideaId: idea.id,
      subject: idea.subject,
      hook: `${idea.angle} : ${idea.subject.split(' ').slice(0, 5).join(' ')}...`,
      script: `Hook : ${idea.subject}\n\n[Développement du sujet basé sur l'angle "${idea.angle}"]\n\n[Argumentation pour la cible "${idea.target}"]\n\n[Transition vers le CTA]\n\nCTA : ${idea.cta}`,
      ctaGenerated: idea.cta,
      caption: `${idea.subject} — ${idea.angle}`,
      angle: idea.angle,
      target: idea.target,
      product: idea.product,
      platform: idea.platform,
      status: 'draft',
      versions: [],
    });
    setShowForm(true);
    showToast('Script généré depuis l\'idée');
  };

  return (
    <div>
      <Topbar title="Script Room" />
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Scripts</h2>
            <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">{state.scripts.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={generateScript} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/25 transition">
              <Sparkles size={14} /> Générer script
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm hover:border-copper/30 transition">
              <Plus size={14} /> Nouveau script
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <SectionCard title="Nouveau script">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className="text-xs text-subtle font-semibold">Sujet</label><input value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Hook</label><input value={form.hook || ''} onChange={e => setForm({...form, hook: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div className="md:col-span-2"><label className="text-xs text-subtle font-semibold">Script complet</label><textarea value={form.script || ''} onChange={e => setForm({...form, script: e.target.value})} rows={6} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none" /></div>
              <div><label className="text-xs text-subtle font-semibold">CTA généré</label><input value={form.ctaGenerated || ''} onChange={e => setForm({...form, ctaGenerated: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Caption</label><input value={form.caption || ''} onChange={e => setForm({...form, caption: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Produit</label><select value={form.product} onChange={e => setForm({...form, product: e.target.value as Product})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">{PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div><label className="text-xs text-subtle font-semibold">Plateforme</label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value as Platform})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">Ajouter</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scripts list */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-exec/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep border-b border-exec/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Sujet</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Produit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-exec/5">
                  {state.scripts.map(s => (
                    <tr key={s.id} className={`hover:bg-carbon/40 transition cursor-pointer ${selectedId === s.id ? 'bg-copper/5' : ''}`} onClick={() => setSelectedId(s.id)}>
                      <td className="px-4 py-3">
                        <p className="text-ivory font-medium truncate max-w-xs">{s.subject}</p>
                        <p className="text-xs text-subtle truncate">{s.hook}</p>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">{s.product}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {s.status === 'ready_review' && <button onClick={e => { e.stopPropagation(); updateScript(s.id, { status: 'approved' }); showToast('Script validé'); }} className="text-xs text-copper hover:text-copper-light px-2 py-1 rounded hover:bg-copper/10 flex items-center gap-1"><Check size={11} /> Valider</button>}
                          <button onClick={e => { e.stopPropagation(); deleteScript(s.id); }} className="text-xs text-subtle hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/10">Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Script detail panel */}
          <div>
            {selected ? (
              <SectionCard title="Détail du script">
                <div className="space-y-3">
                  {/* Hook card */}
                  <div className="p-3 rounded-lg bg-copper/8 border border-copper/15">
                    <p className="text-xs text-copper font-semibold mb-1">Hook</p>
                    <p className="text-sm text-ivory font-bold">{selected.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle font-semibold mb-1">Script complet</p>
                    <div className="p-3 rounded-lg bg-deep border border-exec/10 max-h-48 overflow-y-auto">
                      <p className="text-sm text-muted whitespace-pre-wrap">{selected.script}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-deep"><span className="text-subtle">CTA:</span><p className="text-muted mt-0.5">{selected.ctaGenerated}</p></div>
                    <div className="p-2 rounded bg-deep"><span className="text-subtle">Caption:</span><p className="text-muted mt-0.5">{selected.caption}</p></div>
                    <div className="p-2 rounded bg-deep"><span className="text-subtle">Angle:</span><p className="text-muted mt-0.5">{selected.angle}</p></div>
                    <div className="p-2 rounded bg-deep"><span className="text-subtle">Cible:</span><p className="text-muted mt-0.5">{selected.target}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {selected.status !== 'approved' && (
                      <button onClick={() => { updateScript(selected.id, { status: 'approved' }); showToast('Script validé'); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-semibold hover:bg-copper/25 transition"><Check size={12} /> Valider</button>
                    )}
                    <button onClick={() => showToast('Régénération simulée')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-exec/15 text-muted text-xs hover:border-copper/30 transition"><RefreshCw size={12} /> Régénérer</button>
                  </div>
                  {/* Versions */}
                  {selected.versions.length > 0 && (
                    <div>
                      <p className="text-xs text-subtle font-semibold mb-1">Versions</p>
                      {selected.versions.map(v => (
                        <div key={v.version} className="p-2 rounded bg-deep border border-exec/5 mb-1">
                          <p className="text-xs text-muted">v{v.version} — {new Date(v.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            ) : (
              <div className="rounded-xl border border-exec/10 bg-carbon p-8 flex flex-col items-center justify-center text-center">
                <Eye size={24} className="text-subtle mb-2" />
                <p className="text-sm text-subtle">Sélectionnez un script pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

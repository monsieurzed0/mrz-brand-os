import { useState } from 'react';
import { Calendar, Target, AlertTriangle, CheckSquare, FileText } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';

export default function Weekly() {
  const { state, addWeeklyPlan, updateWeeklyPlan, showToast } = useStore();
  const [editing, setEditing] = useState(false);
  const plan = state.weeklyPlans[state.weeklyPlans.length - 1];
  const [form, setForm] = useState({
    weekLabel: plan?.weekLabel || '',
    priority1: plan?.priority1 || '',
    priority2: plan?.priority2 || '',
    priority3: plan?.priority3 || '',
    mainRisk: plan?.mainRisk || '',
    decisions: plan?.decisions?.join('\n') || '',
    notes: plan?.notes || '',
  });

  const handleSave = () => {
    const data = {
      weekLabel: form.weekLabel || `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
      priority1: form.priority1,
      priority2: form.priority2,
      priority3: form.priority3,
      mainRisk: form.mainRisk,
      decisions: form.decisions.split('\n').filter(Boolean),
      notes: form.notes,
    };
    if (plan) {
      updateWeeklyPlan(plan.id, data);
    } else {
      addWeeklyPlan(data);
    }
    setEditing(false);
    showToast('Plan hebdomadaire sauvegardé');
  };

  const generatePlan = () => {
    const hot = state.leads.filter(l => l.level === 'hot');
    const review = state.scripts.filter(s => s.status === 'ready_review');
    const waiting = state.projects.filter(p => p.status === 'project_waiting');
    setForm({
      weekLabel: `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
      priority1: hot.length > 0 ? `Convertir ${hot[0].name}` : 'Qualifier les leads entrants',
      priority2: review.length > 0 ? `Valider le script "${review[0].subject}"` : 'Produire 3 contenus éditoriaux',
      priority3: waiting.length > 0 ? `Débloquer le projet ${waiting[0].client}` : 'Avancer sur les projets actifs',
      mainRisk: waiting.length > 0 ? `Projet ${waiting[0].client} bloqué — ${waiting[0].blockers || 'à relancer'}` : 'Pas de risque majeur identifié',
      decisions: 'Prioriser les leads chauds\nPublier sur LinkedIn et TikTok\nRelancer les projets en attente',
      notes: 'Focus conversion et visibilité cette semaine.',
    });
    setEditing(true);
    showToast('Plan généré — à personnaliser');
  };

  // Weekly compass
  const focusItems = [
    { label: 'Contenu', value: state.contentIdeas.filter(i => i.status === 'idea_ready').length + state.scripts.filter(s => s.status === 'ready_review').length },
    { label: 'Business', value: state.leads.filter(l => l.level === 'hot').length },
    { label: 'Delivery', value: state.projects.filter(p => p.status === 'project_active').length },
    { label: 'Agents', value: state.agents.filter(a => a.status === 'active').length },
  ];

  return (
    <div>
      <Topbar title="Revue Hebdomadaire" />
      <div className="p-6 space-y-5 animate-fade-in">

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ivory">{plan?.weekLabel || 'Nouvelle semaine'}</h2>
            <p className="text-sm text-subtle mt-0.5">Vue direction de semaine — priorités, risques, décisions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={generatePlan} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/25 transition">
              <Target size={14} /> Générer le plan de semaine
            </button>
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm font-medium hover:border-copper/30 transition">
                <FileText size={14} /> Modifier
              </button>
            )}
          </div>
        </div>

        {/* Weekly Compass */}
        <div className="grid grid-cols-4 gap-3">
          {focusItems.map(item => (
            <div key={item.label} className="rounded-xl border border-exec/10 bg-carbon p-4 text-center">
              <p className="text-2xl font-bold text-copper-light">{item.value}</p>
              <p className="text-xs text-subtle font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {editing ? (
          /* Edit mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Priorités">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-subtle font-semibold">Semaine</label>
                  <input value={form.weekLabel} onChange={e => setForm({...form, weekLabel: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
                </div>
                {[1,2,3].map(n => (
                  <div key={n}>
                    <label className="text-xs text-subtle font-semibold">Priorité #{n}</label>
                    <input
                      value={form[`priority${n}` as keyof typeof form]}
                      onChange={e => setForm({...form, [`priority${n}`]: e.target.value})}
                      className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-subtle font-semibold flex items-center gap-1"><AlertTriangle size={11} /> Risque principal</label>
                  <input value={form.mainRisk} onChange={e => setForm({...form, mainRisk: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Décisions & Notes">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-subtle font-semibold">Décisions (une par ligne)</label>
                  <textarea value={form.decisions} onChange={e => setForm({...form, decisions: e.target.value})} rows={4} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-subtle font-semibold">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">Sauvegarder</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          /* View mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Priorités de la semaine">
              <div className="space-y-3">
                {[
                  { n: 1, val: plan?.priority1, accent: true },
                  { n: 2, val: plan?.priority2 },
                  { n: 3, val: plan?.priority3 },
                ].map(p => (
                  <div key={p.n} className={`p-3 rounded-lg border ${p.accent ? 'bg-copper/8 border-copper/15' : 'bg-deep border-exec/10'}`}>
                    <p className={`text-xs font-semibold mb-1 ${p.accent ? 'text-copper' : 'text-subtle'}`}>Priorité #{p.n}</p>
                    <p className={`text-sm font-medium ${p.accent ? 'text-ivory' : 'text-muted'}`}>{p.val || '—'}</p>
                  </div>
                ))}
                {plan?.mainRisk && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/20">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-red-400 font-semibold">Risque principal</p>
                      <p className="text-sm text-red-300 mt-0.5">{plan.mainRisk}</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard title="Décisions">
                {plan?.decisions && plan.decisions.length > 0 ? (
                  <div className="space-y-1.5">
                    {plan.decisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-deep/60">
                        <CheckSquare size={13} className="text-copper mt-0.5 shrink-0" />
                        <p className="text-sm text-muted">{d}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-subtle">Aucune décision enregistrée</p>}
              </SectionCard>
              <SectionCard title="Notes">
                <p className="text-sm text-muted whitespace-pre-wrap">{plan?.notes || 'Aucune note'}</p>
              </SectionCard>
            </div>
          </div>
        )}

        {/* Timeline */}
        <SectionCard title="Historique des semaines">
          <div className="space-y-2">
            {state.weeklyPlans.map(wp => (
              <div key={wp.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-deep/60 border border-exec/5">
                <Calendar size={14} className="text-copper shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ivory">{wp.weekLabel}</p>
                  <p className="text-xs text-subtle">P1: {wp.priority1}</p>
                </div>
                <span className="text-xs text-subtle">{new Date(wp.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

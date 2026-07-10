import { useState, useEffect } from 'react';
import { Calendar, Target, AlertTriangle, CheckSquare, FileText, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

export default function Weekly() {
  const { showToast } = useStore();
  const { data: weeklyData, loading, setData: setWeeklyData } = useApiQuery(api.getWeekly, []);
  const { data: runsData } = useApiQuery(api.getAgentRuns, []);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const plans = Array.isArray(weeklyData) ? weeklyData : [];
  const plan = plans[plans.length - 1] || null;

  const [form, setForm] = useState({
    weekLabel: '',
    priority1: '',
    priority2: '',
    priority3: '',
    mainRisk: '',
    decisions: '',
    status: 'active',
  });

  useEffect(() => {
    if (plan) {
      setForm({
        weekLabel: plan.week_label || '',
        priority1: plan.focus_primary || '',
        priority2: plan.focus_secondary || '',
        priority3: plan.focus_tertiary || '',
        mainRisk: plan.main_risk || '',
        decisions: plan.decision_note || '',
        status: plan.status || 'active',
      });
    }
  }, [plan?.id]);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const result: any = await api.runChiefOfStaff({ mode: 'report' });
      if (result?.result?.report) {
        setForm({
          weekLabel: `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
          priority1: result.result.priority1 || '',
          priority2: result.result.priority2 || '',
          priority3: '',
          mainRisk: '',
          decisions: result.result.report || '',
          status: 'active',
        });
        setEditing(true);
        showToast('Plan généré par le Chief of Staff');
      } else {
        showToast('Rapport reçu mais format inattendu');
      }
      const fresh = await api.getWeekly();
      setWeeklyData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur génération plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        week_label: form.weekLabel || `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
        focus_primary: form.priority1,
        focus_secondary: form.priority2,
        focus_tertiary: form.priority3,
        main_risk: form.mainRisk,
        decision_note: form.decisions,
        status: form.status || 'active',
      };
      if (plan?.id) {
        await api.updateWeekly(plan.id, payload);
      } else {
        await api.createWeekly(payload);
      }
      setEditing(false);
      showToast('Plan hebdomadaire sauvegardé');
      const fresh = await api.getWeekly();
      setWeeklyData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const focusItems = [
    { label: 'Contenu', value: 0 },
    { label: 'Business', value: 0 },
    { label: 'Delivery', value: 0 },
    { label: 'Agents', value: Array.isArray(runsData) ? runsData.filter((r: any) => r.run_status === 'done').length : 0 },
  ];

  return (
    <div>
      <Topbar title="Revue Hebdomadaire" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ivory">{plan?.week_label || 'Nouvelle semaine'}</h2>
            <p className="text-sm text-subtle mt-0.5">Vue direction de semaine — priorités, risques, décisions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePlan}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/25 transition disabled:opacity-50"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
              Générer le plan de semaine
            </button>
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm font-medium hover:border-copper/30 transition">
                <FileText size={14} /> Modifier
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {focusItems.map(item => (
            <div key={item.label} className="rounded-xl border border-exec/10 bg-carbon p-4 text-center">
              <p className="text-2xl font-bold text-copper-light">{item.value}</p>
              <p className="text-xs text-subtle font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {editing ? (
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
                    <input value={form[`priority${n}` as keyof typeof form]} onChange={e => setForm({...form, [`priority${n}`]: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
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
                  <label className="text-xs text-subtle font-semibold">Décisions</label>
                  <textarea value={form.decisions} onChange={e => setForm({...form, decisions: e.target.value})} rows={6} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition disabled:opacity-50">
                    {saving ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                    Sauvegarder
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Priorités de la semaine">
              <div className="space-y-3">
                {[
                  { n: 1, val: plan?.focus_primary, accent: true },
                  { n: 2, val: plan?.focus_secondary },
                  { n: 3, val: plan?.focus_tertiary },
                ].map(p => (
                  <div key={p.n} className={`p-3 rounded-lg border ${p.accent ? 'bg-copper/8 border-copper/15' : 'bg-deep border-exec/10'}`}>
                    <p className={`text-xs font-semibold mb-1 ${p.accent ? 'text-copper' : 'text-subtle'}`}>Priorité #{p.n}</p>
                    <p className={`text-sm font-medium ${p.accent ? 'text-ivory' : 'text-muted'}`}>{p.val || '—'}</p>
                  </div>
                ))}
                {plan?.main_risk && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/20">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-red-400 font-semibold">Risque principal</p>
                      <p className="text-sm text-red-300 mt-0.5">{plan.main_risk}</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
            <div className="space-y-4">
              <SectionCard title="Décisions">
                {plan?.decision_note ? (
                  <div className="space-y-1.5">
                    {plan.decision_note.split('\n').filter(Boolean).map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-deep/60">
                        <CheckSquare size={13} className="text-copper mt-0.5 shrink-0" />
                        <p className="text-sm text-muted">{d}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-subtle">Aucune décision enregistrée</p>}
              </SectionCard>
              <SectionCard title="Notes">
                <p className="text-sm text-muted whitespace-pre-wrap">{plan?.decision_note || 'Aucune note'}</p>
              </SectionCard>
            </div>
          </div>
        )}

        <SectionCard title="Historique des semaines">
          <div className="space-y-2">
            {plans.slice().reverse().map((wp: any) => (
              <div key={wp.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-deep/60 border border-exec/5">
                <Calendar size={14} className="text-copper shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ivory">{wp.week_label}</p>
                  <p className="text-xs text-subtle">P1: {wp.focus_primary}</p>
                </div>
                <span className="text-xs text-subtle">{wp.updated_at ? new Date(wp.updated_at).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

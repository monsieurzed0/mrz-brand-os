import { useMemo, useState } from 'react';
import { Users, Plus, Target, Flame, Thermometer, Snowflake } from 'lucide-react';

import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import FunnelChart from '@/components/charts/FunnelChart';

import { useStore } from '@/lib/useStore';
import { STATUS_MAP } from '@/lib/constants';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import type { LeadStatus } from '@/types';

const LEAD_STATUSES: LeadStatus[] = [
  'lead_new',
  'lead_qualified',
  'lead_followup',
  'lead_meeting',
  'lead_proposal',
  'lead_won',
  'lead_lost',
];

type UiLead = {
  id: string;
  name: string;
  source: string;
  need: string;
  level: 'cold' | 'warm' | 'hot';
  nextAction: string;
  followupDraft: string;
  status: LeadStatus;
};

function normalizeLevel(value?: string): 'cold' | 'warm' | 'hot' {
  if (!value) return 'cold';
  const v = value.toLowerCase();

  if (v === 'hot' || v === 'chaud') return 'hot';
  if (v === 'warm' || v === 'tiède' || v === 'tiede') return 'warm';
  return 'cold';
}

function levelToDb(value?: 'cold' | 'warm' | 'hot') {
  if (value === 'hot') return 'chaud';
  if (value === 'warm') return 'tiède';
  return 'froid';
}

export default function LeadDesk() {
  const { showToast } = useStore();

  const {
    data: leadsData,
    loading,
    error,
    setData: setLeadsData,
  } = useApiQuery(api.getLeads, []);

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<UiLead>>({
    name: '',
    source: '',
    need: '',
    level: 'cold',
    nextAction: '',
    followupDraft: '',
    status: 'lead_new',
  });

  const leads: UiLead[] = useMemo(() => {
    const safe = Array.isArray(leadsData) ? leadsData : [];
    return safe.map((l: any) => ({
      id: l.id,
      name: l.name || '',
      source: l.source || '',
      need: l.besoin || '',
      level: normalizeLevel(l.niveau),
      nextAction: l.next_action || '',
      followupDraft: l.relance_brouillon || '',
      status: (l.status || 'lead_new') as LeadStatus,
    }));
  }, [leadsData]);

  const selected = leads.find((l) => l.id === selectedId);

  const funnel = useMemo(
    () => [
      { label: 'Nouveaux', value: leads.filter((l) => l.status === 'lead_new').length },
      { label: 'Qualifiés', value: leads.filter((l) => l.status === 'lead_qualified').length },
      { label: 'Relance', value: leads.filter((l) => l.status === 'lead_followup').length },
      { label: 'RDV', value: leads.filter((l) => l.status === 'lead_meeting').length },
      { label: 'Proposition', value: leads.filter((l) => l.status === 'lead_proposal').length },
      { label: 'Gagné', value: leads.filter((l) => l.status === 'lead_won').length },
    ],
    [leads]
  );

  const handleSave = async () => {
    if (!form.name) {
      showToast('Nom manquant');
      return;
    }

    try {
      const payload = {
        name: form.name || '',
        source: form.source || '',
        besoin: form.need || '',
        niveau: levelToDb(form.level || 'cold'),
        next_action: form.nextAction || '',
        relance_brouillon: form.followupDraft || '',
        status: form.status || 'lead_new',
      };

      const result: any = await api.createLead(payload);

      const newLead = {
        id: result.id,
        ...payload,
      };

      setLeadsData((prev: any) => [...(prev || []), newLead]);

      setForm({
        name: '',
        source: '',
        need: '',
        level: 'cold',
        nextAction: '',
        followupDraft: '',
        status: 'lead_new',
      });

      setShowForm(false);
      showToast('Lead ajouté');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l’ajout');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteLead(id);
      setLeadsData((prev: any) => (prev || []).filter((item: any) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
      showToast('Lead supprimé');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await api.updateLead(id, { status });

      setLeadsData((prev: any) =>
        (prev || []).map((item: any) =>
          item.id === id ? { ...item, status } : item
        )
      );

      showToast('Statut mis à jour');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const heatIcon = (level: string) => {
    if (level === 'hot') return <Flame size={13} className="text-copper-light" />;
    if (level === 'warm') return <Thermometer size={13} className="text-copper" />;
    return <Snowflake size={13} className="text-subtle" />;
  };

  return (
    <div>
      <Topbar title="Lead Desk" />

      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Leads</h2>
            <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">
              {leads.length}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => showToast('Qualification simulée')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/25 transition"
            >
              <Target size={14} /> Qualifier lead
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm hover:border-copper/30 transition"
            >
              <Plus size={14} /> Nouveau lead
            </button>
          </div>
        </div>

        {loading ? <div className="text-sm text-subtle">Chargement des leads...</div> : null}
        {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

        {/* Funnel */}
        <SectionCard title="Funnel commercial">
          <FunnelChart steps={funnel} />
        </SectionCard>

        {showForm && (
          <SectionCard title="Nouveau lead">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Nom</label>
                <input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                <label className="text-xs text-subtle font-semibold">Besoin</label>
                <input
                  value={form.need || ''}
                  onChange={(e) => setForm({ ...form, need: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Niveau</label>
                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value as 'cold' | 'warm' | 'hot' })
                  }
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  <option value="cold">Froid</option>
                  <option value="warm">Tiède</option>
                  <option value="hot">Chaud</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Prochaine action</label>
                <input
                  value={form.nextAction || ''}
                  onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_MAP[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-xs text-subtle font-semibold">Brouillon de relance</label>
                <textarea
                  value={form.followupDraft || ''}
                  onChange={(e) => setForm({ ...form, followupDraft: e.target.value })}
                  rows={2}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"
              >
                Ajouter
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Table */}
          <div className="lg:col-span-2 rounded-xl border border-exec/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-exec/5">
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-carbon/40 transition cursor-pointer ${
                      selectedId === l.id ? 'bg-copper/5' : ''
                    }`}
                    onClick={() => setSelectedId(l.id)}
                  >
                    <td className="px-4 py-3 text-ivory font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted text-xs">{l.source}</td>
                    <td className="px-4 py-3">{heatIcon(l.level)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(l.id);
                        }}
                        className="text-xs text-subtle hover:text-red-400 transition"
                      >
                        Suppr.
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <SectionCard title="Détail du lead">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {heatIcon(selected.level)}
                    <span className="text-sm font-bold text-ivory">{selected.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-deep">
                      <span className="text-subtle">Source:</span>
                      <p className="text-muted mt-0.5">{selected.source}</p>
                    </div>
                    <div className="p-2 rounded bg-deep">
                      <span className="text-subtle">Besoin:</span>
                      <p className="text-muted mt-0.5">{selected.need}</p>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-deep text-xs">
                    <span className="text-subtle">Prochaine action:</span>
                    <p className="text-muted mt-0.5">{selected.nextAction}</p>
                  </div>

                  {selected.followupDraft ? (
                    <div className="p-3 rounded-lg bg-copper/5 border border-copper/10">
                      <p className="text-xs text-copper font-semibold mb-1">Brouillon de relance</p>
                      <p className="text-xs text-muted whitespace-pre-wrap">{selected.followupDraft}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast('Relance préparée')}
                      className="px-3 py-1.5 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-semibold hover:bg-copper/25 transition"
                    >
                      Préparer relance
                    </button>

                    <select
                      value={selected.status}
                      onChange={(e) => handleStatusChange(selected.id, e.target.value as LeadStatus)}
                      className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_MAP[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <div className="rounded-xl border border-exec/10 bg-carbon p-8 text-center">
                <Users size={24} className="text-subtle mx-auto mb-2" />
                <p className="text-sm text-subtle">Sélectionnez un lead</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

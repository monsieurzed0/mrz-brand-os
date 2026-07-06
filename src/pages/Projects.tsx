import { useMemo, useState } from 'react';
import { Briefcase, Plus, CheckCircle, Circle, AlertTriangle } from 'lucide-react';

import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import FlowChart from '@/components/charts/FlowChart';

import { useStore } from '@/lib/useStore';
import { STATUS_MAP } from '@/lib/constants';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import type { ProjectStatus } from '@/types';

const PROJECT_STATUSES: ProjectStatus[] = [
  'project_planned',
  'project_active',
  'project_waiting',
  'project_delivered',
  'project_archived',
];

type UiProject = {
  id: string;
  client: string;
  offer: string;
  phase: string;
  blockers: string;
  deliverables: string[];
  status: ProjectStatus;
  milestones: { label: string; done: boolean }[];
};

function parseDeliverables(value?: string) {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildMilestonesFromDeliverables(deliverables: string[]) {
  return deliverables.map((item) => ({
    label: item,
    done: false,
  }));
}

export default function Projects() {
  const { showToast } = useStore();

  const {
    data: projectsData,
    loading,
    error,
    setData: setProjectsData,
  } = useApiQuery(api.getProjects, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<Partial<UiProject>>({
    client: '',
    offer: '',
    phase: '',
    blockers: '',
    deliverables: [],
    status: 'project_planned',
    milestones: [],
  });

  const projects: UiProject[] = useMemo(() => {
    const safe = Array.isArray(projectsData) ? projectsData : [];
    return safe.map((p: any) => {
      const deliverables = parseDeliverables(p.livrables);
      return {
        id: p.id,
        client: p.client_name || '',
        offer: p.offre || '',
        phase: p.phase || '',
        blockers: p.blocage || '',
        deliverables,
        status: (p.status || 'project_planned') as ProjectStatus,
        milestones: buildMilestonesFromDeliverables(deliverables),
      };
    });
  }, [projectsData]);

  const selected = projects.find((p) => p.id === selectedId);

  const health = useMemo(
    () => [
      { label: 'Planifié', value: projects.filter((p) => p.status === 'project_planned').length },
      { label: 'En cours', value: projects.filter((p) => p.status === 'project_active').length },
      { label: 'Attente', value: projects.filter((p) => p.status === 'project_waiting').length },
      { label: 'Livré', value: projects.filter((p) => p.status === 'project_delivered').length },
    ],
    [projects]
  );

  const handleSave = async () => {
    if (!form.client) {
      showToast('Client manquant');
      return;
    }

    try {
      const payload = {
        client_name: form.client || '',
        offre: form.offer || '',
        phase: form.phase || '',
        blocage: form.blockers || '',
        livrables: Array.isArray(form.deliverables) ? form.deliverables.join('\n') : '',
        status: form.status || 'project_planned',
      };

      const result: any = await api.createProject(payload);

      const newProject = {
        id: result.id,
        ...payload,
      };

      setProjectsData((prev: any) => [...(prev || []), newProject]);

      setForm({
        client: '',
        offer: '',
        phase: '',
        blockers: '',
        deliverables: [],
        status: 'project_planned',
        milestones: [],
      });

      setShowForm(false);
      showToast('Projet ajouté');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l’ajout');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjectsData((prev: any) => (prev || []).filter((item: any) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
      showToast('Projet supprimé');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try {
      await api.updateProject(id, { status });

      setProjectsData((prev: any) =>
        (prev || []).map((item: any) =>
          item.id === id ? { ...item, status } : item
        )
      );

      showToast('Statut projet mis à jour');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const toggleMilestone = () => {
    showToast("Les milestones réelles seront branchées dans une étape suivante");
  };

  return (
    <div>
      <Topbar title="Projets" />

      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Delivery Board</h2>
            <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">
              {projects.length}
            </span>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm hover:border-copper/30 transition"
          >
            <Plus size={14} /> Nouveau projet
          </button>
        </div>

        {loading ? <div className="text-sm text-subtle">Chargement des projets...</div> : null}
        {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

        <SectionCard title="Santé des projets">
          <FlowChart steps={health} />
        </SectionCard>

        {showForm && (
          <SectionCard title="Nouveau projet">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Client</label>
                <input
                  value={form.client || ''}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Offre</label>
                <input
                  value={form.offer || ''}
                  onChange={(e) => setForm({ ...form, offer: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Phase</label>
                <input
                  value={form.phase || ''}
                  onChange={(e) => setForm({ ...form, phase: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Blocages</label>
                <input
                  value={form.blockers || ''}
                  onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_MAP[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs text-subtle font-semibold">Livrables (une ligne = un livrable)</label>
                <textarea
                  value={Array.isArray(form.deliverables) ? form.deliverables.join('\n') : ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deliverables: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                    })
                  }
                  rows={4}
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
          {/* Projects list */}
          <div className="lg:col-span-2 space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`rounded-xl border bg-carbon p-4 cursor-pointer transition hover:border-copper/20 ${
                  selectedId === p.id ? 'border-copper/30' : 'border-exec/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-ivory">{p.client}</p>
                    <p className="text-xs text-subtle">{p.offer}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>Phase : {p.phase}</span>
                  {p.blockers ? (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle size={11} /> {p.blockers}
                    </span>
                  ) : null}
                </div>

                {/* Milestones visual only for now */}
                <div className="flex flex-col gap-2 mt-3">
                  {p.milestones.map((m, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMilestone();
                      }}
                      className="flex items-center gap-1 text-xs"
                    >
                      {m.done ? (
                        <CheckCircle size={12} className="text-copper" />
                      ) : (
                        <Circle size={12} className="text-subtle" />
                      )}
                      <span className={m.done ? 'text-muted line-through' : 'text-muted'}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div>
            {selected ? (
              <SectionCard title={`Projet — ${selected.client}`}>
                <div className="space-y-3">
                  <div className="p-2 rounded bg-deep text-xs">
                    <span className="text-subtle">Offre:</span>
                    <p className="text-muted mt-0.5">{selected.offer}</p>
                  </div>

                  <div className="p-2 rounded bg-deep text-xs">
                    <span className="text-subtle">Phase:</span>
                    <p className="text-muted mt-0.5">{selected.phase}</p>
                  </div>

                  {selected.blockers ? (
                    <div className="p-2 rounded bg-red-950/20 border border-red-900/20 text-xs">
                      <span className="text-red-400 font-semibold">Blocage:</span>
                      <p className="text-red-300 mt-0.5">{selected.blockers}</p>
                    </div>
                  ) : null}

                  <div className="p-2 rounded bg-deep text-xs">
                    <span className="text-subtle">Livrables:</span>
                    <div className="mt-1 space-y-1">
                      {selected.deliverables.map((d, i) => (
                        <p key={i} className="text-muted">
                          → {d}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-subtle font-semibold mb-1">Milestones</p>
                    {selected.milestones.map((m, i) => (
                      <button
                        key={i}
                        onClick={toggleMilestone}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-deep/60 w-full text-left transition"
                      >
                        {m.done ? (
                          <CheckCircle size={14} className="text-copper" />
                        ) : (
                          <Circle size={14} className="text-subtle" />
                        )}
                        <span className={`text-xs ${m.done ? 'text-muted line-through' : 'text-ivory'}`}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as ProjectStatus)}
                    className="w-full bg-deep border border-exec/15 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_MAP[s]}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      handleDelete(selected.id);
                    }}
                    className="text-xs text-subtle hover:text-red-400 transition"
                  >
                    Supprimer le projet
                  </button>
                </div>
              </SectionCard>
            ) : (
              <div className="rounded-xl border border-exec/10 bg-carbon p-8 text-center">
                <Briefcase size={24} className="text-subtle mx-auto mb-2" />
                <p className="text-sm text-subtle">Sélectionnez un projet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

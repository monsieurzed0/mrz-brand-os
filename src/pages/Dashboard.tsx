import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  PenTool,
  Palette,
  Target,
  Calendar,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';

import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { DIGITAL_PRESENCE } from '@/lib/constants';

function SafeMetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-exec/10 bg-carbon p-5">
      <div className="text-xs text-subtle font-semibold uppercase tracking-wider">{label}</div>
      <div className="mt-3 text-3xl font-bold text-ivory">{value}</div>
    </div>
  );
}

function SafeList({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-lg bg-deep/60 border border-exec/8 px-3 py-2"
        >
          <span className="text-xs text-muted">{item.label}</span>
          <span className="text-sm font-semibold text-ivory">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: summary, loading: summaryLoading, error: summaryError } = useApiQuery(
    api.getDashboardSummary,
    []
  );

  const { data: contentIdeasData } = useApiQuery(api.getContentIdeas, []);
  const { data: scriptsData } = useApiQuery(api.getScripts, []);
  const { data: leadsData } = useApiQuery(api.getLeads, []);
  const { data: projectsData } = useApiQuery(api.getProjects, []);
  const { data: proofsData } = useApiQuery(api.getProofs, []);
  const { data: mediaLinksData } = useApiQuery(api.getMediaLinks, []);

  const contentIdeas = Array.isArray(contentIdeasData) ? contentIdeasData : [];
  const scripts = Array.isArray(scriptsData) ? scriptsData : [];
  const leads = Array.isArray(leadsData) ? leadsData : [];
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const proofs = Array.isArray(proofsData) ? proofsData : [];
  const mediaLinks = Array.isArray(mediaLinksData) ? mediaLinksData : [];

  const quickActions = [
    { label: 'Générer 5 idées', icon: Sparkles, route: '/content' },
    { label: 'Content Engine', icon: Zap, route: '/content-engine' },
    { label: 'Nouveau script', icon: PenTool, route: '/scripts' },
    { label: 'Prompt visuel', icon: Palette, route: '/visual-lab' },
    { label: 'Qualifier lead', icon: Target, route: '/leads' },
    { label: 'Revue hebdo', icon: Calendar, route: '/weekly' },
  ];

  const weeklyPlan = summary?.weekly || null;
  const metrics = summary?.metrics || {
    ideasReady: 0,
    scriptsReview: 0,
    hotLeads: 0,
    activeProjects: 0,
    proofsValidated: 0,
    agentRuns: 0,
    unreadNotifications: 0,
  };

  const latestRuns = Array.isArray(summary?.latestRuns) ? summary.latestRuns : [];

  const priorityLeads = useMemo(() => {
    return leads
      .filter(
        (l: any) =>
          l.niveau === 'chaud' ||
          l.status === 'lead_qualified' ||
          l.status === 'lead_proposal'
      )
      .slice(0, 3);
  }, [leads]);

  const activeOrWaitingProjects = useMemo(() => {
    return projects
      .filter((p: any) => p.status === 'project_waiting' || p.status === 'project_active')
      .slice(0, 3);
  }, [projects]);

  const digitalPresence = useMemo(() => {
    if (mediaLinks.length > 0) {
      return mediaLinks.map((item: any) => ({
        name: item.label,
        url: item.url,
      }));
    }
    return DIGITAL_PRESENCE;
  }, [mediaLinks]);

  const contentFlow = useMemo(
    () => [
      { label: 'À idéer', value: contentIdeas.filter((i: any) => i.status === 'idea_pending').length },
      { label: 'Prêtes', value: contentIdeas.filter((i: any) => i.status === 'idea_ready').length },
      { label: 'Brouillon', value: scripts.filter((s: any) => s.status === 'draft').length },
      { label: 'À valider', value: scripts.filter((s: any) => s.status === 'ready_review').length },
      { label: 'Validé', value: scripts.filter((s: any) => s.status === 'approved').length },
      { label: 'Publié', value: scripts.filter((s: any) => s.status === 'published').length },
    ],
    [contentIdeas, scripts]
  );

  const leadFunnel = useMemo(
    () => [
      { label: 'Nouveaux', value: leads.filter((l: any) => l.status === 'lead_new').length },
      { label: 'Qualifiés', value: leads.filter((l: any) => l.status === 'lead_qualified').length },
      { label: 'Relance', value: leads.filter((l: any) => l.status === 'lead_followup').length },
      { label: 'RDV', value: leads.filter((l: any) => l.status === 'lead_meeting').length },
      { label: 'Proposition', value: leads.filter((l: any) => l.status === 'lead_proposal').length },
      { label: 'Gagné', value: leads.filter((l: any) => l.status === 'lead_won').length },
    ],
    [leads]
  );

  const projectHealth = useMemo(
    () => [
      { label: 'Planifié', value: projects.filter((p: any) => p.status === 'project_planned').length },
      { label: 'En cours', value: projects.filter((p: any) => p.status === 'project_active').length },
      { label: 'Attente', value: projects.filter((p: any) => p.status === 'project_waiting').length },
      { label: 'Livré', value: projects.filter((p: any) => p.status === 'project_delivered').length },
    ],
    [projects]
  );

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-5 animate-fade-in">
        {summaryLoading ? <div className="text-sm text-subtle">Chargement du dashboard...</div> : null}
        {summaryError ? <div className="text-sm text-red-400">Erreur : {summaryError}</div> : null}

        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.route)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-exec/15 bg-carbon hover:border-copper/30 hover:bg-copper/5 transition text-sm font-semibold text-muted hover:text-copper-light"
            >
              <a.icon size={15} />
              {a.label}
            </button>
          ))}
        </div>

        <SectionCard title="Priorité centrale">
          {weeklyPlan ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-copper/10 border border-copper/20">
                <p className="text-[10px] text-copper font-bold uppercase tracking-wider mb-1.5">
                  Priorité #1
                </p>
                <p className="text-sm text-ivory font-semibold leading-snug">
                  {weeklyPlan.focus_primary}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-deep border border-exec/10">
                <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">
                  Priorité #2
                </p>
                <p className="text-sm text-muted">{weeklyPlan.focus_secondary || 'Non définie'}</p>
              </div>

              <div className="p-3 rounded-lg bg-deep border border-exec/10">
                <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">
                  Priorité #3
                </p>
                <p className="text-sm text-muted">{weeklyPlan.focus_tertiary || 'Non définie'}</p>
              </div>

              {weeklyPlan.main_risk ? (
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/20">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
                    Risque
                  </p>
                  <p className="text-xs text-red-300 leading-relaxed">{weeklyPlan.main_risk}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-subtle">Aucun plan hebdomadaire</p>
          )}
        </SectionCard>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SafeMetricCard label="Idées prêtes" value={metrics.ideasReady} />
          <SafeMetricCard label="Scripts à valider" value={metrics.scriptsReview} />
          <SafeMetricCard label="Leads chauds" value={metrics.hotLeads} />
          <SafeMetricCard label="Projets actifs" value={metrics.activeProjects} />
          <SafeMetricCard label="Preuves validées" value={metrics.proofsValidated} />
          <SafeMetricCard label="Runs agents" value={metrics.agentRuns} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Content Flow">
            <SafeList items={contentFlow} />
          </SectionCard>

          <SectionCard title="Lead Funnel">
            <SafeList items={leadFunnel} />
          </SectionCard>

          <SectionCard title="Project Health">
            <SafeList items={projectHealth} />
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard
            title="Leads prioritaires"
            headerRight={
              <button
                onClick={() => navigate('/leads')}
                className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold"
              >
                Voir tout <ArrowRight size={12} />
              </button>
            }
          >
            <div className="space-y-2">
              {priorityLeads.length === 0 ? (
                <p className="text-xs text-subtle text-center py-2">Aucun lead prioritaire</p>
              ) : (
                priorityLeads.map((l: any) => (
                  <div key={l.id} className="rounded-lg bg-deep/60 border border-exec/8 p-3">
                    <p className="text-xs font-semibold text-ivory">{l.name}</p>
                    <p className="text-[10px] text-subtle mt-1">{l.besoin}</p>
                    <p className="text-[10px] text-copper mt-2">{l.status}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Projets actifs"
            headerRight={
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold"
              >
                Voir tout <ArrowRight size={12} />
              </button>
            }
          >
            <div className="space-y-2">
              {activeOrWaitingProjects.map((p: any) => (
                <div key={p.id} className="rounded-lg bg-deep/60 border border-exec/8 p-3">
                  <p className="text-xs font-semibold text-ivory">{p.client_name}</p>
                  <p className="text-[10px] text-subtle mt-1">{p.phase}</p>
                  <p className="text-[10px] text-copper mt-2">{p.status}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Présence digitale"
            headerRight={
              <button
                onClick={() => navigate('/media-center')}
                className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold"
              >
                Media Center <ArrowRight size={12} />
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-1.5">
              {digitalPresence.map((link: any) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-deep/80 border border-transparent hover:border-copper/15 transition group"
                >
                  <span className="text-[11px] text-muted group-hover:text-ivory font-medium truncate">
                    {link.name}
                  </span>
                  <ExternalLink size={10} className="text-subtle/50 group-hover:text-copper transition shrink-0" />
                </a>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Derniers runs agents">
          <div className="space-y-3">
            {latestRuns.length === 0 ? (
              <div className="text-sm text-subtle">Aucun run agent disponible.</div>
            ) : (
              latestRuns.map((run: any) => (
                <div key={run.id} className="rounded-2xl border border-white/5 bg-[#0D0D10] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#F0EDE8]">{run.agent_name}</div>
                    <div className="text-xs text-[#EF9F27]">{run.run_status}</div>
                  </div>
                  <div className="mt-2 text-sm text-[#A1A1AA]">
                    {run.output_summary || run.input_summary || 'Aucun résumé'}
                  </div>
                  <div className="mt-2 text-xs text-[#71717A]">{run.created_at}</div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

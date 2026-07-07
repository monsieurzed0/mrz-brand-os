import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  FileText,
  Users,
  Briefcase,
  Shield,
  Bot,
  Zap,
  PenTool,
  Palette,
  Target,
  Calendar,
  Sparkles,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

import Topbar from '@/components/Topbar';
import KPICard from '@/components/KPICard';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';

import ChartGuard from '@/components/ChartGuard';
import BrandPulseRadar from '@/components/charts/BrandPulseRadar';

import FlowChart from '@/components/charts/FlowChart';
import ChartGuard from '@/components/ChartGuard';

import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ASSETS, CLIENT_LOGOS } from '@/lib/constants';
import { buildDashboardViewModel } from '@/lib/dashboardViewModel';

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

  const { data: summary, loading: summaryLoading, error: summaryError } = useApiQuery(api.getDashboardSummary, []);
  const { data: contentIdeasData } = useApiQuery(api.getContentIdeas, []);
  const { data: scriptsData } = useApiQuery(api.getScripts, []);
  const { data: leadsData } = useApiQuery(api.getLeads, []);
  const { data: projectsData } = useApiQuery(api.getProjects, []);
  const { data: proofsData } = useApiQuery(api.getProofs, []);
  const { data: mediaLinksData } = useApiQuery(api.getMediaLinks, []);

  const vm = useMemo(
    () =>
      buildDashboardViewModel({
        summary,
        contentIdeas: contentIdeasData,
        scripts: scriptsData,
        leads: leadsData,
        projects: projectsData,
        proofs: proofsData,
        mediaLinks: mediaLinksData,
      }),
    [summary, contentIdeasData, scriptsData, leadsData, projectsData, proofsData, mediaLinksData]
  );

  const quickActions = [
    { label: 'Générer 5 idées', icon: Sparkles, route: '/content' },
    { label: 'Content Engine', icon: Zap, route: '/content-engine' },
    { label: 'Nouveau script', icon: PenTool, route: '/scripts' },
    { label: 'Prompt visuel', icon: Palette, route: '/visual-lab' },
    { label: 'Qualifier lead', icon: Target, route: '/leads' },
    { label: 'Revue hebdo', icon: Calendar, route: '/weekly' },
  ];

  const safeBrandPulse = Array.isArray(vm.brandPulse)
  ? vm.brandPulse
      .map((item: any) => ({
        label: String(item?.label || ''),
        value: Number(item?.value || 0),
      }))
      .filter((item: any) => item.label)
  : [];

  const safeContentFlow = Array.isArray(vm.contentFlow)
  ? vm.contentFlow
      .map((item: any) => ({
        label: String(item?.label || ''),
        value: Number(item?.value || 0),
      }))
      .filter((item: any) => item.label)
  : [];
  
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard
            title="Priorité centrale"
            className="lg:col-span-1"
            headerRight={<StatusBadge status="project_active" />}
          >
            {vm.weeklyPlan ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-copper/10 border border-copper/20">
                  <p className="text-[10px] text-copper font-bold uppercase tracking-wider mb-1.5">Priorité #1</p>
                  <p className="text-sm text-ivory font-semibold leading-snug">{vm.weeklyPlan.focus_primary}</p>
                </div>

                <div className="p-3 rounded-lg bg-deep border border-exec/10">
                  <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">Priorité #2</p>
                  <p className="text-sm text-muted">{vm.weeklyPlan.focus_secondary || 'Non définie'}</p>
                </div>

                <div className="p-3 rounded-lg bg-deep border border-exec/10">
                  <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">Priorité #3</p>
                  <p className="text-sm text-muted">{vm.weeklyPlan.focus_tertiary || 'Non définie'}</p>
                </div>

                {vm.weeklyPlan.main_risk ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-900/20">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-0.5">Risque</p>
                      <p className="text-xs text-red-300 leading-relaxed">{vm.weeklyPlan.main_risk}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-subtle">Aucun plan hebdomadaire</p>
            )}
          </SectionCard>

          
          <SectionCard title="Brand Pulse" subtitle="Santé globale de la marque">
              <ChartGuard title="Brand Pulse">
                <div className="flex justify-center" style={{ height: '200px' }}>
                    <BrandPulseRadar data={safeBrandPulse} />
                </div>
              </ChartGuard>
          </SectionCard>

          <SectionCard title="Agent Heartbeat" subtitle="État des agents IA">
            <div className="space-y-2">
              {vm.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-deep/60 border border-exec/8 hover:border-copper/15 transition"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      agent.status === 'active'
                        ? 'bg-copper animate-pulse-copper'
                        : agent.status === 'error'
                        ? 'bg-red-400'
                        : 'bg-subtle/40'
                    }`}
                  />
                  <span className="text-xs font-semibold text-ivory flex-1">{agent.name}</span>
                  <StatusBadge status={agent.status as any} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Idées prêtes" value={vm.metrics.ideasReady} icon={<Lightbulb size={18} />} accent />
          <KPICard label="Scripts à valider" value={vm.metrics.scriptsReview} icon={<FileText size={18} />} accent={vm.metrics.scriptsReview > 0} />
          <KPICard label="Leads chauds" value={vm.metrics.hotLeads} icon={<Users size={18} />} accent={vm.metrics.hotLeads > 0} />
          <KPICard label="Projets actifs" value={vm.metrics.activeProjects} icon={<Briefcase size={18} />} />
          <KPICard label="Preuves validées" value={vm.metrics.proofsValidated} icon={<Shield size={18} />} />
          <KPICard label="Runs agents" value={vm.metrics.agentRuns} icon={<Bot size={18} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Content Flow" subtitle="Pipeline éditorial">
            <ChartGuard title="Content Flow">
              <FlowChart steps={safeContentFlow} />
            </ChartGuard>
          </SectionCard>

          <SectionCard title="Lead Funnel" subtitle="Pipeline commercial">
            <SafeList items={vm.leadFunnel} />
          </SectionCard>

          <SectionCard title="Project Health" subtitle="Santé des projets">
            <SafeList items={vm.projectHealth} />
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
              {vm.priorityLeads.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg bg-deep/60 border border-exec/8">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate">{String(l.name).split(' — ')[0]}</p>
                    <p className="text-[10px] text-subtle truncate">{l.besoin}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
              {vm.priorityLeads.length === 0 ? <p className="text-xs text-subtle text-center py-2">Aucun lead prioritaire</p> : null}
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
              {vm.activeOrWaitingProjects.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-deep/60 border border-exec/8">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate">{p.client_name}</p>
                    <p className="text-[10px] text-subtle truncate">{p.phase}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Clients & références">
            <div className="grid grid-cols-3 gap-2">
              {CLIENT_LOGOS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-center p-2.5 rounded-lg bg-deep/60 border border-exec/8 h-12 hover:border-copper/20 transition"
                >
                  <img src={c.url} alt={c.name} className="max-h-6 max-w-full object-contain opacity-60 hover:opacity-100 transition" />
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
              {vm.digitalPresence.map((link: any) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-deep/80 border border-transparent hover:border-copper/15 transition group"
                >
                  <span className="text-[11px] text-muted group-hover:text-ivory font-medium truncate">{link.name}</span>
                  <ExternalLink size={10} className="text-subtle/50 group-hover:text-copper transition shrink-0" />
                </a>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="relative rounded-xl border border-exec/15 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.03]" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
          <div className="relative flex items-center gap-6 p-6">
            <img src={ASSETS.founderPhoto} alt="Mr Z" className="w-16 h-16 rounded-full object-cover border-2 border-copper/40 shadow-premium" />
            <div className="flex-1">
              <p className="text-base font-bold text-ivory">Hervé Kevin ZEH</p>
              <p className="text-xs text-copper font-semibold mt-0.5">Fondateur · Mr Z Brand</p>
              <p className="text-xs text-muted mt-1.5">Branding · Design · Stratégie — Afrique assumée, standard premium</p>
            </div>
            <div className="flex gap-4 items-center">
              <img src={ASSETS.signalLogo} alt="SIGNAL™ by Mr Z" className="h-9 opacity-50 hover:opacity-100 transition" />
              <img src={ASSETS.proskillsLogo} alt="PROSKILLS FR" className="h-9 opacity-50 hover:opacity-100 transition" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

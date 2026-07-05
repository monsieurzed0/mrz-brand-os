import { useNavigate } from 'react-router-dom';
import { Lightbulb, FileText, Users, Briefcase, Shield, Bot, Zap, PenTool, Palette, Target, Calendar, Sparkles, ExternalLink, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/useStore';
import Topbar from '@/components/Topbar';
import KPICard from '@/components/KPICard';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import BrandPulseRadar from '@/components/charts/BrandPulseRadar';
import FunnelChart from '@/components/charts/FunnelChart';
import FlowChart from '@/components/charts/FlowChart';
import { ASSETS, CLIENT_LOGOS, DIGITAL_PRESENCE } from '@/lib/constants';

export default function Dashboard() {
  const { state } = useStore();
  const navigate = useNavigate();

  const ideasReady = state.contentIdeas.filter(i => i.status === 'idea_ready').length;
  const scriptsReview = state.scripts.filter(s => s.status === 'ready_review').length;
  const hotLeads = state.leads.filter(l => l.level === 'hot').length;
  const activeProjects = state.projects.filter(p => p.status === 'project_active').length;
  const validatedProofs = state.proofs.filter(p => p.validated).length;
  const agentRuns = state.agentRuns.filter(r => r.status === 'running' || r.status === 'done').length;

  const weeklyPlan = state.weeklyPlans[state.weeklyPlans.length - 1];

  const quickActions = [
    { label: 'Générer 5 idées', icon: Sparkles, route: '/content' },
    { label: 'Content Engine', icon: Zap, route: '/content-engine' },
    { label: 'Nouveau script', icon: PenTool, route: '/scripts' },
    { label: 'Prompt visuel', icon: Palette, route: '/visual-lab' },
    { label: 'Qualifier lead', icon: Target, route: '/leads' },
    { label: 'Revue hebdo', icon: Calendar, route: '/weekly' },
  ];

  // Content flow data
  const contentFlow = [
    { label: 'À idéer', value: state.contentIdeas.filter(i => i.status === 'idea_pending').length },
    { label: 'Prêtes', value: state.contentIdeas.filter(i => i.status === 'idea_ready').length },
    { label: 'Brouillon', value: state.scripts.filter(s => s.status === 'draft').length },
    { label: 'À valider', value: state.scripts.filter(s => s.status === 'ready_review').length },
    { label: 'Validé', value: state.scripts.filter(s => s.status === 'approved').length },
    { label: 'Publié', value: state.scripts.filter(s => s.status === 'published').length },
  ];

  // Lead funnel data
  const leadFunnel = [
    { label: 'Nouveaux', value: state.leads.filter(l => l.status === 'lead_new').length },
    { label: 'Qualifiés', value: state.leads.filter(l => l.status === 'lead_qualified').length },
    { label: 'Relance', value: state.leads.filter(l => l.status === 'lead_followup').length },
    { label: 'RDV', value: state.leads.filter(l => l.status === 'lead_meeting').length },
    { label: 'Proposition', value: state.leads.filter(l => l.status === 'lead_proposal').length },
    { label: 'Gagné', value: state.leads.filter(l => l.status === 'lead_won').length },
  ];

  // Project health
  const projectHealth = [
    { label: 'Planifié', value: state.projects.filter(p => p.status === 'project_planned').length },
    { label: 'En cours', value: state.projects.filter(p => p.status === 'project_active').length },
    { label: 'Attente', value: state.projects.filter(p => p.status === 'project_waiting').length },
    { label: 'Livré', value: state.projects.filter(p => p.status === 'project_delivered').length },
  ];

  // Brand pulse radar
  const brandPulse = [
    { label: 'Contenu', value: Math.min((state.contentIdeas.length + state.scripts.length) * 10, 90) },
    { label: 'Sales', value: Math.min(state.leads.length * 15, 85) },
    { label: 'Delivery', value: Math.min(state.projects.length * 20, 80) },
    { label: 'Preuves', value: Math.min(state.proofs.length * 20, 75) },
    { label: 'Agents', value: Math.min(state.agents.filter(a => a.status === 'active').length * 20, 85) },
    { label: 'Pipeline', value: Math.min(state.leads.filter(l => l.level === 'hot').length * 30, 70) },
  ];

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-5 animate-fade-in">

        {/* Row 1: Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map(a => (
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

        {/* Row 2: Priority + Brand Pulse + Agent Heartbeat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Central Priority */}
          <SectionCard title="Priorité centrale" className="lg:col-span-1" headerRight={<StatusBadge status="project_active" />}>
            {weeklyPlan ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-copper/10 border border-copper/20">
                  <p className="text-[10px] text-copper font-bold uppercase tracking-wider mb-1.5">Priorité #1</p>
                  <p className="text-sm text-ivory font-semibold leading-snug">{weeklyPlan.priority1}</p>
                </div>
                <div className="p-3 rounded-lg bg-deep border border-exec/10">
                  <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">Priorité #2</p>
                  <p className="text-sm text-muted">{weeklyPlan.priority2}</p>
                </div>
                <div className="p-3 rounded-lg bg-deep border border-exec/10">
                  <p className="text-[10px] text-subtle font-bold uppercase tracking-wider mb-1">Priorité #3</p>
                  <p className="text-sm text-muted">{weeklyPlan.priority3}</p>
                </div>
                {weeklyPlan.mainRisk && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-900/20">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-0.5">Risque</p>
                      <p className="text-xs text-red-300 leading-relaxed">{weeklyPlan.mainRisk}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-subtle">Aucun plan hebdomadaire</p>
            )}
          </SectionCard>

          {/* Brand Pulse */}
          <SectionCard title="Brand Pulse" subtitle="Santé globale de la marque">
            <div className="flex justify-center" style={{ height: '200px' }}>
              <BrandPulseRadar data={brandPulse} />
            </div>
          </SectionCard>

          {/* Agent Heartbeat */}
          <SectionCard title="Agent Heartbeat" subtitle="État des agents IA">
            <div className="space-y-2">
              {state.agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-deep/60 border border-exec/8 hover:border-copper/15 transition">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${agent.status === 'active' ? 'bg-copper animate-pulse-copper' : agent.status === 'error' ? 'bg-red-400' : 'bg-subtle/40'}`} />
                  <span className="text-xs font-semibold text-ivory flex-1">{agent.name}</span>
                  <StatusBadge status={agent.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Row 3: KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Idées prêtes" value={ideasReady} icon={<Lightbulb size={18} />} accent />
          <KPICard label="Scripts à valider" value={scriptsReview} icon={<FileText size={18} />} accent={scriptsReview > 0} />
          <KPICard label="Leads chauds" value={hotLeads} icon={<Users size={18} />} accent={hotLeads > 0} />
          <KPICard label="Projets actifs" value={activeProjects} icon={<Briefcase size={18} />} />
          <KPICard label="Preuves validées" value={validatedProofs} icon={<Shield size={18} />} />
          <KPICard label="Runs agents" value={agentRuns} icon={<Bot size={18} />} />
        </div>

        {/* Row 4: Flow Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Content Flow" subtitle="Pipeline éditorial">
            <FlowChart steps={contentFlow} />
          </SectionCard>
          <SectionCard title="Lead Funnel" subtitle="Pipeline commercial">
            <FunnelChart steps={leadFunnel} />
          </SectionCard>
          <SectionCard title="Project Health" subtitle="Santé des projets">
            <FlowChart steps={projectHealth} />
          </SectionCard>
        </div>

        {/* Row 5: Priority leads, Waiting projects, Clients, Digital Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Priority Leads */}
          <SectionCard title="Leads prioritaires" headerRight={
            <button onClick={() => navigate('/leads')} className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold">
              Voir tout <ArrowRight size={12} />
            </button>
          }>
            <div className="space-y-2">
              {state.leads.filter(l => l.level === 'hot' || l.status === 'lead_proposal').slice(0, 3).map(l => (
                <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg bg-deep/60 border border-exec/8">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate">{l.name.split(' — ')[0]}</p>
                    <p className="text-[10px] text-subtle truncate">{l.need}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
              {state.leads.filter(l => l.level === 'hot' || l.status === 'lead_proposal').length === 0 && (
                <p className="text-xs text-subtle text-center py-2">Aucun lead prioritaire</p>
              )}
            </div>
          </SectionCard>

          {/* Waiting Projects */}
          <SectionCard title="Projets actifs" headerRight={
            <button onClick={() => navigate('/projects')} className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold">
              Voir tout <ArrowRight size={12} />
            </button>
          }>
            <div className="space-y-2">
              {state.projects.filter(p => p.status === 'project_waiting' || p.status === 'project_active').slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-deep/60 border border-exec/8">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate">{p.client}</p>
                    <p className="text-[10px] text-subtle truncate">{p.phase}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Client References */}
          <SectionCard title="Clients & références">
            <div className="grid grid-cols-3 gap-2">
              {CLIENT_LOGOS.map(c => (
                <div key={c.name} className="flex items-center justify-center p-2.5 rounded-lg bg-deep/60 border border-exec/8 h-12 hover:border-copper/20 transition">
                  <img src={c.url} alt={c.name} className="max-h-6 max-w-full object-contain opacity-60 hover:opacity-100 transition" />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Digital Presence - Improved */}
          <SectionCard title="Présence digitale" headerRight={
            <button onClick={() => navigate('/media-center')} className="text-xs text-copper hover:text-copper-light transition flex items-center gap-1 font-semibold">
              Media Center <ArrowRight size={12} />
            </button>
          }>
            <div className="grid grid-cols-2 gap-1.5">
              {DIGITAL_PRESENCE.map(link => (
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

        {/* Founder presence block */}
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

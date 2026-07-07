import { DIGITAL_PRESENCE } from '@/lib/constants';

export type DashboardViewModelInput = {
  summary: any;
  contentIdeas: any[];
  scripts: any[];
  leads: any[];
  projects: any[];
  proofs: any[];
  mediaLinks: any[];
};

const AGENT_DEFINITIONS = [
  { id: 'agent_1', name: 'Chief of Staff' },
  { id: 'agent_2', name: 'Market Intel' },
  { id: 'agent_3', name: 'Content Strategist' },
  { id: 'agent_4', name: 'Scriptwriter' },
  { id: 'agent_5', name: 'Prompt Engineer' },
  { id: 'agent_6', name: 'Sales & Lead Ops' },
  { id: 'agent_7', name: 'Proof & Delivery' },
];

export function buildDashboardViewModel({
  summary,
  contentIdeas,
  scripts,
  leads,
  projects,
  proofs,
  mediaLinks,
}: DashboardViewModelInput) {
  const safeIdeas = Array.isArray(contentIdeas) ? contentIdeas : [];
  const safeScripts = Array.isArray(scripts) ? scripts : [];
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeProofs = Array.isArray(proofs) ? proofs : [];
  const safeMedia = Array.isArray(mediaLinks) ? mediaLinks : [];
  const safeRuns = Array.isArray(summary?.latestRuns) ? summary.latestRuns : [];

  const weeklyPlan = summary?.weekly || null;

  const metrics = {
    ideasReady: summary?.metrics?.ideasReady ?? safeIdeas.filter((i: any) => i.status === 'idea_ready').length,
    scriptsReview: summary?.metrics?.scriptsReview ?? safeScripts.filter((s: any) => s.status === 'ready_review').length,
    hotLeads: summary?.metrics?.hotLeads ?? safeLeads.filter((l: any) => l.niveau === 'chaud' || l.status === 'lead_proposal').length,
    activeProjects: summary?.metrics?.activeProjects ?? safeProjects.filter((p: any) => p.status === 'project_active').length,
    proofsValidated: summary?.metrics?.proofsValidated ?? safeProofs.filter((p: any) => Number(p.is_validated) === 1).length,
    agentRuns: summary?.metrics?.agentRuns ?? safeRuns.length,
    unreadNotifications: summary?.metrics?.unreadNotifications ?? 0,
  };

  const contentFlow = [
    { label: 'À idéer', value: safeIdeas.filter((i: any) => i.status === 'idea_pending').length },
    { label: 'Prêtes', value: safeIdeas.filter((i: any) => i.status === 'idea_ready').length },
    { label: 'Brouillon', value: safeScripts.filter((s: any) => s.status === 'draft').length },
    { label: 'À valider', value: safeScripts.filter((s: any) => s.status === 'ready_review').length },
    { label: 'Validé', value: safeScripts.filter((s: any) => s.status === 'approved').length },
    { label: 'Publié', value: safeScripts.filter((s: any) => s.status === 'published').length },
  ];

  const leadFunnel = [
    { label: 'Nouveaux', value: safeLeads.filter((l: any) => l.status === 'lead_new').length },
    { label: 'Qualifiés', value: safeLeads.filter((l: any) => l.status === 'lead_qualified').length },
    { label: 'Relance', value: safeLeads.filter((l: any) => l.status === 'lead_followup').length },
    { label: 'RDV', value: safeLeads.filter((l: any) => l.status === 'lead_meeting').length },
    { label: 'Proposition', value: safeLeads.filter((l: any) => l.status === 'lead_proposal').length },
    { label: 'Gagné', value: safeLeads.filter((l: any) => l.status === 'lead_won').length },
  ];

  const projectHealth = [
    { label: 'Planifié', value: safeProjects.filter((p: any) => p.status === 'project_planned').length },
    { label: 'En cours', value: safeProjects.filter((p: any) => p.status === 'project_active').length },
    { label: 'Attente', value: safeProjects.filter((p: any) => p.status === 'project_waiting').length },
    { label: 'Livré', value: safeProjects.filter((p: any) => p.status === 'project_delivered').length },
  ];

  const agents = AGENT_DEFINITIONS.map((agent) => {
    const lastRun = safeRuns.find((run: any) => run.agent_name === agent.name);
    let status = 'inactive';
    if (lastRun?.run_status === 'running' || lastRun?.run_status === 'done') status = 'active';
    if (lastRun?.run_status === 'failed') status = 'error';
    return {
      ...agent,
      status,
      summary: lastRun?.output_summary || lastRun?.input_summary || 'Aucun run récent',
    };
  });

  const brandPulse = [
    { label: 'Contenu', value: Math.min((safeIdeas.length + safeScripts.length) * 10, 90) },
    { label: 'Sales', value: Math.min(safeLeads.length * 15, 85) },
    { label: 'Delivery', value: Math.min(safeProjects.length * 20, 80) },
    { label: 'Preuves', value: Math.min(safeProofs.length * 20, 75) },
    { label: 'Agents', value: Math.min(agents.filter((a) => a.status === 'active').length * 20, 85) },
    { label: 'Pipeline', value: Math.min(metrics.hotLeads * 30, 70) },
  ];

  const priorityLeads = safeLeads
    .filter((l: any) => l.niveau === 'chaud' || l.status === 'lead_qualified' || l.status === 'lead_proposal')
    .slice(0, 3);

  const activeOrWaitingProjects = safeProjects
    .filter((p: any) => p.status === 'project_waiting' || p.status === 'project_active')
    .slice(0, 3);

  const digitalPresence = safeMedia.length
    ? safeMedia.map((item: any) => ({ name: item.label, url: item.url }))
    : DIGITAL_PRESENCE;

  return {
    weeklyPlan,
    metrics,
    latestRuns: safeRuns,
    contentFlow,
    leadFunnel,
    projectHealth,
    agents,
    brandPulse,
    priorityLeads,
    activeOrWaitingProjects,
    digitalPresence,
  };
}

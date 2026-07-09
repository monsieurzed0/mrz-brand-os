const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export type DashboardSummary = {
  weekly: {
    id: string;
    week_label: string;
    focus_primary?: string;
    focus_secondary?: string;
    focus_tertiary?: string;
    main_risk?: string;
    decision_note?: string;
    status?: string;
  } | null;
  metrics: {
    ideasReady: number;
    scriptsReview: number;
    hotLeads: number;
    activeProjects: number;
    proofsValidated: number;
    agentRuns: number;
    unreadNotifications: number;
  };
  latestRuns: Array<Record<string, unknown>>;
  latestProofs: Array<Record<string, unknown>>;
};

export type MediaLink = {
  id: string;
  category: 'social' | 'contact' | 'site' | 'portfolio' | string;
  label: string;
  url: string;
  handle_or_domain?: string;
  description?: string;
  sort_order?: number;
};

export type BrandMemorySection = {
  id: string;
  section_key: string;
  title: string;
  content_md: string;
  updated_at: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  entity_type?: string;
  entity_id?: string;
  status: 'unread' | 'read' | string;
  created_at: string;
  read_at?: string | null;
};

export type SearchResult = {
  id: string;
  title: string;
  type: string;
  status?: string;
  module: string;
};

export type ContentIdea = {
  id: string;
  sujet: string;
  angle?: string;
  cible?: string;
  produit?: string;
  plateforme?: string;
  duree?: number;
  cta?: string;
  caption?: string;
  source?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ScriptItem = {
  id: string;
  content_idea_id?: string | null;
  sujet: string;
  hook?: string;
  script?: string;
  cta_genere?: string;
  caption?: string;
  angle?: string;
  cible?: string;
  produit?: string;
  plateforme?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type LeadItem = {
  id: string;
  name: string;
  source?: string;
  besoin?: string;
  niveau?: string;
  note?: string;
  next_action?: string;
  relance_brouillon?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProjectItem = {
  id: string;
  client_name: string;
  offre?: string;
  phase?: string;
  blocage?: string;
  livrables?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProofItem = {
  id: string;
  project_id?: string;
  type_preuve?: string;
  contenu?: string;
  asset_url?: string;
  usage_possible?: string;
  is_validated?: number;
  created_at?: string;
  updated_at?: string;
};

export type ContentEngineOutput = {
  id: string;
  content_idea_id?: string;
  output_type: string;
  output_label: string;
  platforme?: string;
  contenu: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type VisualPromptItem = {
  id: string;
  related_script_id?: string | null;
  sujet?: string;
  angle?: string;
  produit?: string;
  hook_visuel?: string;
  prompt_principal?: string;
  variante_a?: string;
  variante_b?: string;
  variante_c?: string;
  negative_prompt?: string;
  photoshop_note?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type MarketIntelItem = {
  id: string;
  category: string;
  title: string;
  insight?: string;
  source?: string;
  impact_score?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type AgentRunRecord = {
  id: string;
  agent_name: string;
  input_summary?: string;
  output_summary?: string;
  run_status?: string;
  error_text?: string;
  provider?: string;
  model?: string;
  latency_ms?: number;
  created_at?: string;
};

export type AgentRunResult = {
  ok: boolean;
  mode?: string;
  runId: string;
  aiError?: string | null;
  fallback?: boolean;
  provider?: string;
};

export type ContentStrategistResult = AgentRunResult & {
  count: number;
  fallbackCount?: number;
  ideas: ContentIdea[];
};

export type ScriptwriterResult = AgentRunResult & {
  script: ScriptItem;
};

export type PromptEngineerResult = AgentRunResult & {
  visualPrompt: VisualPromptItem;
};

export type MarketIntelResult = AgentRunResult & {
  category: string;
  items: MarketIntelItem[];
};

export type SalesLeadOpsResult = AgentRunResult & {
  leadsProcessed: number;
  processed: Array<{ leadId: string; mode: string; result: any; fallback: boolean }>;
};

export type ProofDeliveryResult = AgentRunResult & {
  mode: string;
  projectsProcessed: number;
  processed: Array<{ projectId: string; result: any; aiError: string | null }>;
};

export type ChiefOfStaffResult = AgentRunResult & {
  mode: string;
  result: {
    title?: string;
    summary?: string;
    priority1?: string;
    priority2?: string;
    report?: string;
  };
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Réponse API invalide');
  }
  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String((data as Record<string, unknown>).error)
        : 'Erreur API';
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // Dashboard
  getDashboardSummary: () =>
    apiFetch<DashboardSummary>('/api/dashboard/summary'),

  // Brand memory
  getBrandMemory: () =>
    apiFetch<BrandMemorySection[]>('/api/brand-memory'),

  updateBrandMemory: (sectionKey: string, payload: { title?: string; content_md?: string }) =>
    apiFetch(`/api/brand-memory/${encodeURIComponent(sectionKey)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Media center
  getMediaLinks: () =>
    apiFetch<MediaLink[]>('/api/media-links'),

  // Notifications
  getNotifications: () =>
    apiFetch<NotificationItem[]>('/api/notifications'),

  markNotificationRead: (id: string) =>
    apiFetch('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  markAllNotificationsRead: () =>
    apiFetch('/api/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Search
  search: (q: string) =>
    apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),

  // Agent runs
  getAgentRuns: () =>
    apiFetch<AgentRunRecord[]>('/api/agent-runs'),

  // Market Intel
  getMarketIntel: () =>
    apiFetch<MarketIntelItem[]>('/api/market-intel'),

  // Content ideas
  getContentIdeas: () =>
    apiFetch<ContentIdea[]>('/api/content-ideas'),

  createContentIdea: (payload: Partial<ContentIdea>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/content-ideas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateContentIdea: (id: string, payload: Partial<ContentIdea>) =>
    apiFetch(`/api/content-ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteContentIdea: (id: string) =>
    apiFetch(`/api/content-ideas/${id}`, {
      method: 'DELETE',
    }),

  // Scripts
  getScripts: () =>
    apiFetch<ScriptItem[]>('/api/scripts'),

  createScript: (payload: Partial<ScriptItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/scripts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateScript: (id: string, payload: Partial<ScriptItem>) =>
    apiFetch(`/api/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteScript: (id: string) =>
    apiFetch(`/api/scripts/${id}`, {
      method: 'DELETE',
    }),

  // Leads
  getLeads: () =>
    apiFetch<LeadItem[]>('/api/leads'),

  createLead: (payload: Partial<LeadItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateLead: (id: string, payload: Partial<LeadItem>) =>
    apiFetch(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteLead: (id: string) =>
    apiFetch(`/api/leads/${id}`, {
      method: 'DELETE',
    }),

  // Projects
  getProjects: () =>
    apiFetch<ProjectItem[]>('/api/projects'),

  createProject: (payload: Partial<ProjectItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProject: (id: string, payload: Partial<ProjectItem>) =>
    apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProject: (id: string) =>
    apiFetch(`/api/projects/${id}`, {
      method: 'DELETE',
    }),

  // Proofs
  getProofs: () =>
    apiFetch<ProofItem[]>('/api/proofs'),

  createProof: (payload: Partial<ProofItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/proofs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProof: (id: string, payload: Partial<ProofItem>) =>
    apiFetch(`/api/proofs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProof: (id: string) =>
    apiFetch(`/api/proofs/${id}`, {
      method: 'DELETE',
    }),

  // Content engine outputs
  getContentEngineOutputs: () =>
    apiFetch<ContentEngineOutput[]>('/api/content-engine-outputs'),

  createContentEngineOutput: (payload: Partial<ContentEngineOutput>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/content-engine-outputs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateContentEngineOutput: (id: string, payload: Partial<ContentEngineOutput>) =>
    apiFetch(`/api/content-engine-outputs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteContentEngineOutput: (id: string) =>
    apiFetch(`/api/content-engine-outputs/${id}`, {
      method: 'DELETE',
    }),

  // Visual prompts
  getVisualPrompts: () =>
    apiFetch<VisualPromptItem[]>('/api/visual-prompts'),

  createVisualPrompt: (payload: Partial<VisualPromptItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/visual-prompts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateVisualPrompt: (id: string, payload: Partial<VisualPromptItem>) =>
    apiFetch(`/api/visual-prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteVisualPrompt: (id: string) =>
    apiFetch(`/api/visual-prompts/${id}`, {
      method: 'DELETE',
    }),

  // ───────────────────────────────────────────────
  // AGENT ENDPOINTS
  // ───────────────────────────────────────────────

  // Chief of Staff
  runChiefOfStaff: (payload?: { mode?: 'report' | 'orchestrate' }) =>
    apiFetch<ChiefOfStaffResult>('/api/agents/chief-of-staff/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Market Intel
  runMarketIntel: (payload?: { category?: 'general' | 'competitors' | 'trends' | 'opportunities' }) =>
    apiFetch<MarketIntelResult>('/api/agents/market-intel/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Content Strategist
  runContentStrategist: (payload?: {
    product?: string;
    plateforme?: string;
    count?: number;
  }) =>
    apiFetch<ContentStrategistResult>('/api/agents/content-strategist/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Scriptwriter
  runScriptwriter: (payload?: { content_idea_id?: string; platform_override?: string }) =>
    apiFetch<ScriptwriterResult>('/api/agents/scriptwriter/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Prompt Engineer
  runPromptEngineer: (payload: { script_id: string }) =>
    apiFetch<PromptEngineerResult>('/api/agents/prompt-engineer/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Sales & Lead Ops
  runSalesLeadOps: (payload?: {
    mode?: 'qualify' | 'score' | 'relance';
    lead_id?: string;
  }) =>
    apiFetch<SalesLeadOpsResult>('/api/agents/sales-lead-ops/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Proof & Delivery
  runProofDelivery: (payload?: {
    mode?: 'collect' | 'document' | 'validate';
    project_id?: string;
  }) =>
    apiFetch<ProofDeliveryResult>('/api/agents/proof-delivery/run', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
};

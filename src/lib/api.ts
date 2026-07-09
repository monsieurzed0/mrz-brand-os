Je vais t'envoyer differents codes de mes Assets pour que tu me produise des résultat adaptés: On commence par Api.tsx s'il faut ameliorer: const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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

  latestRuns: Array&lt;Record&lt;string, unknown&gt;&gt;;

  latestProofs: Array&lt;Record&lt;string, unknown&gt;&gt;;

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

async function apiFetch&lt;T&gt;(path: string, options?: RequestInit): Promise&lt;T&gt; {

  const response = await fetch`${API_BASE_URL}${path}`, {

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

      typeof data === 'object' &amp;&amp; data &amp;&amp; 'error' in data

        ? String((data as Record&lt;string, unknown&gt;).error)

        : 'Erreur API';

    throw new Error(message);

  }

  return data as T;

}

export const api = {

  // Dashboard

  getDashboardSummary: () =&gt;

    apiFetch&lt;DashboardSummary&gt;('/api/dashboard/summary'),

  // Brand memory

  getBrandMemory: () =&gt;

    apiFetch&lt;BrandMemorySection[]&gt;('/api/brand-memory'),

  updateBrandMemory: (

    sectionKey: string,

    payload: { title?: string; content_md?: string }

  ) =&gt;

    apiFetch`/api/brand-memory/${encodeURIComponent(sectionKey)}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  // Media center

  getMediaLinks: () =&gt;

    apiFetch&lt;MediaLink[]&gt;('/api/media-links'),

  // Notifications

  getNotifications: () =&gt;

    apiFetch&lt;NotificationItem[]&gt;('/api/notifications'),

  markNotificationRead: (id: string) =&gt;

    apiFetch('/api/notifications/mark-read', {

      method: 'POST',

      body: JSON.stringify({ id }),

    }),

  markAllNotificationsRead: () =&gt;

    apiFetch('/api/notifications/mark-all-read', {

      method: 'POST',

      body: JSON.stringify({}),

    }),

  // Search

  search: (q: string) =&gt;

    apiFetch&lt;SearchResult[]&gt;`/api/search?q=${encodeURIComponent(q)}`),

  // Agent runs

  getAgentRuns: () =&gt;

    apiFetch&lt;any[]&gt;('/api/agent-runs'),

  // Content ideas

  getContentIdeas: () =&gt;

    apiFetch&lt;ContentIdea[]&gt;('/api/content-ideas'),

  createContentIdea: (payload: Partial&lt;ContentIdea&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/content-ideas', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateContentIdea: (id: string, payload: Partial&lt;ContentIdea&gt;) =&gt;

    apiFetch`/api/content-ideas/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteContentIdea: (id: string) =&gt;

    apiFetch`/api/content-ideas/${id}`, {

      method: 'DELETE',

    }),

  runContentStrategist: (payload?: {

    product?: string;

    plateforme?: string;

    count?: number;

  }) =&gt;

    apiFetch('/api/agents/content-strategist/run', {

      method: 'POST',

      body: JSON.stringify(payload || {}),

    }),

  // Scripts

  getScripts: () =&gt;

    apiFetch&lt;ScriptItem[]&gt;('/api/scripts'),

  createScript: (payload: Partial&lt;ScriptItem&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/scripts', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateScript: (id: string, payload: Partial&lt;ScriptItem&gt;) =&gt;

    apiFetch`/api/scripts/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteScript: (id: string) =&gt;

    apiFetch`/api/scripts/${id}`, {

      method: 'DELETE',

    }),

  runScriptwriter: (payload?: { content_idea_id?: string }) =&gt;

  apiFetch('/api/agents/scriptwriter/run', {

    method: 'POST',

    body: JSON.stringify(payload || {}),

  }),

  // Leads

  getLeads: () =&gt;

    apiFetch&lt;LeadItem[]&gt;('/api/leads'),

  createLead: (payload: Partial&lt;LeadItem&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/leads', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateLead: (id: string, payload: Partial&lt;LeadItem&gt;) =&gt;

    apiFetch`/api/leads/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteLead: (id: string) =&gt;

    apiFetch`/api/leads/${id}`, {

      method: 'DELETE',

    }),

  // Projects

  getProjects: () =&gt;

    apiFetch&lt;ProjectItem[]&gt;('/api/projects'),

  createProject: (payload: Partial&lt;ProjectItem&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/projects', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateProject: (id: string, payload: Partial&lt;ProjectItem&gt;) =&gt;

    apiFetch`/api/projects/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteProject: (id: string) =&gt;

    apiFetch`/api/projects/${id}`, {

      method: 'DELETE',

    }),

  // Proofs

  getProofs: () =&gt;

    apiFetch&lt;ProofItem[]&gt;('/api/proofs'),

  createProof: (payload: Partial&lt;ProofItem&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/proofs', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateProof: (id: string, payload: Partial&lt;ProofItem&gt;) =&gt;

    apiFetch`/api/proofs/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteProof: (id: string) =&gt;

    apiFetch`/api/proofs/${id}`, {

      method: 'DELETE',

    }),

  // Content Engine

  getContentEngineOutputs: () =&gt;

    apiFetch&lt;ContentEngineOutput[]&gt;('/api/content-engine-outputs'),

  createContentEngineOutput: (payload: Partial&lt;ContentEngineOutput&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/content-engine-outputs', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateContentEngineOutput: (id: string, payload: Partial&lt;ContentEngineOutput&gt;) =&gt;

    apiFetch`/api/content-engine-outputs/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteContentEngineOutput: (id: string) =&gt;

    apiFetch`/api/content-engine-outputs/${id}`, {

      method: 'DELETE',

    }),

  // Visual prompts

  getVisualPrompts: () =&gt;

    apiFetch&lt;VisualPromptItem[]&gt;('/api/visual-prompts'),

  createVisualPrompt: (payload: Partial&lt;VisualPromptItem&gt;) =&gt;

    apiFetch&lt;{ ok: boolean; id: string }&gt;('/api/visual-prompts', {

      method: 'POST',

      body: JSON.stringify(payload),

    }),

  updateVisualPrompt: (id: string, payload: Partial&lt;VisualPromptItem&gt;) =&gt;

    apiFetch`/api/visual-prompts/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload),

    }),

  deleteVisualPrompt: (id: string) =&gt;

    apiFetch`/api/visual-prompts/${id}`, {

      method: 'DELETE',

    }),

};

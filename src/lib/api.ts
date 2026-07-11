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
  relance_email?: string;
  relance_whatsapp?: string;
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
  prompt_chatgpt?: string;
  prompt_nano_banana?: string;
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

// ───────────────────────────────────────────────
// FINANCE & ADMINISTRATION
// ───────────────────────────────────────────────

export type CompanySettings = {
  id?: string;
  business_name?: string;
  legal_form?: string;
  niu?: string;
  rccm?: string;
  tax_regime?: string;
  tva_rate?: number;
  tva_enabled?: number;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  bank_account?: string;
  bank_iban?: string;
  currency_default?: string;
  quote_validity_days?: number;
  invoice_due_days?: number;
  quote_prefix?: string;
  invoice_prefix?: string;
  next_invoice_number?: number;
  next_quote_number?: number;
};

export type ServiceCatalogItem = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  currency?: string;
  tva_rate?: number;
  duration_estimate?: string;
  product_brand?: string;
  is_active?: number;
  sort_order?: number;
};

export type ClientItem = {
  id: string;
  lead_id?: string;
  name: string;
  email?: string;
  phone?: string;
  niu?: string;
  address?: string;
  city?: string;
  country?: string;
  billing_contact?: string;
  preferred_currency?: string;
  notes?: string;
  status?: string;
  total_revenue?: number;
  total_paid?: number;
  total_due?: number;
};

export type QuoteLineItem = {
  id: string;
  quote_id: string;
  service_id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  tva_rate?: number;
  discount_percent?: number;
  line_total?: number;
  sort_order?: number;
};

export type QuoteItem = {
  id: string;
  client_id: string;
  project_id?: string;
  lead_id?: string;
  quote_number: string;
  status?: string;
  issue_date?: string;
  expiry_date?: string;
  currency?: string;
  acompte_percent?: number;
  acompte_invoice_id?: string;
  solde_invoice_id?: string;
  subtotal?: number;
  tva_rate?: number;
  tva_amount?: number;
  total?: number;
  terms?: string;
  notes?: string;
  internal_notes?: string;
  accepted_at?: string;
  converted_invoice_id?: string;
};

export type InvoiceLineItem = {
  id: string;
  invoice_id: string;
  service_id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  tva_rate?: number;
  discount_percent?: number;
  line_total?: number;
  sort_order?: number;
};

export type InvoiceItem = {
  id: string;
  client_id: string;
  quote_id?: string;
  project_id?: string;
  invoice_number: string;
  invoice_type?: string;
  parent_invoice_id?: string;
  status?: string;
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  currency?: string;
  subtotal?: number;
  tva_rate?: number;
  tva_amount?: number;
  total?: number;
  amount_paid?: number;
  amount_due?: number;
  terms?: string;
  notes?: string;
  internal_notes?: string;
};

export type PaymentItem = {
  id: string;
  invoice_id?: string;
  client_id: string;
  amount: number;
  currency?: string;
  exchange_rate?: number;
  amount_xaf?: number;
  payment_method?: string;
  payment_method_detail?: string;
  payment_date?: string;
  reference?: string;
  status?: string;
  notes?: string;
};

export type ExpenseItem = {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  exchange_rate?: number;
  amount_xaf?: number;
  expense_date?: string;
  payment_method?: string;
  vendor?: string;
  receipt_url?: string;
  is_recurring?: number;
  recurrence_period?: string;
  status?: string;
};

export type ExchangeRate = {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_date?: string;
  source?: string;
};

export type FinancialCategory = {
  id: string;
  code: string;
  label: string;
  type: string;
  is_active?: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  reference_type?: string;
  reference_id?: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  description?: string;
};

export type FinanceSummary = {
  revenue: { total: number; month: number; year: number };
  outstanding: number;
  overdue: number;
  expenses: { total: number; month: number };
  netMargin: number;
  counts: { clients: number; activeProjects: number; quotes: number; invoices: number };
};

export type AgingBucket = { label: string; min: number; max: number; amount: number; count: number };

export type BalanceSheet = {
  actif: { clients: number; treasury: any[]; immobilisations: number; total: number };
  passif: { capital: number; resultat: number; fournisseurs: number; total: number };
  equilibrium: boolean;
};

export type IncomeStatement = {
  produits: { prestations: number; total: number };
  charges: any[];
  totalCharges: number;
  resultatNet: number;
};

export type TrialBalanceRow = {
  code: string;
  label: string;
  type: string;
  debit: number;
  credit: number;
  solde: number;
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

  // Weekly
  getWeekly: () => apiFetch<any[]>('/api/weekly'),
  createWeekly: (payload: any) =>
    apiFetch<{ ok: boolean; id: string }>('/api/weekly', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateWeekly: (id: string, payload: any) =>
    apiFetch(`/api/weekly/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

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

  // ───────────────────────────────────────────────
  // FINANCE & ADMINISTRATION
  // ───────────────────────────────────────────────

  // Company settings
  getCompanySettings: () => apiFetch<CompanySettings>('/api/company-settings'),
  updateCompanySettings: (payload: Partial<CompanySettings>) =>
    apiFetch('/api/company-settings', { method: 'PUT', body: JSON.stringify(payload) }),

  // Services catalog
  getServicesCatalog: () => apiFetch<ServiceCatalogItem[]>('/api/services-catalog'),
  createServiceCatalog: (payload: Partial<ServiceCatalogItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/services-catalog', { method: 'POST', body: JSON.stringify(payload) }),
  updateServiceCatalog: (id: string, payload: Partial<ServiceCatalogItem>) =>
    apiFetch(`/api/services-catalog/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteServiceCatalog: (id: string) =>
    apiFetch(`/api/services-catalog/${id}`, { method: 'DELETE' }),

  // Clients
  getClients: () => apiFetch<ClientItem[]>('/api/clients'),
  createClient: (payload: Partial<ClientItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/clients', { method: 'POST', body: JSON.stringify(payload) }),
  updateClient: (id: string, payload: Partial<ClientItem>) =>
    apiFetch(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteClient: (id: string) =>
    apiFetch(`/api/clients/${id}`, { method: 'DELETE' }),
  convertLeadToClient: (leadId: string) =>
    apiFetch<{ ok: boolean; clientId: string; message?: string }>('/api/clients/convert-lead', {
      method: 'POST',
      body: JSON.stringify({ lead_id: leadId }),
    }),

  // Quotes
  getQuotes: () => apiFetch<QuoteItem[]>('/api/quotes'),
  createQuote: (payload: Partial<QuoteItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/quotes', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuote: (id: string, payload: Partial<QuoteItem>) =>
    apiFetch(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteQuote: (id: string) =>
    apiFetch(`/api/quotes/${id}`, { method: 'DELETE' }),
  convertQuoteToInvoice: (id: string) =>
    apiFetch('/api/quotes/' + id + '/convert', { method: 'POST', body: JSON.stringify({}) }),

  // Quote items
  getQuoteItems: (quoteId?: string) =>
    apiFetch<QuoteLineItem[]>(quoteId ? `/api/quote-items?quote_id=${quoteId}` : '/api/quote-items'),
  createQuoteItem: (payload: Partial<QuoteLineItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/quote-items', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuoteItem: (id: string, payload: Partial<QuoteLineItem>) =>
    apiFetch(`/api/quote-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteQuoteItem: (id: string) =>
    apiFetch(`/api/quote-items/${id}`, { method: 'DELETE' }),

  // Invoices
  getInvoices: () => apiFetch<InvoiceItem[]>('/api/invoices'),
  createInvoice: (payload: Partial<InvoiceItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  updateInvoice: (id: string, payload: Partial<InvoiceItem>) =>
    apiFetch(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteInvoice: (id: string) =>
    apiFetch(`/api/invoices/${id}`, { method: 'DELETE' }),
  recordPayment: (invoiceId: string, payload: { amount: number; currency?: string; payment_method?: string; payment_method_detail?: string; payment_date?: string; reference?: string; notes?: string }) =>
    apiFetch('/api/invoices/' + invoiceId + '/payment', { method: 'POST', body: JSON.stringify({ ...payload, invoice_id: invoiceId }) }),

  // Invoice items
  getInvoiceItems: (invoiceId?: string) =>
    apiFetch<InvoiceLineItem[]>(invoiceId ? `/api/invoice-items?invoice_id=${invoiceId}` : '/api/invoice-items'),
  createInvoiceItem: (payload: Partial<InvoiceLineItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/invoice-items', { method: 'POST', body: JSON.stringify(payload) }),
  updateInvoiceItem: (id: string, payload: Partial<InvoiceLineItem>) =>
    apiFetch(`/api/invoice-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteInvoiceItem: (id: string) =>
    apiFetch(`/api/invoice-items/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: () => apiFetch<PaymentItem[]>('/api/payments'),
  createPayment: (payload: Partial<PaymentItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/payments', { method: 'POST', body: JSON.stringify(payload) }),

  // Expenses
  getExpenses: () => apiFetch<ExpenseItem[]>('/api/expenses'),
  createExpense: (payload: Partial<ExpenseItem>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (id: string, payload: Partial<ExpenseItem>) =>
    apiFetch(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id: string) =>
    apiFetch(`/api/expenses/${id}`, { method: 'DELETE' }),

  // Exchange rates
  getExchangeRates: () => apiFetch<ExchangeRate[]>('/api/exchange-rates'),
  createExchangeRate: (payload: Partial<ExchangeRate>) =>
    apiFetch<{ ok: boolean; id: string }>('/api/exchange-rates', { method: 'POST', body: JSON.stringify(payload) }),
  updateExchangeRate: (id: string, payload: Partial<ExchangeRate>) =>
    apiFetch(`/api/exchange-rates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExchangeRate: (id: string) =>
    apiFetch(`/api/exchange-rates/${id}`, { method: 'DELETE' }),

  // Financial categories
  getFinancialCategories: () => apiFetch<FinancialCategory[]>('/api/financial-categories'),

  // Journal
  getJournalEntries: () => apiFetch<JournalEntry[]>('/api/journal-entries'),

  // Financial reports
  getFinanceSummary: () => apiFetch<FinanceSummary>('/api/finance/summary'),
  getAgingReport: () => apiFetch<AgingBucket[]>('/api/finance/aging'),
  getBalanceSheet: () => apiFetch<BalanceSheet>('/api/finance/balance-sheet'),
  getIncomeStatement: () => apiFetch<IncomeStatement>('/api/finance/income-statement'),
  getGeneralLedger: () => apiFetch<JournalEntry[]>('/api/finance/general-ledger'),
  getTrialBalance: () => apiFetch<TrialBalanceRow[]>('/api/finance/trial-balance'),
};

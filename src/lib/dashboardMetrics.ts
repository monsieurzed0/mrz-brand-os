/**
 * Calculs du dashboard.
 *
 * Règle unique de ce fichier : rien n'est inventé. Chaque valeur retournée est
 * dérivée d'une réponse `api.*`. Quand la donnée manque, la fonction retourne
 * `null` et l'appelant n'affiche pas l'élément.
 */

import type {
  ContentIdea,
  ScriptItem,
  LeadItem,
  ProjectItem,
  ProofItem,
  InvoiceItem,
  ClientItem,
  VisualPromptItem,
  MarketIntelItem,
  BalanceSheet,
} from '@/lib/api';

// ───────────────────────────────────────────────
// Formatage
// ───────────────────────────────────────────────

/** Montant XAF : entier, séparateur d'espace, jamais de décimale. */
export function formatXAF(amount: number): string {
  return `${formatInteger(amount)} XAF`;
}

export function formatInteger(value: number): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
    .format(rounded)
    .replace(/[\u202f\u00a0]/g, ' ');
}

/** Date courte pour le tableau des factures. */
export function formatShortDate(value?: string): string {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
}

/** « il y a 12 min ». Retourne null si la date est absente ou illisible. */
export function formatRelativeTime(value: string | undefined, now: Date = new Date()): string | null {
  const date = toDate(value);
  if (!date) return null;

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 0) return null;
  if (seconds < 60) return "à l'instant";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 31) return `il y a ${days} j`;

  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ───────────────────────────────────────────────
// Zone 1 — salutation et ligne de contexte
// ───────────────────────────────────────────────

export function greetingFor(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Bonjour, Mr Z.';
  if (hour < 18) return 'Bon après-midi, Mr Z.';
  return 'Bonsoir, Mr Z.';
}

type ContextMetrics = {
  ideasReady?: number;
  scriptsReview?: number;
  hotLeads?: number;
  activeProjects?: number;
};

/**
 * Ligne factuelle sous la salutation. Uniquement des compteurs réels.
 * Aucune phrase de motivation.
 */
export function contextLine(metrics: ContextMetrics | null | undefined): string {
  const parts: string[] = [];
  const push = (count: number | undefined, singular: string, plural: string) => {
    const value = Number(count || 0);
    if (value > 0) parts.push(`${value} ${value > 1 ? plural : singular}`);
  };

  push(metrics?.scriptsReview, 'script à valider', 'scripts à valider');
  push(metrics?.ideasReady, 'idée prête', 'idées prêtes');
  push(metrics?.hotLeads, 'lead chaud', 'leads chauds');
  push(metrics?.activeProjects, 'projet actif', 'projets actifs');

  if (parts.length === 0) return 'Rien en attente. Le système est à jour.';
  return `${parts.join(', ')}.`;
}

// ───────────────────────────────────────────────
// Zone 2 — série mensuelle de revenu et variation
// ───────────────────────────────────────────────

export type RevenueSeries = {
  /** Une valeur par mois, du plus ancien au mois courant. */
  points: number[];
  /** Variation mois courant vs mois précédent, seulement si comparable. */
  trend: string | null;
};

/**
 * Série de revenu encaissé, reconstruite depuis les factures.
 * Bucket mensuel sur `paid_date` quand elle existe, sinon `issue_date`.
 * Retourne `points: []` si aucune facture n'est datée.
 */
export function buildRevenueSeries(
  invoices: InvoiceItem[] | null | undefined,
  now: Date = new Date(),
  months = 6
): RevenueSeries {
  const list = Array.isArray(invoices) ? invoices : [];
  const buckets = new Map<string, number>();

  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    keys.push(key);
    buckets.set(key, 0);
  }

  let hasDatedInvoice = false;
  let hasEarlierActivity = false;

  for (const invoice of list) {
    const paid = Number(invoice?.amount_paid || 0);
    if (paid <= 0) continue;

    const date = toDate(invoice?.paid_date) || toDate(invoice?.issue_date);
    if (!date) continue;
    hasDatedInvoice = true;

    const key = monthKey(date);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + paid);
    } else if (date < new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)) {
      hasEarlierActivity = true;
    }
  }

  if (!hasDatedInvoice) return { points: [], trend: null };

  const points = keys.map((key) => buckets.get(key) || 0);

  return { points, trend: computeTrend(points, hasEarlierActivity) };
}

function computeTrend(points: number[], hasEarlierActivity: boolean): string | null {
  if (points.length < 2) return null;

  const current = points[points.length - 1];
  const previous = points[points.length - 2];

  // Pas de période de comparaison réelle : on n'affiche aucune variation.
  const previousMonthExists = previous > 0 || hasEarlierActivity || points.slice(0, -1).some((p) => p > 0);
  if (!previousMonthExists || previous <= 0) return null;

  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(delta);
  return `${sign}${formatted} % vs mois précédent`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ───────────────────────────────────────────────
// Zone 5a — santé de l'écosystème
// ───────────────────────────────────────────────

export type HealthIndicator = {
  key: string;
  label: string;
  /** null = donnée insuffisante, l'indicateur ne compte pas dans la moyenne. */
  value: number | null;
  detail: string;
};

export type EcosystemHealth = {
  score: number | null;
  indicators: HealthIndicator[];
};

export function computeEcosystemHealth(input: {
  contentIdeas: ContentIdea[] | null | undefined;
  leads: LeadItem[] | null | undefined;
  proofs: ProofItem[] | null | undefined;
  balanceSheet: BalanceSheet | null | undefined;
}): EcosystemHealth {
  const ideas = safeArray(input.contentIdeas);
  const leads = safeArray(input.leads);
  const proofs = safeArray(input.proofs);

  const indicators: HealthIndicator[] = [
    ratioIndicator(
      'content',
      'Pipeline contenu',
      ideas.length,
      ideas.filter((i) => i.status !== 'idea_pending').length,
      'idées sorties de la file'
    ),
    {
      key: 'finance',
      label: 'Finance',
      value: input.balanceSheet ? (input.balanceSheet.equilibrium ? 100 : 0) : null,
      detail: input.balanceSheet
        ? input.balanceSheet.equilibrium
          ? 'bilan équilibré'
          : 'bilan déséquilibré'
        : 'bilan indisponible',
    },
    ratioIndicator(
      'sales',
      'Commercial',
      leads.length,
      leads.filter((l) => l.status !== 'lead_new').length,
      'leads engagés'
    ),
    ratioIndicator(
      'proofs',
      'Preuves',
      proofs.length,
      proofs.filter((p) => Number(p.is_validated) === 1).length,
      'preuves validées'
    ),
  ];

  const measured = indicators.filter((i) => i.value !== null).map((i) => i.value as number);
  const score = measured.length ? Math.round(measured.reduce((a, b) => a + b, 0) / measured.length) : null;

  return { score, indicators };
}

function ratioIndicator(
  key: string,
  label: string,
  total: number,
  matching: number,
  noun: string
): HealthIndicator {
  if (total === 0) {
    return { key, label, value: null, detail: 'aucune donnée' };
  }
  return {
    key,
    label,
    value: Math.round((matching / total) * 100),
    detail: `${matching}/${total} ${noun}`,
  };
}

/** Pastille : cuivre ≥ 75, exec 40–74, muted en dessous. Aucun rouge. */
export function healthDotClass(value: number | null): string {
  if (value === null) return 'bg-subtle/40';
  if (value >= 75) return 'bg-copper';
  if (value >= 40) return 'bg-exec';
  return 'bg-muted/50';
}

// ───────────────────────────────────────────────
// Zone 6 — chaîne de valeur
// ───────────────────────────────────────────────

export type PipelineStage = {
  key: string;
  label: string;
  /** Nombre d'éléments réellement en attente à ce stade. */
  count: number;
  /** Ce que compte le compteur, affiché au survol. */
  detail: string;
  route: string;
};

export function buildPipelineStages(input: {
  marketIntel: MarketIntelItem[] | null | undefined;
  contentIdeas: ContentIdea[] | null | undefined;
  scripts: ScriptItem[] | null | undefined;
  visualPrompts: VisualPromptItem[] | null | undefined;
  leads: LeadItem[] | null | undefined;
  projects: ProjectItem[] | null | undefined;
  proofs: ProofItem[] | null | undefined;
  invoices: InvoiceItem[] | null | undefined;
}): PipelineStage[] {
  const intel = safeArray(input.marketIntel);
  const ideas = safeArray(input.contentIdeas);
  const scripts = safeArray(input.scripts);
  const prompts = safeArray(input.visualPrompts);
  const leads = safeArray(input.leads);
  const projects = safeArray(input.projects);
  const proofs = safeArray(input.proofs);
  const invoices = safeArray(input.invoices);

  return [
    {
      key: 'intel',
      label: 'Intel',
      count: intel.filter((i) => i.status !== 'archived').length,
      detail: 'signaux de veille actifs',
      route: '/market-intel',
    },
    {
      key: 'contenu',
      label: 'Contenu',
      count: ideas.filter((i) => i.status === 'idea_pending' || i.status === 'idea_ready').length,
      detail: 'idées à traiter',
      route: '/content',
    },
    {
      key: 'script',
      label: 'Script',
      count: scripts.filter((s) => s.status === 'draft' || s.status === 'ready_review').length,
      detail: 'scripts à écrire ou valider',
      route: '/scripts',
    },
    {
      key: 'visuel',
      label: 'Visuel',
      count: prompts.filter((p) => p.status !== 'approved' && p.status !== 'archived').length,
      detail: 'prompts visuels à produire',
      route: '/visual-lab',
    },
    {
      key: 'lead',
      label: 'Lead',
      count: leads.filter((l) => l.status !== 'lead_won' && l.status !== 'lead_lost').length,
      detail: 'leads en cours',
      route: '/leads',
    },
    {
      key: 'projet',
      label: 'Projet',
      count: projects.filter((p) => p.status === 'project_planned' || p.status === 'project_active').length,
      detail: 'projets en cours',
      route: '/projects',
    },
    {
      key: 'preuve',
      label: 'Preuve',
      count: proofs.filter((p) => Number(p.is_validated) !== 1).length,
      detail: 'preuves à valider',
      route: '/proof-bank',
    },
    {
      key: 'finance',
      label: 'Finance',
      count: invoices.filter((i) => Number(i.amount_due || 0) > 0).length,
      detail: 'factures à encaisser',
      route: '/finance/invoices',
    },
  ];
}

// ───────────────────────────────────────────────
// Zone 7 — projets
// ───────────────────────────────────────────────

const PROJECT_PROGRESS: Record<string, number> = {
  project_planned: 15,
  project_active: 60,
  project_delivered: 100,
};

/** Progression dérivée du statut. null si le statut n'est pas canonique. */
export function projectProgress(status?: string): number | null {
  if (!status) return null;
  const value = PROJECT_PROGRESS[status];
  return value === undefined ? null : value;
}

export function dashboardProjects(projects: ProjectItem[] | null | undefined, limit = 5): ProjectItem[] {
  return safeArray(projects)
    .filter((p) => p.status === 'project_active' || p.status === 'project_planned')
    .slice(0, limit);
}

// ───────────────────────────────────────────────
// Zone 8 — factures
// ───────────────────────────────────────────────

export function recentInvoices(invoices: InvoiceItem[] | null | undefined, limit = 5): InvoiceItem[] {
  return safeArray(invoices)
    .slice()
    .sort((a, b) => {
      const da = toDate(a.issue_date)?.getTime() ?? 0;
      const db = toDate(b.issue_date)?.getTime() ?? 0;
      return db - da;
    })
    .slice(0, limit);
}

export function clientNameById(clients: ClientItem[] | null | undefined, clientId?: string): string | null {
  if (!clientId) return null;
  const match = safeArray(clients).find((c) => c.id === clientId);
  return match?.name || null;
}

// ───────────────────────────────────────────────

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

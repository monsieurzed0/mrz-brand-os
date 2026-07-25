import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
  Coins,
  FileText,
  Receipt,
  Target,
  UserPlus,
  Wallet,
} from 'lucide-react';

import Topbar from '@/components/Topbar';
import KPICard from '@/components/KPICard';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import ChartGuard from '@/components/ChartGuard';

import AmbientField from '@/components/dashboard/AmbientField';
import HealthRing from '@/components/dashboard/HealthRing';
import ValueChain from '@/components/dashboard/ValueChain';

import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  buildPipelineStages,
  buildRevenueSeries,
  clientNameById,
  computeEcosystemHealth,
  contextLine,
  dashboardProjects,
  formatRelativeTime,
  formatShortDate,
  formatXAF,
  greetingFor,
  projectProgress,
  recentInvoices,
} from '@/lib/dashboardMetrics';

// Séquence d'entrée — section 6.5. Chaque zone porte son délai.
const DELAY = {
  greeting: 60,
  kpi: 120,
  kpiStagger: 40,
  hero: 280,
  actions: 340,
  aside: 380,
  chain: 460,
  bottom: 520,
};

const QUICK_ACTIONS = [
  { label: 'Nouveau lead', icon: UserPlus, route: '/leads' },
  { label: 'Nouveau devis', icon: FileText, route: '/finance/quotes' },
  { label: 'Nouvelle dépense', icon: Receipt, route: '/finance/expenses' },
  { label: 'Lancer un agent', icon: Bot, route: '/agents' },
  { label: 'Rapports', icon: BarChart3, route: '/finance/reports' },
];

function delayStyle(ms: number): CSSProperties {
  return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: summary, error: summaryError } = useApiQuery(api.getDashboardSummary, []);
  const { data: finance } = useApiQuery(api.getFinanceSummary, []);
  const { data: balanceSheet } = useApiQuery(api.getBalanceSheet, []);
  const { data: invoices } = useApiQuery(api.getInvoices, []);
  const { data: clients } = useApiQuery(api.getClients, []);
  const { data: contentIdeas, loading: ideasLoading } = useApiQuery(api.getContentIdeas, []);
  const { data: scripts, loading: scriptsLoading } = useApiQuery(api.getScripts, []);
  const { data: leads, loading: leadsLoading } = useApiQuery(api.getLeads, []);
  const { data: projects, loading: projectsLoading } = useApiQuery(api.getProjects, []);
  const { data: proofs } = useApiQuery(api.getProofs, []);
  const { data: visualPrompts } = useApiQuery(api.getVisualPrompts, []);
  const { data: marketIntel } = useApiQuery(api.getMarketIntel, []);

  const metrics = summary?.metrics;
  const weekly = summary?.weekly || null;

  const greeting = useMemo(() => greetingFor(), []);
  const subline = contextLine(metrics);

  const revenue = useMemo(() => buildRevenueSeries(invoices), [invoices]);

  const health = useMemo(
    () => computeEcosystemHealth({ contentIdeas, leads, proofs, balanceSheet }),
    [contentIdeas, leads, proofs, balanceSheet]
  );

  const stages = useMemo(
    () =>
      buildPipelineStages({
        marketIntel,
        contentIdeas,
        scripts,
        visualPrompts,
        leads,
        projects,
        proofs,
        invoices,
      }),
    [marketIntel, contentIdeas, scripts, visualPrompts, leads, projects, proofs, invoices]
  );

  const chainReady = !ideasLoading && !scriptsLoading && !leadsLoading && !projectsLoading;

  const runs = Array.isArray(summary?.latestRuns) ? (summary?.latestRuns as any[]).slice(0, 5) : [];
  const shownProjects = dashboardProjects(projects);
  const shownInvoices = recentInvoices(invoices);

  const outstanding = Number(finance?.outstanding || 0);
  const overdue = Number(finance?.overdue || 0);

  return (
    <div className="relative">
      <AmbientField />
      <Topbar title="Dashboard" />

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-5">
        {summaryError ? (
          <p className="text-xs text-copper-light">Le résumé n'a pas pu être chargé : {summaryError}</p>
        ) : null}

        {/* ── ZONE 1 — Salutation ───────────────────────────────── */}
        <header className="mz-enter" style={delayStyle(DELAY.greeting)}>
          <h2 className="text-3xl font-extrabold tracking-tight text-ivory">{greeting}</h2>
          <p className="mt-1.5 text-sm text-muted">{subline}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ perspective: '1200px' }}>
          <div className="lg:col-span-2 space-y-4">
            {/* ── ZONE 2 — Quatre KPI ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KPICard
                label="CA du mois"
                value={Number(finance?.revenue?.month || 0)}
                format={formatXAF}
                animateValue
                icon={<Coins size={18} />}
                accent
                sparkline={revenue.points}
                trend={revenue.trend || undefined}
                enterDelay={DELAY.kpi}
                onClick={() => navigate('/finance')}
              />
              <KPICard
                label="En attente d'encaissement"
                value={outstanding}
                format={formatXAF}
                animateValue
                icon={<Wallet size={18} />}
                trend={overdue > 0 ? `dont ${formatXAF(overdue)} en retard` : undefined}
                enterDelay={DELAY.kpi + DELAY.kpiStagger}
                onClick={() => navigate('/finance/invoices')}
              />
              <KPICard
                label="Leads chauds"
                value={Number(metrics?.hotLeads || 0)}
                animateValue
                icon={<Target size={18} />}
                enterDelay={DELAY.kpi + DELAY.kpiStagger * 2}
                onClick={() => navigate('/leads')}
              />
              <KPICard
                label="Projets actifs"
                value={Number(metrics?.activeProjects || 0)}
                animateValue
                icon={<Briefcase size={18} />}
                enterDelay={DELAY.kpi + DELAY.kpiStagger * 3}
                onClick={() => navigate('/projects')}
              />
            </div>

            {/* ── ZONE 3 — Priorité de la semaine ─────────────── */}
            <section
              className="relative overflow-hidden rounded-2xl border border-copper/20 bg-gradient-to-br from-carbon to-deep p-6 mz-enter"
              style={delayStyle(DELAY.hero)}
            >
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-copper/10 blur-3xl mz-breathe pointer-events-none" />

              {weekly?.focus_primary ? (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-copper animate-pulse-copper" />
                    <p className="text-[10px] uppercase tracking-[0.14em] text-copper font-bold">
                      {weekly.week_label || 'Semaine en cours'}
                    </p>
                  </div>

                  <h3 className="mt-3 text-2xl font-extrabold text-ivory leading-snug">
                    {weekly.focus_primary}
                  </h3>

                  {(weekly.focus_secondary || weekly.focus_tertiary) && (
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                      {weekly.focus_secondary && (
                        <p className="text-xs text-muted">
                          <span className="text-subtle">2 — </span>
                          {weekly.focus_secondary}
                        </p>
                      )}
                      {weekly.focus_tertiary && (
                        <p className="text-xs text-muted">
                          <span className="text-subtle">3 — </span>
                          {weekly.focus_tertiary}
                        </p>
                      )}
                    </div>
                  )}

                  {weekly.main_risk && (
                    <div className="mt-4 flex items-start gap-2.5">
                      <AlertTriangle size={14} className="text-copper mt-0.5 shrink-0" />
                      <p className="text-xs text-muted leading-relaxed">{weekly.main_risk}</p>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/weekly')}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-copper/15 border border-copper/30 text-xs font-bold text-copper-light hover:bg-copper/25 transition-colors duration-200"
                  >
                    Ouvrir le pilotage
                    <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-sm text-ivory font-semibold">Aucune priorité définie cette semaine.</p>
                  <button
                    onClick={() => navigate('/weekly')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-copper/15 border border-copper/30 text-xs font-bold text-copper-light hover:bg-copper/25 transition-colors duration-200"
                  >
                    Définir la priorité
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </section>

            {/* ── ZONE 4 — Actions rapides ────────────────────── */}
            <section
              className="rounded-xl border border-exec/10 bg-carbon p-5 mz-enter"
              style={delayStyle(DELAY.actions)}
            >
              <div className="flex flex-wrap justify-between gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.route)}
                    className="mz-action flex flex-col items-center gap-2 group rounded-xl px-2 py-1"
                  >
                    <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-deep border border-exec/15 transition-transform duration-200 group-hover:scale-[1.08]">
                      <svg
                        viewBox="0 0 56 56"
                        className="absolute inset-0 w-full h-full -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="28"
                          cy="28"
                          r="27"
                          fill="none"
                          strokeWidth="1.5"
                          className="stroke-copper mz-action-ring"
                          style={{ '--draw-length': `${(2 * Math.PI * 27).toFixed(2)}` } as CSSProperties}
                        />
                      </svg>
                      <action.icon
                        size={19}
                        className="text-exec group-hover:text-copper transition-colors duration-200"
                      />
                    </span>
                    <span className="text-[11px] text-muted group-hover:text-ivory transition-colors duration-200">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ── ZONE 5 — Colonne latérale ───────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <SectionCard
              title="Santé de l'écosystème"
              subtitle="Moyenne des indicateurs mesurables"
              className="mz-enter"
            >
              <div style={delayStyle(DELAY.aside)}>
                <ChartGuard title="Santé de l'écosystème">
                  <HealthRing health={health} enterDelay={DELAY.aside} />
                </ChartGuard>
              </div>
            </SectionCard>

            <SectionCard
              title="Activité des agents"
              className="mz-enter"
              headerRight={
                <button
                  onClick={() => navigate('/agents')}
                  className="text-xs text-copper hover:text-copper-light transition-colors duration-200 flex items-center gap-1 font-semibold"
                >
                  Tout voir <ArrowRight size={12} />
                </button>
              }
            >
              {runs.length ? (
                <ul className="space-y-2.5">
                  {runs.map((run, index) => {
                    const status = String(run?.run_status || '');
                    const relative = formatRelativeTime(run?.created_at as string | undefined);
                    return (
                      <li
                        key={String(run?.id || index)}
                        className="flex items-center gap-3 mz-enter"
                        style={delayStyle(DELAY.aside + 80 + index * 40)}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            status === 'running'
                              ? 'bg-copper animate-pulse-copper'
                              : status === 'done'
                                ? 'bg-copper/60'
                                : 'bg-subtle/40'
                          }`}
                        />
                        <span className="text-xs font-semibold text-ivory shrink-0 max-w-[42%] truncate">
                          {String(run?.agent_name || 'Agent')}
                        </span>
                        <span className="text-xs text-muted flex-1 min-w-0 truncate">
                          {String(run?.output_summary || run?.input_summary || '')}
                        </span>
                        {relative && <span className="text-[10px] text-subtle shrink-0">{relative}</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  message="Aucun run d'agent enregistré."
                  action="Ouvrir la console"
                  onAction={() => navigate('/agents')}
                />
              )}
            </SectionCard>
          </div>
        </div>

        {/* ── ZONE 6 — Chaîne de valeur ─────────────────────────── */}
        <SectionCard
          title="Chaîne de valeur"
          subtitle="Ce qui attend à chaque stade du système"
          noPad
        >
          <div className="px-3 pb-3">
            <ChartGuard title="Chaîne de valeur">
              <ValueChain stages={stages} ready={chainReady} enterDelay={DELAY.chain} />
            </ChartGuard>
          </div>
        </SectionCard>

        {/* ── ZONES 7 & 8 ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard
            title="Projets"
            className="mz-enter"
            headerRight={
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-copper hover:text-copper-light transition-colors duration-200 flex items-center gap-1 font-semibold"
              >
                Tout voir <ArrowRight size={12} />
              </button>
            }
          >
            {shownProjects.length ? (
              <ul className="space-y-4">
                {shownProjects.map((project, index) => {
                  const progress = projectProgress(project.status);
                  return (
                    <li key={project.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ivory truncate">{project.client_name}</p>
                          {project.offre && (
                            <p className="text-[10px] text-subtle truncate mt-0.5">{project.offre}</p>
                          )}
                        </div>
                        {progress !== null && (
                          <span className="text-xs font-bold text-copper-light tabular-nums shrink-0">
                            {progress} %
                          </span>
                        )}
                      </div>
                      {progress !== null && (
                        <div className="mt-2 h-1.5 rounded-full bg-exec/15 overflow-hidden">
                          <div
                            className="h-full w-full rounded-full bg-copper mz-bar"
                            style={
                              {
                                '--bar-scale': `${progress / 100}`,
                                '--enter-delay': `${DELAY.bottom + index * 80}ms`,
                              } as CSSProperties
                            }
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                message="Aucun projet planifié ou en cours."
                action="Ouvrir Projets"
                onAction={() => navigate('/projects')}
              />
            )}
          </SectionCard>

          <SectionCard
            title="Dernières factures"
            className="mz-enter"
            noPad
            headerRight={
              <button
                onClick={() => navigate('/finance/invoices')}
                className="text-xs text-copper hover:text-copper-light transition-colors duration-200 flex items-center gap-1 font-semibold"
              >
                Tout voir <ArrowRight size={12} />
              </button>
            }
          >
            {shownInvoices.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-deep">
                    <tr>
                      {['Numéro', 'Client', 'Date', 'Montant', 'Statut'].map((head) => (
                        <th
                          key={head}
                          className="px-5 py-2.5 text-[10px] uppercase tracking-wider text-subtle font-bold"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-exec/5">
                    {shownInvoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        onClick={() => navigate('/finance/invoices')}
                        className="mz-row mz-enter cursor-pointer hover:bg-carbon/40"
                        style={delayStyle(DELAY.bottom + index * 30)}
                      >
                        <td className="px-5 py-3 text-xs font-semibold text-ivory whitespace-nowrap">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted max-w-[160px] truncate">
                          {clientNameById(clients, invoice.client_id) || '—'}
                        </td>
                        <td className="px-5 py-3 text-xs text-subtle whitespace-nowrap">
                          {formatShortDate(invoice.issue_date)}
                        </td>
                        <td className="px-5 py-3 text-xs font-bold text-copper-light whitespace-nowrap">
                          {formatXAF(Number(invoice.total || 0))}
                        </td>
                        <td className="px-5 py-3">
                          {invoice.status ? <StatusBadge status={invoice.status} size="sm" /> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 pb-5">
                <EmptyState
                  message="Aucune facture émise."
                  action="Ouvrir Factures"
                  onAction={() => navigate('/finance/invoices')}
                />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/** Constat court + action. Jamais de « aucune donnée disponible » sec. */
function EmptyState({
  message,
  action,
  onAction,
}: {
  message: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="py-2">
      <p className="text-xs text-muted">{message}</p>
      <button
        onClick={onAction}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-exec/15 bg-deep text-[11px] font-semibold text-muted hover:text-copper-light hover:border-copper/30 transition-colors duration-200"
      >
        {action}
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

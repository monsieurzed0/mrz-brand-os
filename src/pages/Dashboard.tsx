import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-exec/10 bg-carbon p-5">
      <div className="text-xs text-subtle font-semibold uppercase tracking-wider">{label}</div>
      <div className="mt-3 text-3xl font-bold text-ivory">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useApiQuery(api.getDashboardSummary, []);

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6 animate-fade-in">
        {loading ? (
          <div className="text-sm text-subtle">Chargement du dashboard...</div>
        ) : null}

        {error ? (
          <div className="text-sm text-red-400">Erreur dashboard : {error}</div>
        ) : null}

        {!loading && !error && data ? (
          <>
            <SectionCard>
              <div className="space-y-3">
                <div className="text-xs text-subtle font-semibold uppercase tracking-wider">
                  Priorité centrale
                </div>

                <div className="text-2xl font-bold text-ivory">
                  {data.weekly?.focus_primary || 'Aucune priorité définie'}
                </div>

                {data.weekly?.focus_secondary ? (
                  <div className="text-sm text-muted">{data.weekly.focus_secondary}</div>
                ) : null}

                {data.weekly?.focus_tertiary ? (
                  <div className="text-sm text-muted">{data.weekly.focus_tertiary}</div>
                ) : null}

                <div className="text-xs text-subtle">
                  {data.weekly?.week_label || 'Semaine non définie'}
                </div>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard label="Idées prêtes" value={data.metrics.ideasReady} />
              <MetricCard label="Scripts à valider" value={data.metrics.scriptsReview} />
              <MetricCard label="Leads chauds" value={data.metrics.hotLeads} />
              <MetricCard label="Projets actifs" value={data.metrics.activeProjects} />
              <MetricCard label="Preuves validées" value={data.metrics.proofsValidated} />
              <MetricCard label="Runs agents" value={data.metrics.agentRuns} />
              <MetricCard label="Notifications non lues" value={data.metrics.unreadNotifications} />
            </div>

            <SectionCard>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-ivory">Derniers runs agents</h2>
                  <p className="text-xs text-subtle mt-1">Activité récente du système</p>
                </div>

                {(data.latestRuns || []).length === 0 ? (
                  <div className="text-sm text-subtle">Aucun run agent disponible.</div>
                ) : (
                  <div className="space-y-3">
                    {(data.latestRuns || []).map((run: any) => (
                      <div
                        key={run.id}
                        className="rounded-xl border border-exec/10 bg-deep p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-semibold text-ivory">{run.agent_name}</div>
                          <div className="text-xs text-copper">{run.run_status}</div>
                        </div>

                        <div className="mt-2 text-sm text-muted">
                          {run.output_summary || run.input_summary || 'Aucun résumé'}
                        </div>

                        <div className="mt-2 text-xs text-subtle">{run.created_at}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        ) : null}
      </div>
    </div>
  );
}

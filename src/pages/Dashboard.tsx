import { api } from "../lib/api";
import { useApiQuery } from "../hooks/useApiQuery";

export function DashboardPage() {
  const { data, loading, error } = useApiQuery(api.getDashboardSummary, []);

  if (loading) return <div className="p-6 text-sm text-[#A1A1AA]">Chargement du dashboard...</div>;
  if (error) return <div className="p-6 text-sm text-red-400">Erreur dashboard : {error}</div>;
  if (!data) return <div className="p-6 text-sm text-[#71717A]">Aucune donnée dashboard</div>;

  const weekly = data.weekly;
  const metrics = data.metrics;
  const latestRuns = data.latestRuns || [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-[#141416] p-6">
        <div className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">centrale</div>
        <div className="mt-3 text-2xl font-semibold text-[#F0EDE8]">
          {weekly?.focus_primary || 'Aucune priorité définie'}
        </div>
        {weekly?.focus_secondary ? (
          <div className="mt-2 text-sm text-[#A1A1AA]">{weekly.focus_secondary}</div>
        ) : null}
        {weekly?.focus_tertiary ? (
          <div className="mt-1 text-sm text-[#71717A]">{weekly.focus_tertiary}</div>
        ) : null}
        <div className="mt-4 text-xs text-[#71717A]">{weekly?.week_label || 'Semaine non définie'}</div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Idées prêtes" value={metrics.ideasReady} />
        <MetricCard label="Scripts à valider" value={metrics.scriptsReview} />
        <MetricCard label="Leads chauds" value={metrics.hotLeads} />
        <MetricCard label="Projets actifs" value={metrics.activeProjects} />
        <MetricCard label="Preuves validées" value={metrics.proofsValidated} />
        <MetricCard label="Runs agents" value={metrics.agentRuns} />
        <MetricCard label="Notifications non lues" value={metrics.unreadNotifications} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#141416] p-6">
        <h2 className="text-lg font-semibold text-[#F0EDE8]">Derniers runs agents</h2>
        <div className="mt-4 space-y-3">
          {latestRuns.length === 0 ? (
            <div className="text-sm text-[#71717A]">Aucun run agent disponible.</div>
          ) : (
            latestRuns.map((run: any) => (
              <div key={run.id} className="rounded-2xl border border-white/5 bg-[#0D0D10] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[#F0EDE8]">{run.agent_name}</div>
                  <div className="text-xs text-[#EF9F27]">{run.run_status}</div>
                </div>
                <div className="mt-2 text-sm text-[#A1A1AA]">{run.output_summary || run.input_summary || 'Aucun résumé'}</div>
                <div className="mt-2 text-xs text-[#71717A]">{run.created_at}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141416] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-[#A1A1AA]">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-[#F0EDE8]">{value}</div>
    </div>
  );
}

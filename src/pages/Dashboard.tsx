import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import { useApiQuery } from "../hooks/useApiQuery";

export default function Dashboard() {
  const { data, loading, error } = useApiQuery(api.getDashboardSummary, []);

  return (
    <AppShell title="Dashboard">
      {loading ? <div className="text-sm text-[#A1A1AA]">Chargement du dashboard...</div> : null}
      {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}
      {!loading && !error && data ? (
        <div className="space-y-8">
          <section className="rounded-3xl border border-white/10 bg-[#141416] p-6">
            <div className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">Priorité centrale</div>
            <div className="mt-3 text-2xl font-semibold text-[#F0EDE8]">
              {data.weekly?.focus_primary || "Aucune priorité définie"}
            </div>
            {data.weekly?.focus_secondary ? (
              <div className="mt-2 text-sm text-[#A1A1AA]">{data.weekly.focus_secondary}</div>
            ) : null}
            {data.weekly?.focus_tertiary ? (
              <div className="mt-1 text-sm text-[#71717A]">{data.weekly.focus_tertiary}</div>
            ) : null}
            <div className="mt-4 text-xs text-[#71717A]">
              {data.weekly?.week_label || "Semaine non définie"}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Idées prêtes" value={data.metrics.ideasReady} />
            <MetricCard label="Scripts à valider" value={data.metrics.scriptsReview} />
            <MetricCard label="Leads chauds" value={data.metrics.hotLeads} />
            <MetricCard label="Projets actifs" value={data.metrics.activeProjects} />
            <MetricCard label="Preuves validées" value={data.metrics.proofsValidated} />
            <MetricCard label="Runs agents" value={data.metrics.agentRuns} />
            <MetricCard label="Notifications non lues" value={data.metrics.unreadNotifications} />
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#141416] p-6">
            <h2 className="text-lg font-semibold text-[#F0EDE8]">Derniers runs agents</h2>
            <div className="mt-4 space-y-3">
              {(data.latestRuns || []).length === 0 ? (
                <div className="text-sm text-[#71717A]">Aucun run agent disponible.</div>
              ) : (
                (data.latestRuns || []).map((run: any) => (
                  <div key={run.id} className="rounded-2xl border border-white/5 bg-[#0D0D10] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#F0EDE8]">{run.agent_name}</div>
                      <div className="text-xs text-[#EF9F27]">{run.run_status}</div>
                    </div>
                    <div className="mt-2 text-sm text-[#A1A1AA]">
                      {run.output_summary || run.input_summary || "Aucun résumé"}
                    </div>
                    <div className="mt-2 text-xs text-[#71717A]">{run.created_at}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
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

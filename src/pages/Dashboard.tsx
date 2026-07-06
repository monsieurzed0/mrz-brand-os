import Topbar from '@/components/Topbar';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

export default function Dashboard() {
  const { data, loading, error } = useApiQuery(api.getDashboardSummary, []);

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-exec/10 bg-carbon p-6">
          <h2 className="text-lg font-bold text-ivory">Test Dashboard API</h2>

          {loading ? (
            <p className="mt-3 text-sm text-subtle">Chargement...</p>
          ) : error ? (
            <p className="mt-3 text-sm text-red-400">Erreur : {error}</p>
          ) : (
            <pre className="mt-3 text-xs text-muted whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

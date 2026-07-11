import { useMemo } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, AlertTriangle, Wallet, Users, FileText, Receipt } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

function KpiCard({ label, value, icon: Icon, tone = 'neutral' }: any) {
  const toneClass = {
    neutral: 'text-ivory',
    up: 'text-emerald-400',
    down: 'text-red-400',
    warn: 'text-copper-light',
  }[tone];
  return (
    <div className="rounded-xl border border-exec/10 bg-carbon p-4 flex items-start justify-between">
      <div>
        <p className="text-[10px] text-subtle uppercase tracking-wider font-bold">{label}</p>
        <p className={`text-lg font-bold mt-1 ${toneClass}`}>{value}</p>
      </div>
      <div className="p-2 rounded-lg bg-deep border border-exec/10">
        <Icon size={16} className="text-copper" />
      </div>
    </div>
  );
}

function formatXAF(n: number) {
  return (n || 0).toLocaleString('fr-FR') + ' XAF';
}

export default function FinanceDashboard() {
  const { showToast } = useStore();
  const { data: summary, loading: sumLoading } = useApiQuery(api.getFinanceSummary, []);
  const { data: aging } = useApiQuery(api.getAgingReport, []);
  const { data: invoices } = useApiQuery(api.getInvoices, []);
  const { data: quotes } = useApiQuery(api.getQuotes, []);

  const s = summary || {};
  const rev = (s as any).revenue || {};
  const exp = (s as any).expenses || {};
  const counts = (s as any).counts || {};

  const overdueInvoices = useMemo(() => {
    const safe = Array.isArray(invoices) ? invoices : [];
    return safe.filter((i: any) => i.status === 'sent' || i.status === 'partial').slice(0, 5);
  }, [invoices]);

  const recentQuotes = useMemo(() => {
    const safe = Array.isArray(quotes) ? quotes : [];
    return safe.slice(0, 5);
  }, [quotes]);

  return (
    <div>
      <Topbar title="Finance & Administration" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance" />

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="CA total" value={formatXAF(rev.total)} icon={TrendingUp} tone="up" />
          <KpiCard label="CA ce mois" value={formatXAF(rev.month)} icon={Wallet} tone="neutral" />
          <KpiCard label="Impayés" value={formatXAF((s as any).outstanding || 0)} icon={AlertTriangle} tone="warn" />
          <KpiCard label="Marge nette" value={formatXAF((s as any).netMargin || 0)} icon={TrendingDown} tone={(s as any).netMargin >= 0 ? 'up' : 'down'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Échéancier */}
          <SectionCard title="Échéancier impayés" className="lg:col-span-2">
            {sumLoading ? <div className="text-xs text-subtle">Chargement…</div> : (
              <div className="space-y-2">
                {(aging || []).map((bucket: any) => (
                  <div key={bucket.label} className="flex items-center justify-between p-2 rounded-lg bg-deep border border-exec/5">
                    <span className="text-xs text-muted">{bucket.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-subtle">{bucket.count} fact.</span>
                      <span className="text-xs font-bold text-ivory">{formatXAF(bucket.amount)}</span>
                    </div>
                  </div>
                ))}
                {(aging || []).length === 0 && <p className="text-xs text-subtle">Aucun impayé.</p>}
              </div>
            )}
          </SectionCard>

          {/* Compteurs */}
          <SectionCard title="Volumes">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Users size={13} className="text-copper" /><span className="text-xs text-muted">Clients</span></div>
                <span className="text-sm font-bold text-ivory">{counts.clients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><FileText size={13} className="text-copper" /><span className="text-xs text-muted">Devis</span></div>
                <span className="text-sm font-bold text-ivory">{counts.quotes || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Receipt size={13} className="text-copper" /><span className="text-xs text-muted">Factures</span></div>
                <span className="text-sm font-bold text-ivory">{counts.invoices || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><TrendingUp size={13} className="text-copper" /><span className="text-xs text-muted">Projets actifs</span></div>
                <span className="text-sm font-bold text-ivory">{counts.activeProjects || 0}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Dernières factures en attente */}
        <SectionCard title="Factures en attente" subtitle="5 plus récentes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">N°</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Client</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Montant</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Reste dû</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Échéance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-exec/5">
                {overdueInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-carbon/40 transition">
                    <td className="px-3 py-2 text-xs font-mono text-ivory">{inv.invoice_number}</td>
                    <td className="px-3 py-2 text-xs text-muted">{inv.client_id}</td>
                    <td className="px-3 py-2 text-xs text-ivory">{formatXAF(inv.total)}</td>
                    <td className="px-3 py-2 text-xs text-copper-light font-bold">{formatXAF(inv.amount_due)}</td>
                    <td className="px-3 py-2 text-xs text-subtle">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                ))}
                {overdueInvoices.length === 0 && <tr><td colSpan={5} className="px-3 py-3 text-xs text-subtle text-center">Aucune facture en attente</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Derniers devis */}
        <SectionCard title="Derniers devis" subtitle="5 plus récents">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">N°</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Statut</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Montant</th>
                  <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Validité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-exec/5">
                {recentQuotes.map((q: any) => (
                  <tr key={q.id} className="hover:bg-carbon/40 transition">
                    <td className="px-3 py-2 text-xs font-mono text-ivory">{q.quote_number}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${q.status === 'accepted' ? 'bg-emerald-900/20 border-emerald-800/20 text-emerald-400' : q.status === 'sent' ? 'bg-copper/10 border-copper/20 text-copper-light' : 'bg-deep border-exec/10 text-muted'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-ivory">{formatXAF(q.total)}</td>
                    <td className="px-3 py-2 text-xs text-subtle">{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                ))}
                {recentQuotes.length === 0 && <tr><td colSpan={4} className="px-3 py-3 text-xs text-subtle text-center">Aucun devis</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { BarChart3, BookOpen, Scale, TrendingUp, FileBarChart } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

function formatXAF(n: number) { return (n || 0).toLocaleString('fr-FR') + ' XAF'; }

const TABS = [
  { id: 'balance', label: 'Bilan', icon: Scale },
  { id: 'income', label: 'Compte de résultat', icon: TrendingUp },
  { id: 'ledger', label: 'Grand livre', icon: BookOpen },
  { id: 'trial', label: 'Balance', icon: FileBarChart },
];

export default function FinanceReports() {
  const [tab, setTab] = useState('balance');
  const { data: balance } = useApiQuery(api.getBalanceSheet, {});
  const { data: income } = useApiQuery(api.getIncomeStatement, {});
  const { data: ledger } = useApiQuery(api.getGeneralLedger, []);
  const { data: trial } = useApiQuery(api.getTrialBalance, []);

  return (
    <div>
      <Topbar title="Rapports comptables" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/reports" />

        <div className="flex items-center gap-1 border-b border-exec/10 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${tab === t.id ? 'bg-copper/15 text-copper-light border border-copper/30' : 'text-muted hover:text-ivory border border-transparent'}`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'balance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Actif">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Clients (411)</span><span className="text-ivory font-bold">{formatXAF((balance as any)?.actif?.clients || 0)}</span></div>
                <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Immobilisations</span><span className="text-ivory font-bold">{formatXAF((balance as any)?.actif?.immobilisations || 0)}</span></div>
                {((balance as any)?.actif?.treasury || []).map((t: any) => (
                  <div key={t.debit_account} className="flex justify-between p-2 rounded bg-deep border border-exec/5">
                    <span className="text-muted">Trésorerie {t.debit_account}</span>
                    <span className="text-ivory font-bold">{formatXAF(t.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-2 rounded bg-copper/5 border border-copper/10 mt-2"><span className="text-copper font-bold">Total Actif</span><span className="text-copper font-bold">{formatXAF((balance as any)?.actif?.total || 0)}</span></div>
              </div>
            </SectionCard>
            <SectionCard title="Passif">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Capital (101)</span><span className="text-ivory font-bold">{formatXAF((balance as any)?.passif?.capital || 0)}</span></div>
                <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Résultat (120)</span><span className="text-ivory font-bold">{formatXAF((balance as any)?.passif?.resultat || 0)}</span></div>
                <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Fournisseurs (401)</span><span className="text-ivory font-bold">{formatXAF((balance as any)?.passif?.fournisseurs || 0)}</span></div>
                <div className="flex justify-between p-2 rounded bg-copper/5 border border-copper/10 mt-2"><span className="text-copper font-bold">Total Passif</span><span className="text-copper font-bold">{formatXAF((balance as any)?.passif?.total || 0)}</span></div>
              </div>
            </SectionCard>
            {(balance as any)?.equilibrium && (
              <div className="md:col-span-2 text-xs text-emerald-400 bg-emerald-900/10 border border-emerald-800/20 rounded-lg px-3 py-2">Bilan équilibré ✓</div>
            )}
          </div>
        )}

        {tab === 'income' && (
          <SectionCard title="Compte de résultat">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-deep border border-exec/5"><span className="text-muted">Prestations de services (701)</span><span className="text-emerald-400 font-bold">{formatXAF((income as any)?.produits?.prestations || 0)}</span></div>
              <div className="border-t border-exec/10 my-2" />
              {((income as any)?.charges || []).map((c: any) => (
                <div key={c.debit_account} className="flex justify-between p-2 rounded bg-deep border border-exec/5">
                  <span className="text-muted">{c.debit_account}</span>
                  <span className="text-red-400 font-bold">{formatXAF(c.val)}</span>
                </div>
              ))}
              <div className="flex justify-between p-2 rounded bg-copper/5 border border-copper/10 mt-2">
                <span className="text-copper font-bold">Total charges</span>
                <span className="text-copper font-bold">{formatXAF((income as any)?.totalCharges || 0)}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-emerald-900/10 border border-emerald-800/20 mt-2">
                <span className="text-emerald-400 font-bold">Résultat net</span>
                <span className={`font-bold ${(income as any)?.resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatXAF((income as any)?.resultatNet || 0)}</span>
              </div>
            </div>
          </SectionCard>
        )}

        {tab === 'ledger' && (
          <SectionCard title="Grand livre (500 dernières écritures)">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-deep">
                  <tr className="border-b border-exec/10">
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Date</th>
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Réf.</th>
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Débit</th>
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Crédit</th>
                    <th className="text-right px-3 py-2 text-xs text-subtle uppercase">Montant</th>
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-exec/5">
                  {(ledger || []).map((e: any) => (
                    <tr key={e.id} className="hover:bg-carbon/40 transition">
                      <td className="px-3 py-2 text-xs text-subtle">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-3 py-2 text-xs font-mono text-muted">{e.reference_type}</td>
                      <td className="px-3 py-2 text-xs text-ivory">{e.debit_account}</td>
                      <td className="px-3 py-2 text-xs text-ivory">{e.credit_account}</td>
                      <td className="px-3 py-2 text-xs text-ivory text-right">{formatXAF(e.amount)}</td>
                      <td className="px-3 py-2 text-xs text-muted">{e.description}</td>
                    </tr>
                  ))}
                  {(ledger || []).length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-xs text-subtle text-center">Aucune écriture</td></tr>}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {tab === 'trial' && (
          <SectionCard title="Balance (Balance des comptes)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep border-b border-exec/10">
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Compte</th>
                    <th className="text-left px-3 py-2 text-xs text-subtle uppercase">Libellé</th>
                    <th className="text-right px-3 py-2 text-xs text-subtle uppercase">Débit</th>
                    <th className="text-right px-3 py-2 text-xs text-subtle uppercase">Crédit</th>
                    <th className="text-right px-3 py-2 text-xs text-subtle uppercase">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-exec/5">
                  {(trial || []).map((r: any) => (
                    <tr key={r.code} className="hover:bg-carbon/40 transition">
                      <td className="px-3 py-2 text-xs font-mono text-ivory">{r.code}</td>
                      <td className="px-3 py-2 text-xs text-muted">{r.label}</td>
                      <td className="px-3 py-2 text-xs text-ivory text-right">{formatXAF(r.debit)}</td>
                      <td className="px-3 py-2 text-xs text-ivory text-right">{formatXAF(r.credit)}</td>
                      <td className={`px-3 py-2 text-xs font-bold text-right ${r.solde > 0 ? 'text-emerald-400' : r.solde < 0 ? 'text-red-400' : 'text-muted'}`}>{formatXAF(r.solde)}</td>
                    </tr>
                  ))}
                  {(trial || []).length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-xs text-subtle text-center">Aucune balance</td></tr>}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

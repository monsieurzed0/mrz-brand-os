import { useState, useMemo } from 'react';
import { Receipt, Plus, Loader2, CheckCircle, DollarSign } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

function formatXAF(n: number) { return (n || 0).toLocaleString('fr-FR') + ' XAF'; }

export default function FinanceInvoices() {
  const { showToast } = useStore();
  const { data: invoicesData, setData: setInvoicesData, loading } = useApiQuery(api.getInvoices, []);
  const { data: clientsData } = useApiQuery(api.getClients, []);
  const { data: quotesData } = useApiQuery(api.getQuotes, []);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const [payForm, setPayForm] = useState({ amount: '', currency: 'XAF', payment_method: 'orange_money', payment_method_detail: '', reference: '', payment_date: new Date().toISOString().slice(0, 10) });

  const clients = Array.isArray(clientsData) ? clientsData : [];
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  const clientMap = useMemo(() => {
    const m: Record<string, string> = {};
    clients.forEach((c: any) => (m[c.id] = c.name));
    return m;
  }, [clients]);

  const handlePayment = async (invoiceId: string, clientId: string) => {
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) { showToast('Montant invalide'); return; }
    setProcessing(invoiceId);
    try {
      await api.recordPayment(invoiceId, {
        amount,
        currency: payForm.currency,
        payment_method: payForm.payment_method,
        payment_method_detail: payForm.payment_method_detail,
        reference: payForm.reference,
        payment_date: payForm.payment_date,
      });
      showToast('Paiement enregistré');
      setShowPayment(null);
      setPayForm({ amount: '', currency: 'XAF', payment_method: 'orange_money', payment_method_detail: '', reference: '', payment_date: new Date().toISOString().slice(0, 10) });
      const fresh = await api.getInvoices();
      setInvoicesData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur paiement');
    } finally { setProcessing(null); }
  };

  return (
    <div>
      <Topbar title="Factures" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/invoices" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Receipt size={20} className="text-copper" /><h2 className="text-lg font-bold text-ivory">Factures</h2></div>
        </div>

        <div className="rounded-xl border border-exec/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deep border-b border-exec/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Payé</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Reste</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Échéance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exec/5">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-carbon/40 transition">
                  <td className="px-4 py-3 text-xs font-mono text-ivory">{inv.invoice_number}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${inv.invoice_type === 'acompte' ? 'bg-copper/10 border-copper/20 text-copper-light' : inv.invoice_type === 'solde' ? 'bg-emerald-900/20 border-emerald-800/20 text-emerald-400' : 'bg-deep border-exec/10 text-muted'}`}>
                      {inv.invoice_type || 'final'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{clientMap[inv.client_id] || inv.client_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${inv.status === 'paid' ? 'bg-emerald-900/20 border-emerald-800/20 text-emerald-400' : inv.status === 'partial' ? 'bg-copper/10 border-copper/20 text-copper-light' : inv.status === 'overdue' ? 'bg-red-900/20 border-red-800/20 text-red-400' : 'bg-deep border-exec/10 text-muted'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ivory">{formatXAF(inv.total)}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400">{formatXAF(inv.amount_paid)}</td>
                  <td className="px-4 py-3 text-xs text-copper-light font-bold">{formatXAF(inv.amount_due)}</td>
                  <td className="px-4 py-3 text-xs text-subtle">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">
                    {(inv.status === 'sent' || inv.status === 'partial' || inv.status === 'draft' || inv.status === 'overdue') && (
                      <button onClick={() => { setShowPayment(inv.id); setPayForm({ ...payForm, amount: String(inv.amount_due || inv.total || '') }); }} className="text-xs text-copper hover:text-copper-light flex items-center gap-1 transition">
                        <DollarSign size={10} /> Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && !loading && <tr><td colSpan={9} className="px-4 py-6 text-center text-xs text-subtle">Aucune facture</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Modal paiement */}
        {showPayment && (
          <SectionCard title="Enregistrer un paiement">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Montant</label>
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Devise</label>
                <select value={payForm.currency} onChange={(e) => setPayForm({ ...payForm, currency: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="XAF">XAF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Méthode</label>
                <select value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_momo">MTN MoMo</option>
                  <option value="cash">Espèces</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="chariow">Chariow (lien)</option>
                  <option value="paypal">PayPal</option>
                  <option value="wave">Wave</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Détail méthode (ex: n° OM)</label>
                <input value={payForm.payment_method_detail} onChange={(e) => setPayForm({ ...payForm, payment_method_detail: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Référence</label>
                <input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Date</label>
                <input type="date" value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  const inv = invoices.find((i: any) => i.id === showPayment);
                  if (inv) handlePayment(showPayment, inv.client_id);
                }}
                disabled={processing === showPayment}
                className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition disabled:opacity-50"
              >
                {processing === showPayment ? <Loader2 size={12} className="animate-spin inline mr-1" /> : <CheckCircle size={12} className="inline mr-1" />}
                Enregistrer
              </button>
              <button onClick={() => setShowPayment(null)} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

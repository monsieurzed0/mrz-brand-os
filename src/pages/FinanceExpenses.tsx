import { useState } from 'react';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

function formatXAF(n: number) { return (n || 0).toLocaleString('fr-FR') + ' XAF'; }

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'software', label: 'Logiciel' },
  { value: 'subscription', label: 'Abonnement' },
  { value: 'hardware', label: 'Matériel' },
  { value: 'marketing', label: 'Marketing / Publicité' },
  { value: 'subcontractor', label: 'Sous-traitance' },
  { value: 'telecom', label: 'Télécom / Internet' },
  { value: 'office', label: 'Bureau / Fournitures' },
  { value: 'travel', label: 'Déplacement' },
  { value: 'bank_fees', label: 'Frais bancaires' },
  { value: 'taxes', label: 'Taxes / Impôts' },
  { value: 'other', label: 'Autre' },
];

const METHODS: { value: string; label: string }[] = [
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'cash', label: 'Espèces' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'wave', label: 'Wave' },
];

const CATEGORY_LABELS: Record<string, string> = CATEGORIES.reduce((m, c) => { m[c.value] = c.label; return m; }, {} as Record<string, string>);
const METHOD_LABELS: Record<string, string> = METHODS.reduce((m, c) => { m[c.value] = c.label; return m; }, {} as Record<string, string>);

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: 'software',
  currency: 'XAF',
  payment_method: 'orange_money',
  vendor: '',
  expense_date: new Date().toISOString().slice(0, 10),
};

export default function FinanceExpenses() {
  const { showToast } = useStore();
  const { data: expensesData, setData: setExpensesData, loading } = useApiQuery(api.getExpenses, []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const expenses = Array.isArray(expensesData) ? expensesData : [];

  const handleSave = async () => {
    const amount = Number(form.amount);
    if (!form.description.trim()) { showToast('Description requise'); return; }
    if (!amount || amount <= 0) { showToast('Montant invalide'); return; }
    setSaving(true);
    try {
      await api.createExpense({
        description: form.description.trim(),
        amount,
        category: form.category,
        currency: form.currency,
        payment_method: form.payment_method,
        vendor: form.vendor.trim(),
        expense_date: form.expense_date,
      });
      showToast('Dépense enregistrée');
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      const fresh = await api.getExpenses();
      setExpensesData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <Topbar title="Dépenses" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/expenses" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Wallet size={20} className="text-copper" /><h2 className="text-lg font-bold text-ivory">Dépenses</h2></div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"><Plus size={14} /> Nouvelle dépense</button>
        </div>

        {showForm && (
          <SectionCard title="Nouvelle dépense">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs text-subtle font-semibold">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Abonnement Canva Pro" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Montant</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Devise</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="XAF">XAF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Catégorie</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Moyen de paiement</label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Fournisseur</label>
                <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Ex: Canva, MTN, Jumia..." className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Date</label>
                <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition disabled:opacity-50">
                {saving ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                Enregistrer
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}

        <div className="rounded-xl border border-exec/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deep border-b border-exec/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Fournisseur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Méthode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exec/5">
              {expenses.map((e: any) => (
                <tr key={e.id} className="hover:bg-carbon/40 transition">
                  <td className="px-4 py-3 text-xs text-subtle">{e.expense_date ? new Date(e.expense_date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-ivory">{e.description}</td>
                  <td className="px-4 py-3 text-xs text-muted">{CATEGORY_LABELS[e.category] || e.category}</td>
                  <td className="px-4 py-3 text-xs text-muted">{e.vendor || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{METHOD_LABELS[e.payment_method] || e.payment_method || '—'}</td>
                  <td className="px-4 py-3 text-xs text-copper-light font-bold">
                    {formatXAF(e.amount_xaf || e.amount)}
                    {e.currency && e.currency !== 'XAF' && <span className="text-subtle font-normal"> ({(e.amount || 0).toLocaleString('fr-FR')} {e.currency})</span>}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && !loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-subtle">Aucune dépense enregistrée</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

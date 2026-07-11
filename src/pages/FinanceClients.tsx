import { useState } from 'react';
import { Users, Plus, Loader2, TrendingUp, Wallet } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

function formatXAF(n: number) { return (n || 0).toLocaleString('fr-FR') + ' XAF'; }

export default function FinanceClients() {
  const { showToast } = useStore();
  const { data: clientsData, setData: setClientsData, loading } = useApiQuery(api.getClients, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: 'Yaoundé', country: 'CM', preferred_currency: 'XAF', notes: '' });

  const clients = Array.isArray(clientsData) ? clientsData : [];

  const handleSave = async () => {
    if (!form.name) { showToast('Nom requis'); return; }
    try {
      await api.createClient(form);
      showToast('Client créé');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', city: 'Yaoundé', country: 'CM', preferred_currency: 'XAF', notes: '' });
      const fresh = await api.getClients();
      setClientsData(fresh);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur'); }
  };

  return (
    <div>
      <Topbar title="Clients" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/clients" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Users size={20} className="text-copper" /><h2 className="text-lg font-bold text-ivory">Clients</h2></div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"><Plus size={14} /> Nouveau</button>
        </div>

        {showForm && (
          <SectionCard title="Nouveau client">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div><label className="text-xs text-subtle font-semibold">Nom</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Téléphone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Ville</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Pays</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
              <div><label className="text-xs text-subtle font-semibold">Devise préférée</label><select value={form.preferred_currency} onChange={(e) => setForm({ ...form, preferred_currency: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"><option value="XAF">XAF</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}

        <div className="rounded-xl border border-exec/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-deep border-b border-exec/10"><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Nom</th><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Contact</th><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Ville</th><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">CA</th><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Payé</th><th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Reste</th></tr></thead>
            <tbody className="divide-y divide-exec/5">
              {clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-carbon/40 transition">
                  <td className="px-4 py-3 text-xs font-bold text-ivory">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-muted">{c.email || c.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{c.city}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400">{formatXAF(c.total_revenue)}</td>
                  <td className="px-4 py-3 text-xs text-copper-light">{formatXAF(c.total_paid)}</td>
                  <td className="px-4 py-3 text-xs text-red-400">{formatXAF(c.total_due)}</td>
                </tr>
              ))}
              {clients.length === 0 && !loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-subtle">Aucun client</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

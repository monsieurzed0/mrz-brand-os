import { useState, useMemo } from 'react';
import { FileText, Plus, Loader2, CheckCircle, ArrowRightCircle, Copy } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

export default function FinanceQuotes() {
  const { showToast } = useStore();
  const { data: quotesData, setData: setQuotesData, loading } = useApiQuery(api.getQuotes, []);
  const { data: clientsData } = useApiQuery(api.getClients, []);
  const { data: servicesData } = useApiQuery(api.getServicesCatalog, []);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [form, setForm] = useState({ client_id: '', currency: 'XAF', acompte_percent: '0', terms: 'Paiement à 7 jours', notes: '' });

  const clients = Array.isArray(clientsData) ? clientsData : [];
  const services = Array.isArray(servicesData) ? servicesData : [];
  const quotes = Array.isArray(quotesData) ? quotesData : [];

  const clientMap = useMemo(() => {
    const m: Record<string, string> = {};
    clients.forEach((c: any) => (m[c.id] = c.name));
    return m;
  }, [clients]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0, discount_percent: 0, service_id: '' }]);
  };

  const handleSave = async () => {
    if (!form.client_id) { showToast('Sélectionnez un client'); return; }
    try {
      const quoteRes: any = await api.createQuote({
        client_id: form.client_id,
        currency: form.currency,
        acompte_percent: Number(form.acompte_percent) || 0,
        terms: form.terms,
        notes: form.notes,
      });
      const quoteId = quoteRes.id;
      for (const item of items) {
        await api.createQuoteItem({ quote_id: quoteId, ...item });
      }
      showToast('Devis créé');
      setShowForm(false);
      setItems([]);
      setForm({ client_id: '', currency: 'XAF', acompte_percent: '0', terms: 'Paiement à 7 jours', notes: '' });
      const fresh = await api.getQuotes();
      setQuotesData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const convertQuote = async (id: string) => {
    setProcessing(id);
    try {
      const res: any = await api.convertQuoteToInvoice(id);
      showToast(`Devis converti — ${res.acompteNumber || res.invoiceNumber || 'Facture générée'}`);
      const fresh = await api.getQuotes();
      setQuotesData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur conversion');
    } finally { setProcessing(null); }
  };

  const copyQuote = (q: any) => {
    const text = `DEVIS ${q.quote_number}\nClient: ${clientMap[q.client_id] || q.client_id}\nTotal: ${(q.total || 0).toLocaleString('fr-FR')} ${q.currency}\n\n${(q.terms || '')}`;
    navigator.clipboard.writeText(text);
    showToast('Devis copié');
  };

  return (
    <div>
      <Topbar title="Devis" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/quotes" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><FileText size={20} className="text-copper" /><h2 className="text-lg font-bold text-ivory">Devis</h2></div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"><Plus size={14} /> Nouveau</button>
        </div>

        {showForm && (
          <SectionCard title="Nouveau devis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Client</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="">Sélectionner…</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Devise</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="XAF">XAF (FCFA)</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Acompte (%)</label>
                <select value={form.acompte_percent} onChange={(e) => setForm({ ...form, acompte_percent: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                  <option value="0">Aucun</option>
                  <option value="30">30 %</option>
                  <option value="50">50 %</option>
                  <option value="70">70 %</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-subtle font-semibold">Conditions</label>
                <input value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-subtle font-semibold">Lignes</span>
                <button onClick={handleAddItem} className="text-xs text-copper hover:text-copper-light flex items-center gap-1"><Plus size={12} /> Ajouter ligne</button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                  <select value={item.service_id} onChange={(e) => {
                    const svc = services.find((s: any) => s.id === e.target.value);
                    const updated = [...items];
                    updated[idx] = { ...item, service_id: e.target.value, description: svc?.name || item.description, unit_price: svc?.unit_price || item.unit_price };
                    setItems(updated);
                  }} className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none">
                    <option value="">Service…</option>
                    {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input value={item.description} onChange={(e) => { const updated = [...items]; updated[idx] = { ...item, description: e.target.value }; setItems(updated); }} placeholder="Description" className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none" />
                  <input type="number" value={item.quantity} onChange={(e) => { const updated = [...items]; updated[idx] = { ...item, quantity: Number(e.target.value) }; setItems(updated); }} placeholder="Qty" className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none" />
                  <input type="number" value={item.unit_price} onChange={(e) => { const updated = [...items]; updated[idx] = { ...item, unit_price: Number(e.target.value) }; setItems(updated); }} placeholder="PU HT" className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none" />
                  <input type="number" value={item.discount_percent} onChange={(e) => { const updated = [...items]; updated[idx] = { ...item, discount_percent: Number(e.target.value) }; setItems(updated); }} placeholder="Remise %" className="bg-deep border border-exec/15 rounded-lg px-2 py-1.5 text-xs text-ivory focus:outline-none" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">Enregistrer</button>
              <button onClick={() => { setShowForm(false); setItems([]); }} className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition">Annuler</button>
            </div>
          </SectionCard>
        )}

        <div className="rounded-xl border border-exec/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deep border-b border-exec/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Acompte</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exec/5">
              {quotes.map((q: any) => (
                <tr key={q.id} className="hover:bg-carbon/40 transition cursor-pointer" onClick={() => setSelectedQuote(q)}>
                  <td className="px-4 py-3 text-xs font-mono text-ivory">{q.quote_number}</td>
                  <td className="px-4 py-3 text-xs text-muted">{clientMap[q.client_id] || q.client_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${q.status === 'accepted' ? 'bg-emerald-900/20 border-emerald-800/20 text-emerald-400' : q.status === 'sent' ? 'bg-copper/10 border-copper/20 text-copper-light' : 'bg-deep border-exec/10 text-muted'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ivory">{(q.total || 0).toLocaleString('fr-FR')} {q.currency}</td>
                  <td className="px-4 py-3 text-xs text-subtle">{q.acompte_percent ? `${q.acompte_percent}%` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); copyQuote(q); }} className="text-xs text-muted hover:text-copper transition"><Copy size={12} /></button>
                      {q.status === 'accepted' || q.status === 'sent' ? (
                        <button onClick={(e) => { e.stopPropagation(); convertQuote(q.id); }} disabled={processing === q.id} className="text-xs text-copper hover:text-copper-light flex items-center gap-1 transition disabled:opacity-50">
                          {processing === q.id ? <Loader2 size={10} className="animate-spin" /> : <ArrowRightCircle size={10} />}
                          Convertir
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && !loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-subtle">Aucun devis</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


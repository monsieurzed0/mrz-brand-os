import { useState } from 'react';
import { Settings, Plus, Save, Globe, Tag } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import FinanceNav from '@/components/FinanceNav';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStore } from '@/lib/useStore';

export default function FinanceSettings() {
  const { showToast } = useStore();
  const { data: settingsData, setData: setSettingsData } = useApiQuery(api.getCompanySettings, {});
  const { data: servicesData, setData: setServicesData } = useApiQuery(api.getServicesCatalog, []);
  const { data: ratesData, setData: setRatesData } = useApiQuery(api.getExchangeRates, []);

  const [settingsForm, setSettingsForm] = useState(settingsData || {});
  const [showService, setShowService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', category: 'service', unit_price: '', currency: 'XAF', product_brand: 'Mr Z Brand', duration_estimate: '' });
  const [rateForm, setRateForm] = useState({ from_currency: 'USD', to_currency: 'XAF', rate: '', rate_date: new Date().toISOString().slice(0, 10) });

  const services = Array.isArray(servicesData) ? servicesData : [];
  const rates = Array.isArray(ratesData) ? ratesData : [];

  const saveSettings = async () => {
    try {
      await api.updateCompanySettings(settingsForm);
      showToast('Paramètres enregistrés');
      const fresh = await api.getCompanySettings();
      setSettingsData(fresh);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur'); }
  };

  const saveService = async () => {
    if (!serviceForm.name || !serviceForm.unit_price) { showToast('Nom et prix requis'); return; }
    try {
      await api.createServiceCatalog({ ...serviceForm, unit_price: Number(serviceForm.unit_price) });
      showToast('Service ajouté');
      setShowService(false);
      setServiceForm({ name: '', description: '', category: 'service', unit_price: '', currency: 'XAF', product_brand: 'Mr Z Brand', duration_estimate: '' });
      const fresh = await api.getServicesCatalog();
      setServicesData(fresh);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur'); }
  };

  const saveRate = async () => {
    if (!rateForm.rate) { showToast('Taux requis'); return; }
    try {
      await api.createExchangeRate({ ...rateForm, rate: Number(rateForm.rate) });
      showToast('Taux ajouté');
      setRateForm({ from_currency: 'USD', to_currency: 'XAF', rate: '', rate_date: new Date().toISOString().slice(0, 10) });
      const fresh = await api.getExchangeRates();
      setRatesData(fresh);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur'); }
  };

  return (
    <div>
      <Topbar title="Paramètres Finance" />
      <div className="p-6 space-y-5 animate-fade-in">
        <FinanceNav activePath="/finance/settings" />

        {/* Entreprise */}
        <SectionCard title="Paramètres entreprise" headerRight={<button onClick={saveSettings} className="flex items-center gap-1 text-xs text-copper hover:text-copper-light transition"><Save size={12} /> Enregistrer</button>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { k: 'business_name', label: 'Nom entreprise' },
              { k: 'legal_form', label: 'Forme juridique' },
              { k: 'niu', label: 'NIU' },
              { k: 'rccm', label: 'RCCM' },
              { k: 'address', label: 'Adresse' },
              { k: 'city', label: 'Ville' },
              { k: 'country', label: 'Pays' },
              { k: 'phone', label: 'Téléphone' },
              { k: 'email', label: 'Email' },
              { k: 'bank_name', label: 'Banque' },
              { k: 'bank_account', label: 'Compte bancaire' },
              { k: 'bank_iban', label: 'IBAN' },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-xs text-subtle font-semibold">{f.label}</label>
                <input value={(settingsForm as any)[f.k] || ''} onChange={(e) => setSettingsForm({ ...settingsForm, [f.k]: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              </div>
            ))}
            <div>
              <label className="text-xs text-subtle font-semibold">TVA activée</label>
              <select value={String((settingsForm as any).tva_enabled || 0)} onChange={(e) => setSettingsForm({ ...settingsForm, tva_enabled: Number(e.target.value) })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                <option value="0">Non — freelance non assujetti</option>
                <option value="1">Oui — assujetti TVA</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Taux TVA (%)</label>
              <input type="number" step="0.01" value={(settingsForm as any).tva_rate || 0} onChange={(e) => setSettingsForm({ ...settingsForm, tva_rate: Number(e.target.value) })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Devise par défaut</label>
              <select value={(settingsForm as any).currency_default || 'XAF'} onChange={(e) => setSettingsForm({ ...settingsForm, currency_default: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Préfix devis</label>
              <input value={(settingsForm as any).quote_prefix || 'DEV-'} onChange={(e) => setSettingsForm({ ...settingsForm, quote_prefix: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Préfix facture</label>
              <input value={(settingsForm as any).invoice_prefix || 'FAC-'} onChange={(e) => setSettingsForm({ ...settingsForm, invoice_prefix: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
          </div>
        </SectionCard>

        {/* Catalogue de services */}
        <SectionCard title="Catalogue de services" headerRight={<button onClick={() => setShowService(true)} className="flex items-center gap-1 text-xs text-copper hover:text-copper-light transition"><Plus size={12} /> Ajouter</button>}>
          {showService && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Nom du service" className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              <input value={serviceForm.unit_price} onChange={(e) => setServiceForm({ ...serviceForm, unit_price: e.target.value })} placeholder="Prix unitaire HT" type="number" className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              <select value={serviceForm.currency} onChange={(e) => setServiceForm({ ...serviceForm, currency: e.target.value })} className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input value={serviceForm.duration_estimate} onChange={(e) => setServiceForm({ ...serviceForm, duration_estimate: e.target.value })} placeholder="Durée estimée (ex: 2 jours)" className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
              <select value={serviceForm.product_brand} onChange={(e) => setServiceForm({ ...serviceForm, product_brand: e.target.value })} className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                <option value="Mr Z Brand">Mr Z Brand</option>
                <option value="SIGNAL™ by Mr Z">SIGNAL™ by Mr Z</option>
                <option value="PROSKILLS FR">PROSKILLS FR</option>
                <option value="générique">Générique</option>
              </select>
              <div className="flex gap-2">
                <button onClick={saveService} className="px-3 py-2 rounded-lg bg-copper text-dark text-xs font-bold hover:bg-copper-light transition">Enregistrer</button>
                <button onClick={() => setShowService(false)} className="px-3 py-2 rounded-lg border border-exec/15 text-muted text-xs hover:border-copper/30 transition">Annuler</button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-deep border-b border-exec/10"><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Service</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Marque</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Prix</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Durée</th></tr></thead>
              <tbody className="divide-y divide-exec/5">
                {services.map((s: any) => (
                  <tr key={s.id} className="hover:bg-carbon/40 transition">
                    <td className="px-3 py-2 text-xs text-ivory">{s.name}</td>
                    <td className="px-3 py-2 text-xs text-muted"><Tag size={10} className="inline mr-1 text-copper" />{s.product_brand}</td>
                    <td className="px-3 py-2 text-xs text-ivory font-bold">{s.unit_price?.toLocaleString('fr-FR')} {s.currency}</td>
                    <td className="px-3 py-2 text-xs text-subtle">{s.duration_estimate}</td>
                  </tr>
                ))}
                {services.length === 0 && <tr><td colSpan={4} className="px-3 py-3 text-xs text-subtle text-center">Aucun service</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Taux de change */}
        <SectionCard title="Taux de change" subtitle="Vers XAF" headerRight={<Globe size={14} className="text-copper" />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <select value={rateForm.from_currency} onChange={(e) => setRateForm({ ...rateForm, from_currency: e.target.value })} className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <input type="number" step="0.01" value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} placeholder="1 USD = ? XAF" className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            <input type="date" value={rateForm.rate_date} onChange={(e) => setRateForm({ ...rateForm, rate_date: e.target.value })} className="bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            <button onClick={saveRate} className="px-3 py-2 rounded-lg bg-copper text-dark text-xs font-bold hover:bg-copper-light transition">Ajouter taux</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-deep border-b border-exec/10"><th className="text-left px-3 py-2 text-xs text-subtle uppercase">De</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Vers</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Taux</th><th className="text-left px-3 py-2 text-xs text-subtle uppercase">Date</th></tr></thead>
              <tbody className="divide-y divide-exec/5">
                {rates.map((r: any) => (
                  <tr key={r.id} className="hover:bg-carbon/40 transition">
                    <td className="px-3 py-2 text-xs text-ivory">{r.from_currency}</td>
                    <td className="px-3 py-2 text-xs text-ivory">{r.to_currency}</td>
                    <td className="px-3 py-2 text-xs font-bold text-copper-light">{r.rate}</td>
                    <td className="px-3 py-2 text-xs text-subtle">{r.rate_date}</td>
                  </tr>
                ))}
                {rates.length === 0 && <tr><td colSpan={4} className="px-3 py-3 text-xs text-subtle text-center">Aucun taux</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

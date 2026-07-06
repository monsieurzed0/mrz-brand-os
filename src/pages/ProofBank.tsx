import { useMemo, useState } from 'react';
import { Shield, Plus, Check, X } from 'lucide-react';

import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';

import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

type UiProof = {
  id: string;
  type: string;
  projectLinked: string;
  content: string;
  usage: string;
  validated: boolean;
  createdAt: string;
};

export default function ProofBank() {
  const { showToast } = useStore();

  const {
    data: proofsData,
    loading,
    error,
    setData: setProofsData,
  } = useApiQuery(api.getProofs, []);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<Partial<UiProof>>({
    type: '',
    projectLinked: '',
    content: '',
    usage: '',
    validated: false,
  });

  const proofTypes = [
    'Livraison projet',
    'Témoignage client',
    'Résultat mesurable',
    'Portfolio',
    "Cas d'étude",
    'Référence',
  ];

  const proofs: UiProof[] = useMemo(() => {
    const safe = Array.isArray(proofsData) ? proofsData : [];
    return safe.map((proof: any) => ({
      id: proof.id,
      type: proof.type_preuve || '',
      projectLinked: proof.project_id || '',
      content: proof.contenu || '',
      usage: proof.usage_possible || '',
      validated: !!proof.is_validated,
      createdAt: proof.created_at || '',
    }));
  }, [proofsData]);

  const validatedCount = proofs.filter((p) => p.validated).length;
  const pendingCount = proofs.filter((p) => !p.validated).length;

  const handleSave = async () => {
    if (!form.content) {
      showToast('Contenu manquant');
      return;
    }

    try {
      const payload = {
        project_id: form.projectLinked || '',
        type_preuve: form.type || '',
        contenu: form.content || '',
        asset_url: '',
        usage_possible: form.usage || '',
        is_validated: form.validated ? 1 : 0,
      };

      const result: any = await api.createProof(payload);

      const newProof = {
        id: result.id,
        ...payload,
      };

      setProofsData((prev: any) => [...(prev || []), newProof]);

      setForm({
        type: '',
        projectLinked: '',
        content: '',
        usage: '',
        validated: false,
      });

      setShowForm(false);
      showToast('Preuve ajoutée');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l’ajout');
    }
  };

  const toggleValidated = async (proof: UiProof) => {
    try {
      await api.updateProof(proof.id, { is_validated: proof.validated ? 0 : 1 });

      setProofsData((prev: any) =>
        (prev || []).map((item: any) =>
          item.id === proof.id
            ? { ...item, is_validated: proof.validated ? 0 : 1 }
            : item
        )
      );

      showToast(proof.validated ? 'Preuve repassée en attente' : 'Preuve validée');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProof(id);
      setProofsData((prev: any) => (prev || []).filter((item: any) => item.id !== id));
      showToast('Preuve supprimée');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <div>
      <Topbar title="Proof Bank" />

      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Banque de preuves</h2>
            <span className="text-xs text-subtle bg-deep px-2 py-0.5 rounded-full">
              {proofs.length}
            </span>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm hover:border-copper/30 transition"
          >
            <Plus size={14} /> Nouvelle preuve
          </button>
        </div>

        {loading ? <div className="text-sm text-subtle">Chargement des preuves...</div> : null}
        {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-exec/10 bg-carbon p-4 text-center">
            <p className="text-2xl font-bold text-copper-light">{validatedCount}</p>
            <p className="text-xs text-subtle mt-1">Validées</p>
          </div>

          <div className="rounded-xl border border-exec/10 bg-carbon p-4 text-center">
            <p className="text-2xl font-bold text-ivory">{pendingCount}</p>
            <p className="text-xs text-subtle mt-1">En attente</p>
          </div>

          <div className="rounded-xl border border-exec/10 bg-carbon p-4 text-center">
            <p className="text-2xl font-bold text-muted">{proofs.length}</p>
            <p className="text-xs text-subtle mt-1">Total</p>
          </div>
        </div>

        {showForm && (
          <SectionCard title="Nouvelle preuve">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-subtle font-semibold">Type</label>
                <select
                  value={form.type || ''}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                >
                  <option value="">Sélectionnez un type</option>
                  {proofTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Projet lié</label>
                <input
                  value={form.projectLinked || ''}
                  onChange={(e) => setForm({ ...form, projectLinked: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-subtle font-semibold">Contenu</label>
                <textarea
                  value={form.content || ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-subtle font-semibold">Usage possible</label>
                <input
                  value={form.usage || ''}
                  onChange={(e) => setForm({ ...form, usage: e.target.value })}
                  className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition"
              >
                Ajouter
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-exec/15 text-muted text-sm hover:border-copper/30 transition"
              >
                Annuler
              </button>
            </div>
          </SectionCard>
        )}

        {/* Proofs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className={`rounded-xl border bg-carbon p-4 transition ${
                proof.validated ? 'border-copper/20' : 'border-exec/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ivory bg-deep px-2 py-0.5 rounded">
                      {proof.type}
                    </span>

                    {proof.validated ? (
                      <span className="flex items-center gap-1 text-xs text-copper font-semibold">
                        <Check size={11} /> Validée
                      </span>
                    ) : (
                      <span className="text-xs text-subtle">En attente</span>
                    )}
                  </div>

                  <p className="text-xs text-copper mt-1">{proof.projectLinked}</p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => toggleValidated(proof)}
                    className={`p-1 rounded hover:bg-copper/10 ${
                      proof.validated ? 'text-copper' : 'text-subtle hover:text-copper'
                    }`}
                  >
                    <Check size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(proof.id)}
                    className="p-1 rounded text-subtle hover:text-red-400 hover:bg-red-900/10"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted mt-2">{proof.content}</p>
              <p className="text-xs text-subtle mt-2">Usage : {proof.usage}</p>
              <p className="text-xs text-subtle/60 mt-1">
                {proof.createdAt ? new Date(proof.createdAt).toLocaleDateString('fr-FR') : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

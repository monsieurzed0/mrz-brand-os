import { useState } from 'react';
import { Crown, Radar, Lightbulb, PenTool, Palette, Target, Shield, Play, Bot, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

const AGENTS = [
  { id: 'chief-of-staff', name: 'Chief of Staff', icon: 'Crown', mission: 'Orchestration générale, rapport hebdomadaire, alignement des priorités', status: 'active' as const },
  { id: 'market-intel', name: 'Market Intel', icon: 'Radar', mission: 'Veille concurrentielle, analyse marché, détection d\'opportunités', status: 'active' as const },
  { id: 'content-strategist', name: 'Content Strategist', icon: 'Lightbulb', mission: 'Génération d\'idées, analyse tendances, planification éditoriale', status: 'active' as const },
  { id: 'scriptwriter', name: 'Scriptwriter', icon: 'PenTool', mission: 'Rédaction de scripts, hooks, captions, CTA', status: 'active' as const },
  { id: 'prompt-engineer', name: 'Prompt Engineer', icon: 'Palette', mission: 'Création de prompts visuels, direction artistique IA', status: 'active' as const },
  { id: 'sales-lead-ops', name: 'Sales & Lead Ops', icon: 'Target', mission: 'Qualification leads, scoring, préparation relances', status: 'active' as const },
  { id: 'proof-delivery', name: 'Proof & Delivery', icon: 'Shield', mission: 'Suivi livraisons, collecte de preuves, documentation', status: 'active' as const },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Crown: <Crown size={20} />,
  Radar: <Radar size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  PenTool: <PenTool size={20} />,
  Palette: <Palette size={20} />,
  Target: <Target size={20} />,
  Shield: <Shield size={20} />,
};

const relations = [
  { from: 'Chief of Staff', to: 'Content Strategist', label: 'dirige' },
  { from: 'Chief of Staff', to: 'Sales & Lead Ops', label: 'dirige' },
  { from: 'Content Strategist', to: 'Scriptwriter', label: 'alimente' },
  { from: 'Scriptwriter', to: 'Prompt Engineer', label: 'envoie vers' },
  { from: 'Sales & Lead Ops', to: 'Proof & Delivery', label: 'alimente' },
  { from: 'Market Intel', to: 'Content Strategist', label: 'informe' },
  { from: 'Market Intel', to: 'Sales & Lead Ops', label: 'informe' },
];

export default function AgentConsole() {
  const { showToast } = useStore();
  const { data: runsData, loading: runsLoading, setData: setRunsData } = useApiQuery(api.getAgentRuns, []);
  const { data: scriptsData } = useApiQuery(api.getScripts, []);
  const [launching, setLaunching] = useState<string | null>(null);

  const agentRuns = Array.isArray(runsData) ? runsData : [];

  const launchAgent = async (agent: typeof AGENTS[0]) => {
    setLaunching(agent.id);
    try {
      let result: any;
      switch (agent.id) {
        case 'chief-of-staff':
          result = await api.runChiefOfStaff({ mode: 'report' });
          break;
        case 'market-intel':
          result = await api.runMarketIntel({ category: 'opportunities' });
          break;
        case 'content-strategist':
          result = await api.runContentStrategist({ count: 5 });
          break;
        case 'scriptwriter':
          result = await api.runScriptwriter({});
          break;
        case 'prompt-engineer': {
          const scripts = Array.isArray(scriptsData) ? scriptsData : [];
          const lastScript = scripts[0];
          if (!lastScript) {
            showToast('Aucun script disponible. Générez un script d\'abord.');
            setLaunching(null);
            return;
          }
          result = await api.runPromptEngineer({ script_id: lastScript.id });
          break;
        }
        case 'sales-lead-ops':
          result = await api.runSalesLeadOps({ mode: 'qualify' });
          break;
        case 'proof-delivery':
          result = await api.runProofDelivery({ mode: 'collect' });
          break;
        default:
          showToast('Agent non reconnu');
          return;
      }
      showToast(`${agent.name} exécuté — ${result?.mode === 'fallback' || result?.fallback ? 'fallback local' : 'via AI'}`);
      const fresh = await api.getAgentRuns();
      setRunsData(fresh);
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Erreur ${agent.name}`);
    } finally {
      setLaunching(null);
    }
  };

  return (
    <div>
      <Topbar title="Agent Console" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={20} className="text-copper" />
          <h2 className="text-lg font-bold text-ivory">Salle des agents</h2>
          <span className="text-xs text-subtle">— 7 agents IA spécialisés</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENTS.map(agent => (
            <div key={agent.id} className={`rounded-xl border bg-carbon p-4 transition hover:border-copper/20 ${agent.status === 'active' ? 'border-copper/15' : 'border-exec/10'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${agent.status === 'active' ? 'bg-copper/15 text-copper' : 'bg-exec/10 text-exec'}`}>
                  {ICON_MAP[agent.icon] || <Bot size={20} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-copper animate-pulse-copper' : agent.status === 'error' ? 'bg-red-400' : 'bg-subtle/40'}`} />
                  <StatusBadge status={agent.status} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-ivory mb-1">{agent.name}</h3>
              <p className="text-xs text-subtle line-clamp-2 mb-3">{agent.mission}</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => launchAgent(agent)}
                  disabled={launching === agent.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-semibold hover:bg-copper/25 transition disabled:opacity-50"
                >
                  {launching === agent.id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                  Lancer
                </button>
              </div>
            </div>
          ))}
        </div>

        <SectionCard title="Relations entre agents" subtitle="Flux d'information et de coordination">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {relations.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-deep border border-exec/5 text-xs">
                <span className="text-ivory font-medium">{r.from}</span>
                <span className="text-copper text-[10px]">→ {r.label} →</span>
                <span className="text-muted">{r.to}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Historique des runs" headerRight={runsLoading ? <Loader2 size={14} className="animate-spin text-copper" /> : null}>
          <div className="rounded-xl border border-exec/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Résumé</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-exec/5">
                {agentRuns.length === 0 && !runsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-subtle">Aucun run enregistré</td>
                  </tr>
                ) : (
                  agentRuns.map((run: any) => (
                    <tr key={run.id} className="hover:bg-carbon/40 transition">
                      <td className="px-4 py-3 text-ivory font-medium">{run.agent_name}</td>
                      <td className="px-4 py-3 text-muted text-xs">{run.provider || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={run.run_status || 'done'} /></td>
                      <td className="px-4 py-3 text-muted text-xs max-w-xs truncate">{run.output_summary}</td>
                      <td className="px-4 py-3 text-subtle text-xs">{run.created_at ? new Date(run.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

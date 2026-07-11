import { useState, type ReactNode } from 'react';
import {
  Crown, Radar, Lightbulb, PenTool, Palette, Target, Shield,
  Play, Bot, Loader2, Filter, ChevronDown, X, Zap, CalendarDays, Radio
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import AgentNetwork, { type NetworkEvent } from '@/components/AgentNetwork';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { AGENTS } from '@/lib/agentConstants';

const ICON_MAP: Record<string, ReactNode> = {
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

/* ------------------------------------------------------------------ */
/*  Semaine type — scénario de test                                    */
/* ------------------------------------------------------------------ */

const WEEK_SCENARIO = [
  { day: 'Lundi', time: '09:00', agentId: 'chief-of-staff', label: 'Rapport hebdomadaire' },
  { day: 'Lundi', time: '09:30', agentId: 'market-intel', label: 'Veille marché' },
  { day: 'Lundi', time: '10:00', agentId: 'content-strategist', label: '5 idées de contenu' },
  { day: 'Mardi', time: '09:00', agentId: 'scriptwriter', label: 'Rédaction scripts' },
  { day: 'Mercredi', time: '09:00', agentId: 'prompt-engineer', label: 'Prompts visuels' },
  { day: 'Mercredi', time: '11:00', agentId: 'sales-lead-ops', label: 'Qualification leads' },
  { day: 'Jeudi', time: '09:00', agentId: 'proof-delivery', label: 'Collecte preuves' },
];

/* ------------------------------------------------------------------ */
/*  Helpers réseau                                                    */
/* ------------------------------------------------------------------ */

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AgentConsole() {
  const { showToast } = useStore();

  const { data: runsData, loading: runsLoading, setData: setRunsData } = useApiQuery(api.getAgentRuns, []);
  const { data: scriptsData } = useApiQuery(api.getScripts, []);

  const [launching, setLaunching] = useState<string | null>(null);
  const [activeAgentIds, setActiveAgentIds] = useState<string[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);

  const [runFilterAgent, setRunFilterAgent] = useState('');
  const [runFilterStatus, setRunFilterStatus] = useState('');
  const [runLimit, setRunLimit] = useState(10);

  const [simulating, setSimulating] = useState(false);
  const [simLog, setSimLog] = useState<Array<{ step: typeof WEEK_SCENARIO[0]; status: 'pending' | 'running' | 'done' | 'error' }>>([]);

  const agentRuns = Array.isArray(runsData) ? runsData : [];

  const filteredRuns = agentRuns.filter((run: any) => {
    if (runFilterAgent && run.agent_name !== runFilterAgent) return false;
    if (runFilterStatus && run.run_status !== runFilterStatus) return false;
    return true;
  });
  const displayedRuns = filteredRuns.slice(0, runLimit);
  const hasMoreRuns = filteredRuns.length > runLimit;

  /* -------- push network event -------- */
  const emit = (event: Omit<NetworkEvent, 'id' | 'timestamp'>) => {
    setNetworkEvents(prev => [...prev.slice(-30), { ...event, id: uid(), timestamp: Date.now() }]);
  };

  /* -------- launch a single agent -------- */
  const launchAgent = async (agent: typeof AGENTS[number]) => {
    setLaunching(agent.id);
    setActiveAgentIds(prev => [...prev, agent.id]);

    emit({ type: 'pulse', node: agent.id });
    emit({ type: 'packet', from: agent.id, to: 'backend', label: 'POST /run', status: 'running' });

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
            setActiveAgentIds(prev => prev.filter(id => id !== agent.id));
            setLaunching(null);
            return null;
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
          return null;
      }

      /* --- backend flow simulation --- */
      const provider = result?.provider || 'fallback';
      const fallback = result?.fallback || result?.mode === 'fallback';

      setTimeout(() => {
        emit({ type: 'packet', from: 'backend', to: 'internet', label: `LLM ${provider}`, status: fallback ? 'error' : 'success' });
      }, 300);

      setTimeout(() => {
        emit({ type: 'packet', from: 'internet', to: 'backend', label: fallback ? 'Fallback' : 'Tokens OK', status: fallback ? 'error' : 'success' });
      }, 700);

      setTimeout(() => {
        emit({ type: 'packet', from: 'backend', to: 'd1', label: 'INSERT / UPDATE', status: 'success' });
      }, 1000);

      if (agent.id === 'chief-of-staff') {
        setTimeout(() => {
          emit({ type: 'packet', from: 'backend', to: 'kv', label: 'Invalidate cache', status: 'success' });
        }, 1300);
      }

      setTimeout(() => {
        emit({ type: 'packet', from: 'backend', to: agent.id, label: fallback ? 'Done (fallback)' : 'Done', status: fallback ? 'error' : 'success' });
      }, 1200);

      showToast(`${agent.name} exécuté — ${fallback ? 'fallback local' : `via ${provider}`}`);

      const fresh = await api.getAgentRuns();
      setRunsData(fresh);
      return result;
    } catch (err) {
      setTimeout(() => {
        emit({ type: 'packet', from: 'backend', to: agent.id, label: 'Erreur', status: 'error' });
      }, 400);
      showToast(err instanceof Error ? err.message : `Erreur ${agent.name}`);
      return null;
    } finally {
      setLaunching(null);
      setActiveAgentIds(prev => prev.filter(id => id !== agent.id));
    }
  };

  /* -------- week simulation -------- */
  const runWeekSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimLog(WEEK_SCENARIO.map(s => ({ step: s, status: 'pending' })));
    setNetworkEvents([]);

    for (let i = 0; i < WEEK_SCENARIO.length; i++) {
      const step = WEEK_SCENARIO[i];
      const agent = AGENTS.find(a => a.id === step.agentId);
      if (!agent) continue;

      setSimLog(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'running' } : l));
      emit({ type: 'log', label: `▶ ${step.day} ${step.time} — ${agent.name} : ${step.label}` });

      try {
        await launchAgent(agent);
        setSimLog(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'done' } : l));
      } catch (e) {
        setSimLog(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'error' } : l));
      }

      /* Respiration entre agents */
      if (i < WEEK_SCENARIO.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setSimulating(false);
    showToast('Simulation semaine terminée');
  };

  /* -------- agent card status (direct, no useMemo with Date.now) -------- */
  const FIVE_MIN = 5 * 60 * 1000;
  const cardStatus: Record<string, 'running' | 'alive' | 'sleep'> = {};
  AGENTS.forEach(agent => {
    if (activeAgentIds.includes(agent.id)) { cardStatus[agent.id] = 'running'; return; }
    const lastRun = agentRuns
      .filter((r: any) => r.agent_name === agent.name)
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
    if (lastRun && lastRun.created_at) {
      const t = new Date(lastRun.created_at).getTime();
      if (!Number.isNaN(t) && (Date.now() - t) < FIVE_MIN) { cardStatus[agent.id] = 'alive'; return; }
    }
    cardStatus[agent.id] = 'sleep';
  });

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Agent Console" agentRuns={agentRuns} activeAgentIds={activeAgentIds} />

      <div className="p-5 space-y-5 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-copper" />
            <h2 className="text-lg font-bold text-ivory">Salle des agents</h2>
            <span className="text-xs text-subtle">— 7 agents IA spécialisés</span>
          </div>
          <button
            onClick={runWeekSimulation}
            disabled={simulating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-bold hover:bg-copper/25 transition disabled:opacity-50"
          >
            {simulating ? <Loader2 size={12} className="animate-spin" /> : <CalendarDays size={12} />}
            {simulating ? 'Simulation en cours…' : '▶ Simuler la semaine type'}
          </button>
        </div>

        {/* Simulation log */}
        {simLog.length > 0 && (
          <SectionCard title="Journal de simulation" subtitle="Scénario 7 jours — exécution séquentielle">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {simLog.map((l, i) => (
                <div key={i} className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-xs whitespace-nowrap min-w-[180px]
                  ${l.status === 'pending' ? 'bg-deep border-exec/10 text-muted' : ''}
                  ${l.status === 'running' ? 'bg-copper/10 border-copper/30 text-copper-light' : ''}
                  ${l.status === 'done' ? 'bg-emerald-900/10 border-emerald-800/20 text-emerald-400' : ''}
                  ${l.status === 'error' ? 'bg-red-900/10 border-red-800/20 text-red-400' : ''}
                `}>
                  <Radio size={10} className={
                    l.status === 'running' ? 'animate-pulse text-copper' :
                    l.status === 'done' ? 'text-emerald-400' :
                    l.status === 'error' ? 'text-red-400' : 'text-subtle'
                  } />
                  <span className="font-mono">{l.step.day} {l.step.time}</span>
                  <span className="font-semibold">{l.step.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Live network map */}
        <AgentNetwork events={networkEvents} activeAgentIds={activeAgentIds} />

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENTS.map(agent => {
            const status = cardStatus[agent.id];
            return (
              <div
                key={agent.id}
                className={`
                  rounded-xl border bg-carbon p-4 transition hover:border-copper/20
                  ${status === 'running' ? 'border-copper/40 shadow-[0_0_12px_rgba(212,163,115,0.15)]' : 'border-copper/15'}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`
                    p-2.5 rounded-lg transition-all duration-500
                    ${status === 'running' ? 'bg-copper/25 text-copper animate-pulse' : ''}
                    ${status === 'alive' ? 'bg-emerald-900/20 text-emerald-400' : ''}
                    ${status === 'sleep' ? 'bg-copper/15 text-copper' : ''}
                  `}>
                    {ICON_MAP[agent.icon] || <Bot size={20} />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`
                      w-2 h-2 rounded-full transition-all duration-500
                      ${status === 'running' ? 'bg-copper animate-pulse' : ''}
                      ${status === 'alive' ? 'bg-emerald-400' : ''}
                      ${status === 'sleep' ? 'bg-gray-600' : ''}
                    `} />
                    <StatusBadge status={status === 'running' ? 'active' : status === 'alive' ? 'done' : 'pending'} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-ivory mb-1">{agent.name}</h3>
                <p className="text-xs text-subtle line-clamp-2 mb-3">{agent.mission}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => launchAgent(agent)}
                    disabled={launching === agent.id || simulating}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-semibold hover:bg-copper/25 transition disabled:opacity-50"
                  >
                    {launching === agent.id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                    Lancer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Relations */}
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

        {/* History */}
        <SectionCard
          title="Historique des runs"
          headerRight={runsLoading ? <Loader2 size={14} className="animate-spin text-copper" /> : null}
        >
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Filter size={14} className="text-subtle" />
            <select
              value={runFilterAgent}
              onChange={(e) => { setRunFilterAgent(e.target.value); setRunLimit(10); }}
              className="bg-deep border border-exec/15 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-copper/30"
            >
              <option value="">Tous les agents</option>
              {AGENTS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <select
              value={runFilterStatus}
              onChange={(e) => { setRunFilterStatus(e.target.value); setRunLimit(10); }}
              className="bg-deep border border-exec/15 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-copper/30"
            >
              <option value="">Tous les statuts</option>
              <option value="done">Done</option>
              <option value="done-fallback">Done-fallback</option>
              <option value="failed">Failed</option>
            </select>
            {(runFilterAgent || runFilterStatus) && (
              <button
                onClick={() => { setRunFilterAgent(''); setRunFilterStatus(''); setRunLimit(10); }}
                className="flex items-center gap-1 text-xs text-copper hover:text-copper-light underline"
              >
                <X size={10} /> Réinitialiser
              </button>
            )}
            <span className="text-xs text-subtle ml-auto">
              Affichés : {displayedRuns.length} / {filteredRuns.length}
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-exec/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Résumé</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-exec/5">
                {displayedRuns.length === 0 && !runsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-subtle">Aucun run enregistré</td>
                  </tr>
                ) : (
                  displayedRuns.map((run: any) => (
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

          {hasMoreRuns && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setRunLimit((l) => l + 10)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-carbon border border-exec/15 text-muted text-sm hover:border-copper/30 hover:text-ivory transition"
              >
                <ChevronDown size={14} />
                Charger 10 de plus ({filteredRuns.length - runLimit} restants)
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

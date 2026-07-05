import { Crown, Radar, Lightbulb, PenTool, Palette, Target, Shield, Play, History, Bot } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import { useStore } from '@/lib/useStore';
import type { Agent } from '@/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Crown: <Crown size={20} />,
  Radar: <Radar size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  PenTool: <PenTool size={20} />,
  Palette: <Palette size={20} />,
  Target: <Target size={20} />,
  Shield: <Shield size={20} />,
};

export default function AgentConsole() {
  const { state, addAgentRun, showToast } = useStore();

  const launchAgent = (agent: Agent) => {
    addAgentRun({
      agentId: agent.id,
      agentName: agent.name,
      status: 'running',
      summary: `${agent.name} lancé — exécution en cours...`,
      startedAt: new Date().toISOString(),
    });
    showToast(`${agent.name} lancé`);
  };

  // Agent relations
  const relations = [
    { from: 'Chief of Staff', to: 'Content Strategist', label: 'dirige' },
    { from: 'Chief of Staff', to: 'Sales & Lead Ops', label: 'dirige' },
    { from: 'Content Strategist', to: 'Scriptwriter', label: 'alimente' },
    { from: 'Scriptwriter', to: 'Prompt Engineer', label: 'envoie vers' },
    { from: 'Sales & Lead Ops', to: 'Proof & Delivery', label: 'alimente' },
    { from: 'Market Intel', to: 'Content Strategist', label: 'informe' },
    { from: 'Market Intel', to: 'Sales & Lead Ops', label: 'informe' },
  ];

  return (
    <div>
      <Topbar title="Agent Console" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={20} className="text-copper" />
          <h2 className="text-lg font-bold text-ivory">Salle des agents</h2>
          <span className="text-xs text-subtle">— 7 agents IA spécialisés</span>
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {state.agents.map(agent => (
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
              {agent.lastSummary && (
                <div className="p-2 rounded bg-deep border border-exec/5 mb-3">
                  <p className="text-[10px] text-subtle">Dernier run</p>
                  <p className="text-xs text-muted line-clamp-2">{agent.lastSummary}</p>
                </div>
              )}
              <div className="flex gap-1.5">
                <button onClick={() => launchAgent(agent)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-copper/15 border border-copper/30 text-copper-light text-xs font-semibold hover:bg-copper/25 transition">
                  <Play size={10} /> Lancer
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-exec/15 text-subtle text-xs hover:border-copper/30 hover:text-muted transition">
                  <History size={10} /> Historique
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agent network */}
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

        {/* Run history */}
        <SectionCard title="Historique des runs">
          <div className="rounded-xl border border-exec/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep border-b border-exec/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Résumé</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-exec/5">
                {state.agentRuns.map(run => (
                  <tr key={run.id} className="hover:bg-carbon/40 transition">
                    <td className="px-4 py-3 text-ivory font-medium">{run.agentName}</td>
                    <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-3 text-muted text-xs max-w-xs truncate">{run.summary}</td>
                    <td className="px-4 py-3 text-subtle text-xs">{new Date(run.startedAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

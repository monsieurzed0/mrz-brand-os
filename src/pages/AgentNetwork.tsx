import { useState, useEffect, useRef, type ElementType } from 'react';
import {
  Crown, Radar, Lightbulb, PenTool, Palette, Target, Shield,
  Server, Globe, Database, HardDrive, Zap, ArrowRight
} from 'lucide-react';
import { AGENTS, type AgentId } from '@/lib/agentConstants';

export interface NetworkEvent {
  id: string;
  type: 'packet' | 'pulse' | 'log';
  from?: string;
  to?: string;
  node?: string;
  label?: string;
  status?: 'running' | 'success' | 'error';
  timestamp?: number;
}

interface Packet {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label: string;
  status: 'running' | 'success' | 'error';
  createdAt: number;
  duration: number;
}

const NODES: Array<{
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'agent' | 'infra';
  icon: ElementType;
}> = [
  { id: 'chief-of-staff', name: 'Chief of Staff', x: 5, y: 12, type: 'agent', icon: Crown },
  { id: 'market-intel', name: 'Market Intel', x: 5, y: 30, type: 'agent', icon: Radar },
  { id: 'content-strategist', name: 'Content Strategist', x: 5, y: 48, type: 'agent', icon: Lightbulb },
  { id: 'scriptwriter', name: 'Scriptwriter', x: 5, y: 66, type: 'agent', icon: PenTool },
  { id: 'prompt-engineer', name: 'Prompt Engineer', x: 22, y: 20, type: 'agent', icon: Palette },
  { id: 'sales-lead-ops', name: 'Sales & Lead Ops', x: 22, y: 45, type: 'agent', icon: Target },
  { id: 'proof-delivery', name: 'Proof & Delivery', x: 22, y: 70, type: 'agent', icon: Shield },
  { id: 'backend', name: 'Backend API', x: 50, y: 45, type: 'infra', icon: Server },
  { id: 'internet', name: 'Internet LLM', x: 80, y: 20, type: 'infra', icon: Globe },
  { id: 'd1', name: 'D1 Database', x: 80, y: 50, type: 'infra', icon: Database },
  { id: 'kv', name: 'KV Cache', x: 80, y: 75, type: 'infra', icon: HardDrive },
];

const CONNECTIONS: Array<[string, string]> = [
  ['chief-of-staff', 'backend'],
  ['market-intel', 'backend'],
  ['content-strategist', 'backend'],
  ['scriptwriter', 'backend'],
  ['prompt-engineer', 'backend'],
  ['sales-lead-ops', 'backend'],
  ['proof-delivery', 'backend'],
  ['backend', 'internet'],
  ['backend', 'd1'],
  ['backend', 'kv'],
];

function TravellingPacket({ startX, startY, endX, endY, duration, label, status }: Packet) {
  const [pos, setPos] = useState({ x: startX, y: startY });

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPos({ x: endX, y: endY });
    });
    return () => cancelAnimationFrame(raf);
  }, [endX, endY]);

  const color = status === 'error' ? '#ef4444' : '#d4a373';

  return (
    <div
      className="absolute z-30"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transition: `left ${duration}ms linear, top ${duration}ms linear`,
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-ivory whitespace-nowrap bg-dark/90 px-1 rounded border border-exec/10 backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

interface AgentNetworkProps {
  events: NetworkEvent[];
  activeAgentIds: string[];
}

export default function AgentNetwork({ events, activeAgentIds }: AgentNetworkProps) {
  const [packets, setPackets] = useState<Packet[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!events.length) return;
    const last = events[events.length - 1];
    if (last.type !== 'packet' || !last.from || !last.to) return;

    const fromNode = NODES.find(n => n.id === last.from);
    const toNode = NODES.find(n => n.id === last.to);
    if (!fromNode || !toNode) return;

    const newPacket: Packet = {
      id: last.id,
      startX: fromNode.x,
      startY: fromNode.y,
      endX: toNode.x,
      endY: toNode.y,
      label: last.label || '',
      status: last.status || 'running',
      createdAt: Date.now(),
      duration: 800,
    };

    setPackets(p => [...p, newPacket]);
    const t = window.setTimeout(() => {
      setPackets(p => p.filter(x => x.id !== newPacket.id));
    }, newPacket.duration + 150);
    timeoutsRef.current.push(t);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [events]);

  const activeNodes = new Set<string>();
  events.forEach(e => {
    if (e.type === 'pulse' && e.node) activeNodes.add(e.node);
    if (e.type === 'packet') {
      if (e.from) activeNodes.add(e.from);
      if (e.to) activeNodes.add(e.to);
    }
  });
  activeAgentIds.forEach(id => activeNodes.add(id));
  activeAgentIds.forEach(() => activeNodes.add('backend'));

  const logs = events
    .filter(e => e.type === 'log' || e.type === 'packet')
    .slice(-5)
    .reverse();

  return (
    <div className="relative w-full h-[420px] bg-carbon rounded-xl border border-exec/10 overflow-hidden select-none">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {CONNECTIONS.map(([a, b]) => {
          const na = NODES.find(n => n.id === a);
          const nb = NODES.find(n => n.id === b);
          if (!na || !nb) return null;
          const isActive = activeNodes.has(a) && activeNodes.has(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={isActive ? 'rgba(212,163,115,0.35)' : 'rgba(51,65,85,0.25)'}
              strokeWidth={isActive ? 0.6 : 0.3}
              strokeDasharray={isActive ? '0' : '1 1'}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {NODES.map(node => {
        const isActive = activeNodes.has(node.id);
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className={`
                p-2 rounded-lg border transition-all duration-300
                ${isActive
                  ? 'bg-copper/20 border-copper/50 shadow-[0_0_14px_rgba(212,163,115,0.25)] scale-110'
                  : 'bg-deep border-exec/10 hover:border-exec/20'
                }
              `}
            >
              <Icon size={node.type === 'infra' ? 16 : 14} className={isActive ? 'text-copper' : 'text-subtle'} />
            </div>
            <span className="text-[9px] font-medium whitespace-nowrap leading-none">
              <span className={isActive ? 'text-copper' : 'text-muted'}>{node.name}</span>
            </span>
          </div>
        );
      })}

      {packets.map(p => (
        <TravellingPacket key={p.id} {...p} />
      ))}

      <div className="absolute bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-sm border-t border-exec/10 p-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={10} className="text-copper" />
          <span className="text-[10px] font-bold text-copper uppercase tracking-wider">Agent Room Live</span>
          <span className="text-[10px] text-muted ml-auto">{events.length} événements</span>
        </div>
        <div className="space-y-0.5">
          {logs.length === 0 && (
            <div className="text-[10px] text-subtle italic">En attente d’exécution…</div>
          )}
          {logs.map((log, i) => (
            <div key={log.id + i} className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-subtle">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour12: false }) : '--:--:--'}
              </span>
              <ArrowRight size={8} className={log.status === 'error' ? 'text-red-400' : 'text-copper'} />
              <span className={log.status === 'error' ? 'text-red-400' : 'text-muted'}>
                {log.label}
                {log.from && log.to ? `  ${log.from} → ${log.to}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

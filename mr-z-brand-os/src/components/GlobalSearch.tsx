import { useState, useRef, useEffect } from 'react';
import { Search, Lightbulb, FileText, Users, Briefcase, Shield, Bot, BookOpen, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/useStore';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  icon: React.ReactNode;
  route: string;
}

const moduleColors: Record<string, string> = {
  'Contenu': 'bg-copper/15 text-copper',
  'Script': 'bg-copper-light/15 text-copper-light',
  'Lead': 'bg-exec/15 text-exec',
  'Projet': 'bg-copper/20 text-copper-light',
  'Preuve': 'bg-subtle/15 text-muted',
  'Agent': 'bg-copper/10 text-copper',
  'Mémoire': 'bg-exec/10 text-exec',
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { state } = useStore();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const q = query.toLowerCase();
    
    // Search Content Ideas
    state.contentIdeas
      .filter(i => i.subject.toLowerCase().includes(q) || i.angle.toLowerCase().includes(q) || i.product.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(i => {
        results.push({ 
          id: i.id, 
          title: i.subject, 
          subtitle: `${i.product} · ${i.platform}`, 
          module: 'Contenu', 
          icon: <Lightbulb size={14} />, 
          route: '/content' 
        });
      });
    
    // Search Scripts
    state.scripts
      .filter(s => s.subject.toLowerCase().includes(q) || s.hook.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(s => {
        results.push({ 
          id: s.id, 
          title: s.subject, 
          subtitle: s.hook.slice(0, 50) + '...', 
          module: 'Script', 
          icon: <FileText size={14} />, 
          route: '/scripts' 
        });
      });
    
    // Search Leads
    state.leads
      .filter(l => l.name.toLowerCase().includes(q) || l.need.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(l => {
        results.push({ 
          id: l.id, 
          title: l.name, 
          subtitle: l.need, 
          module: 'Lead', 
          icon: <Users size={14} />, 
          route: '/leads' 
        });
      });
    
    // Search Projects
    state.projects
      .filter(p => p.client.toLowerCase().includes(q) || p.offer.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(p => {
        results.push({ 
          id: p.id, 
          title: p.client, 
          subtitle: p.offer, 
          module: 'Projet', 
          icon: <Briefcase size={14} />, 
          route: '/projects' 
        });
      });
    
    // Search Proofs
    state.proofs
      .filter(p => p.content.toLowerCase().includes(q) || p.projectLinked.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(p => {
        results.push({ 
          id: p.id, 
          title: p.projectLinked, 
          subtitle: p.content.slice(0, 60) + '...', 
          module: 'Preuve', 
          icon: <Shield size={14} />, 
          route: '/proof-bank' 
        });
      });
    
    // Search Agent Runs
    state.agentRuns
      .filter(a => a.agentName.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(a => {
        results.push({ 
          id: a.id, 
          title: a.agentName, 
          subtitle: a.summary.slice(0, 50) + '...', 
          module: 'Agent', 
          icon: <Bot size={14} />, 
          route: '/agents' 
        });
      });
    
    // Search Brand Memory
    state.brandMemory
      .filter(b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(b => {
        results.push({ 
          id: b.id, 
          title: b.title, 
          subtitle: b.content.slice(0, 60) + '...', 
          module: 'Mémoire', 
          icon: <BookOpen size={14} />, 
          route: '/brand-memory' 
        });
      });
  }

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    setQuery('');
    setFocused(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher une idée, un script, un lead, un projet..."
          className="w-full bg-carbon border border-exec/15 rounded-xl pl-10 pr-20 py-2.5 text-sm text-ivory placeholder:text-subtle/50 focus:outline-none focus:border-copper/30 focus:bg-carbon/80 transition"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button 
              onClick={() => { setQuery(''); setFocused(false); }} 
              className="p-1 hover:bg-exec/10 rounded transition"
            >
              <X size={14} className="text-subtle hover:text-ivory" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-deep text-[10px] text-subtle border border-exec/10">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>
      
      {focused && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-carbon border border-exec/15 rounded-xl shadow-premium max-h-[400px] overflow-hidden z-50 animate-fade-in">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-subtle/30 mx-auto mb-2" />
              <p className="text-sm text-subtle">Aucun résultat pour "{query}"</p>
              <p className="text-xs text-subtle/60 mt-1">Essayez d'autres termes</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-exec/10">
                <p className="text-[10px] text-subtle font-semibold uppercase tracking-wider">
                  {results.length} résultat{results.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="overflow-y-auto max-h-[340px]">
                {results.map(r => (
                  <button
                    key={`${r.module}-${r.id}`}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-deep/80 transition text-left border-b border-exec/5 last:border-0 group"
                  >
                    <div className={`p-2 rounded-lg ${moduleColors[r.module] || 'bg-exec/10 text-exec'}`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ivory truncate group-hover:text-copper-light transition">
                        {r.title}
                      </p>
                      <p className="text-xs text-subtle truncate">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${moduleColors[r.module] || 'bg-exec/10 text-exec'}`}>
                        {r.module}
                      </span>
                      <ArrowRight size={12} className="text-subtle opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

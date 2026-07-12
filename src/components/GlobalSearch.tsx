import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Search,
  Lightbulb,
  FileText,
  Users,
  Briefcase,
  Shield,
  Bot,
  BookOpen,
  X,
  ArrowRight,
  Loader2,
  Receipt,
  Wallet,
  FileBarChart,
  Tag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

type RemoteSearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  status?: string;
  module: string;
  route?: string;
};

type ViewSearchResult = RemoteSearchResult & {
  icon: ReactNode;
  route: string;
};

const moduleColors: Record<string, string> = {
  'Content Lab': 'bg-copper/15 text-copper',
  'Script Room': 'bg-copper-light/15 text-copper-light',
  'Lead Desk': 'bg-exec/15 text-exec',
  'Delivery Board': 'bg-copper/20 text-copper-light',
  'Proof Bank': 'bg-subtle/15 text-muted',
  'Brand Memory': 'bg-exec/10 text-exec',
  'Catalogue': 'bg-copper/15 text-copper-light',
  'Market Intel': 'bg-copper/10 text-copper',
  'Finance Clients': 'bg-emerald-900/20 text-emerald-400',
  'Finance Devis': 'bg-copper/10 text-copper-light',
  'Finance Factures': 'bg-copper/15 text-copper',
  'Finance Dépenses': 'bg-red-900/20 text-red-400',
  'Finance Paiements': 'bg-emerald-900/20 text-emerald-400',
  'Finance Services': 'bg-exec/10 text-exec',
  'Finance Rapports': 'bg-subtle/15 text-muted',
};

function routeFor(result: RemoteSearchResult) {
  if (result.route) return result.route;
  const type = String(result.type || '').toLowerCase();
  const module = String(result.module || '').toLowerCase();

  if (type === 'content' || module.includes('content')) return '/content';
  if (type === 'script' || module.includes('script')) return '/scripts';
  if (type === 'lead' || module.includes('lead')) return '/leads';
  if (type === 'project' || module.includes('delivery')) return '/projects';
  if (type === 'proof' || module.includes('proof')) return '/proof-bank';
  if (type === 'memory' || module.includes('memory')) return '/brand-memory';
  if (type === 'catalog' || module.includes('catalogue')) return '/brand-catalog';
  if (type === 'intel' || module.includes('intel')) return '/agents';

  if (type === 'client') return '/finance/clients';
  if (type === 'quote') return '/finance/quotes';
  if (type === 'invoice') return '/finance/invoices';
  if (type === 'expense') return '/finance/expenses';
  if (type === 'payment') return '/finance/invoices';
  if (type === 'service') return '/finance/settings';
  if (type === 'journal') return '/finance/reports';

  return '/dashboard';
}

function iconFor(result: RemoteSearchResult) {
  const type = String(result.type || '').toLowerCase();
  if (type === 'content') return <Lightbulb size={14} />;
  if (type === 'script') return <FileText size={14} />;
  if (type === 'lead') return <Users size={14} />;
  if (type === 'project') return <Briefcase size={14} />;
  if (type === 'proof') return <Shield size={14} />;
  if (type === 'memory') return <BookOpen size={14} />;
  if (type === 'catalog') return <Tag size={14} />;
  if (type === 'intel') return <Bot size={14} />;
  if (type === 'client') return <Users size={14} />;
  if (type === 'quote') return <FileText size={14} />;
  if (type === 'invoice') return <Receipt size={14} />;
  if (type === 'expense') return <Wallet size={14} />;
  if (type === 'payment') return <Wallet size={14} />;
  if (type === 'service') return <Tag size={14} />;
  if (type === 'journal') return <FileBarChart size={14} />;
  return <Search size={14} />;
}

function normalizeResult(result: RemoteSearchResult): ViewSearchResult {
  return {
    ...result,
    title: result.title || 'Résultat sans titre',
    subtitle: result.subtitle || result.status || result.module || result.type || '',
    route: routeFor(result),
    icon: iconFor(result),
  };
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ViewSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setFocused(true);
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

  useEffect(() => {
    const currentQuery = query.trim();
    if (currentQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await api.search(currentQuery)) as RemoteSearchResult[];
        if (!cancelled) {
          setResults((Array.isArray(data) ? data : []).map(normalizeResult).slice(0, 30));
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err.message : 'Erreur recherche');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (result: ViewSearchResult) => {
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher : contenu, lead, catalogue, client, devis, facture..."
          className="w-full bg-carbon border border-exec/15 rounded-xl pl-10 pr-20 py-2.5 text-sm text-ivory placeholder:text-subtle/50 focus:outline-none focus:border-copper/30 focus:bg-carbon/80 transition"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 size={14} className="text-copper animate-spin" />}
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); setFocused(false); }}
              className="p-1 hover:bg-exec/10 rounded transition"
              title="Effacer"
            >
              <X size={14} className="text-subtle hover:text-ivory" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-deep text-[10px] text-subtle border border-exec/10">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>

      {focused && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-carbon border border-exec/15 rounded-xl shadow-premium max-h-[430px] overflow-hidden z-50 animate-fade-in">
          {error ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-red-400/50 mx-auto mb-2" />
              <p className="text-sm text-red-300">Recherche indisponible</p>
              <p className="text-xs text-subtle/70 mt-1">{error}</p>
            </div>
          ) : !loading && results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-subtle/30 mx-auto mb-2" />
              <p className="text-sm text-subtle">Aucun résultat pour “{query}”</p>
              <p className="text-xs text-subtle/60 mt-1">Catalogue et Finance sont inclus dans la recherche globale.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-exec/10 flex items-center justify-between">
                <p className="text-[10px] text-subtle font-semibold uppercase tracking-wider">
                  {loading ? 'Recherche…' : `${results.length} résultat${results.length > 1 ? 's' : ''}`}
                </p>
                <p className="text-[10px] text-subtle/60">Entrée pour ouvrir</p>
              </div>
              <div className="overflow-y-auto max-h-[360px]">
                {results.map((r) => (
                  <button
                    key={`${r.module}-${r.type}-${r.id}`}
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

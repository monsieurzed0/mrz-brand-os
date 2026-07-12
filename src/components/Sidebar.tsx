import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Lightbulb,
  FileText,
  Zap,
  Palette,
  Users,
  Briefcase,
  Shield,
  Bot,
  BookOpen,
  Globe,
  RotateCcw,
  FileBarChart,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { ASSETS } from '@/lib/constants';
import { useStore } from '@/lib/useStore';

const navItems = [
  {
    label: 'Direction',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/weekly', icon: Calendar, label: 'Revue Hebdo' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { to: '/content', icon: Lightbulb, label: 'Content Lab' },
      { to: '/scripts', icon: FileText, label: 'Script Room' },
      { to: '/content-engine', icon: Zap, label: 'Content Engine' },
      { to: '/visual-lab', icon: Palette, label: 'Visual Lab' },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/leads', icon: Users, label: 'Lead Desk' },
      { to: '/projects', icon: Briefcase, label: 'Projets' },
      { to: '/proof-bank', icon: Shield, label: 'Proof Bank' },
      { to: '/finance', icon: FileBarChart, label: 'Finance' },
    ],
  },
  {
    label: 'Système',
    items: [
      { to: '/agents', icon: Bot, label: 'Agents' },
      { to: '/brand-memory', icon: BookOpen, label: 'Brand Memory' },
      { to: '/brand-catalog', icon: FileText, label: 'Catalogue' },
      { to: '/media-center', icon: Globe, label: 'Media Center' },
    ],
  },
];

type SidebarProps = {
  collapsed?: boolean;
  hidden?: boolean;
  onToggleCollapse?: () => void;
  onToggleHidden?: () => void;
};

export default function Sidebar({
  collapsed = false,
  hidden = false,
  onToggleCollapse,
  onToggleHidden,
}: SidebarProps) {
  const location = useLocation();
  const { resetStore, state } = useStore();
  const unreadCount = (state.notifications || []).filter((n: any) => n.status === 'unread').length;

  if (hidden) {
    return (
      <button
        onClick={onToggleHidden}
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-copper/25 bg-deep/95 px-3 py-2 text-xs font-bold text-copper-light shadow-premium backdrop-blur hover:bg-carbon transition"
        title="Afficher la sidebar"
      >
        <Menu size={15} />
        Menu
      </button>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 ${collapsed ? 'w-20' : 'w-60'} bg-deep border-r border-exec/10 flex flex-col z-40 transition-all duration-300`}
    >
      {/* Logo + controls */}
      <div className={`${collapsed ? 'px-3 py-4' : 'px-5 py-5'} border-b border-exec/10`}>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center justify-between gap-3'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
            <img src={ASSETS.logo} alt="Mr Z Brand" className="h-9 w-auto shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-ivory tracking-wider truncate">MR Z BRAND OS</p>
                <p className="text-[9px] text-copper font-semibold tracking-[0.2em] uppercase truncate">Command Center</p>
              </div>
            )}
          </div>

          <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg border border-exec/10 bg-carbon/50 text-subtle hover:text-copper-light hover:border-copper/25 transition"
              title={collapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button
              onClick={onToggleHidden}
              className="p-1.5 rounded-lg border border-exec/10 bg-carbon/50 text-subtle hover:text-red-300 hover:border-red-500/20 transition"
              title="Masquer la sidebar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((section) => (
          <div key={section.label} className={collapsed ? 'mb-4' : 'mb-5'}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-8 bg-exec/10" title={section.label} />
            ) : (
              <p className="px-3 mb-2 text-[9px] font-bold text-subtle/50 uppercase tracking-[0.2em]">
                {section.label}
              </p>
            )}

            {section.items.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'));
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${
                    isActive
                      ? 'bg-copper/15 text-copper-light border border-copper/25'
                      : 'text-muted hover:text-ivory hover:bg-carbon/60 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-copper shrink-0' : 'shrink-0'} />
                  {!collapsed && <span>{item.label}</span>}
                  {item.to === '/dashboard' && unreadCount > 0 && (
                    <span className={collapsed
                      ? 'absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-copper/30 text-copper-light text-[9px] rounded-full flex items-center justify-center font-bold'
                      : 'ml-auto text-[10px] bg-copper/20 text-copper-light px-1.5 py-0.5 rounded-full font-bold'}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`${collapsed ? 'px-2 py-3' : 'px-4 py-4'} border-t border-exec/10 bg-dark/30`}>
        <button
          onClick={resetStore}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} text-[10px] text-subtle hover:text-copper transition w-full px-3 py-2 rounded-lg hover:bg-carbon/50 font-semibold`}
          title="Réinitialiser les données"
        >
          <RotateCcw size={11} />
          {!collapsed && 'Réinitialiser les données'}
        </button>
        {!collapsed && (
          <div className="flex items-center justify-between mt-3 px-3">
            <p className="text-[9px] text-subtle/40 font-medium">v2.1</p>
            <p className="text-[9px] text-subtle/40 font-medium">Live</p>
          </div>
        )}
      </div>
    </aside>
  );
}

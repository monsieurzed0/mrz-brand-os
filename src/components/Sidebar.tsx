import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Lightbulb, FileText, Zap, Palette, Users, Briefcase, Shield, Bot, BookOpen, Globe, RotateCcw, FileBarChart } from 'lucide-react';
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
      { to: '/media-center', icon: Globe, label: 'Media Center' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { resetStore, state } = useStore();
  const unreadCount = state.notifications.filter((n: any) => n.status === 'unread').length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-deep border-r border-exec/10 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-exec/10">
        <div className="flex items-center gap-3">
          <img src={ASSETS.logo} alt="Mr Z Brand" className="h-9 w-auto" />
          <div>
            <p className="text-xs font-bold text-ivory tracking-wider">MR Z BRAND OS</p>
            <p className="text-[9px] text-copper font-semibold tracking-[0.2em] uppercase">Command Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-3 mb-2 text-[9px] font-bold text-subtle/50 uppercase tracking-[0.2em]">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/')) || location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${
                    isActive
                      ? 'bg-copper/15 text-copper-light border border-copper/25'
                      : 'text-muted hover:text-ivory hover:bg-carbon/60 border border-transparent'
                  }`}
                >
                  <item.icon size={16} className={isActive ? 'text-copper' : ''} />
                  <span>{item.label}</span>
                  {item.to === '/dashboard' && unreadCount > 0 && (
                    <span className="ml-auto text-[10px] bg-copper/20 text-copper-light px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-exec/10 bg-dark/30">
        <button
          onClick={resetStore}
          className="flex items-center gap-2 text-[10px] text-subtle hover:text-copper transition w-full px-3 py-2 rounded-lg hover:bg-carbon/50 font-semibold"
        >
          <RotateCcw size={11} />
          Réinitialiser les données
        </button>
        <div className="flex items-center justify-between mt-3 px-3">
          <p className="text-[9px] text-subtle/40 font-medium">v2.0</p>
          <p className="text-[9px] text-subtle/40 font-medium">Live</p>
        </div>
      </div>
    </aside>
  );
}

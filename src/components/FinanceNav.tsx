import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Receipt, Users, BarChart3, Settings, Wallet } from 'lucide-react';

const LINKS = [
  { path: '/finance', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/finance/quotes', label: 'Devis', icon: FileText },
  { path: '/finance/invoices', label: 'Factures', icon: Receipt },
  { path: '/finance/clients', label: 'Clients', icon: Users },
  { path: '/finance/expenses', label: 'Dépenses', icon: Wallet },
  { path: '/finance/reports', label: 'Rapports', icon: BarChart3 },
  { path: '/finance/settings', label: 'Paramètres', icon: Settings },
];

export default function FinanceNav(_props: { activePath?: string } = {}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-exec/10 mb-4">
      {LINKS.map((l) => {
        const Icon = l.icon;

        return (
          <NavLink
            key={l.path}
            to={l.path}
            end={l.path === '/finance'}
            className={({ isActive }) => `
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border
              ${
                isActive
                  ? 'bg-copper/15 text-copper-light border-copper/30'
                  : 'text-muted hover:text-ivory hover:bg-carbon border-transparent'
              }
            `}
          >
            <Icon size={13} />
            {l.label}
          </NavLink>
        );
      })}
    </div>
  );
}

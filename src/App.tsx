import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bot, Brain, Lightbulb, PenTool, Palette, Target, Shield,
  FileText, Receipt, Users, Wallet, BarChart3, Settings, Crown, Radio, FlaskConical
} from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import AgentConsole from '@/pages/AgentConsole';
import BrandMemory from '@/pages/BrandMemory';
import ContentLab from '@/pages/ContentLab';
import ContentEngine from '@/pages/ContentEngine';
import LeadDesk from '@/pages/LeadDesk';
import VisualLab from '@/pages/VisualLab';
import Weekly from '@/pages/Weekly';
import FinanceDashboard from '@/pages/FinanceDashboard';
import FinanceQuotes from '@/pages/FinanceQuotes';
import FinanceInvoices from '@/pages/FinanceInvoices';
import FinanceReports from '@/pages/FinanceReports';
import FinanceSettings from '@/pages/FinanceSettings';
import FinanceClients from '@/pages/FinanceClients';
import FinanceExpenses from '@/pages/FinanceExpenses';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/memory', label: 'Mémoire', icon: Brain },
  { path: '/content', label: 'Content Lab', icon: Lightbulb },
  { path: '/engine', label: 'Content Engine', icon: FlaskConical },
  { path: '/scripts', label: 'Scripts', icon: PenTool },
  { path: '/visual', label: 'Visual Lab', icon: Palette },
  { path: '/leads', label: 'Leads', icon: Target },
  { path: '/weekly', label: 'Weekly', icon: Crown },
  { path: '/finance', label: 'Finance', icon: FileText },
];

function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="w-60 min-h-screen bg-carbon border-r border-exec/10 flex flex-col">
      <div className="p-5 border-b border-exec/10">
        <div className="flex items-center gap-2">
          <Crown size={22} className="text-copper" />
          <span className="text-sm font-bold text-ivory tracking-wide">Mr Z Brand OS</span>
        </div>
        <p className="text-[10px] text-subtle mt-1">SIGNAL™ • PROSKILLS FR</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = loc.pathname === n.path || (n.path !== '/' && loc.pathname.startsWith(n.path));
          return (
            <Link
              key={n.path}
              to={n.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-copper/15 text-copper-light border border-copper/20'
                  : 'text-muted hover:text-ivory hover:bg-carbon/80 border border-transparent'
              }`}
            >
              <Icon size={15} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-exec/10 text-[10px] text-subtle">
        © 2026 Mr Z Brand
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-deep text-ivory">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentConsole />} />
            <Route path="/memory" element={<BrandMemory />} />
            <Route path="/content" element={<ContentLab />} />
            <Route path="/engine" element={<ContentEngine />} />
            <Route path="/scripts" element={<Weekly />} />
            <Route path="/visual" element={<VisualLab />} />
            <Route path="/leads" element={<LeadDesk />} />
            <Route path="/weekly" element={<Weekly />} />
            {/* Finance & Administration */}
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/finance/quotes" element={<FinanceQuotes />} />
            <Route path="/finance/invoices" element={<FinanceInvoices />} />
            <Route path="/finance/clients" element={<FinanceClients />} />
            <Route path="/finance/expenses" element={<FinanceExpenses />} />
            <Route path="/finance/reports" element={<FinanceReports />} />
            <Route path="/finance/settings" element={<FinanceSettings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

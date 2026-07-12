import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/lib/useStore';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';

import Dashboard from '@/pages/Dashboard';
import Weekly from '@/pages/Weekly';
import ContentLab from '@/pages/ContentLab';
import ScriptRoom from '@/pages/ScriptRoom';
import ContentEngine from '@/pages/ContentEngine';
import VisualLab from '@/pages/VisualLab';
import LeadDesk from '@/pages/LeadDesk';
import Projects from '@/pages/Projects';
import ProofBank from '@/pages/ProofBank';
import AgentConsole from '@/pages/AgentConsole';
import BrandMemory from '@/pages/BrandMemory';
import BrandCatalogue from '@/pages/BrandCatalogue';
import MediaCenter from '@/pages/MediaCenter';

// ── Finance & Administration ──
import FinanceDashboard from '@/pages/FinanceDashboard';
import FinanceQuotes from '@/pages/FinanceQuotes';
import FinanceInvoices from '@/pages/FinanceInvoices';
import FinanceReports from '@/pages/FinanceReports';
import FinanceSettings from '@/pages/FinanceSettings';
import FinanceClients from '@/pages/FinanceClients';
import FinanceExpenses from '@/pages/FinanceExpenses';

function Layout() {
  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/content" element={<ContentLab />} />
          <Route path="/scripts" element={<ScriptRoom />} />
          <Route path="/content-engine" element={<ContentEngine />} />
          <Route path="/visual-lab" element={<VisualLab />} />
          <Route path="/leads" element={<LeadDesk />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/proof-bank" element={<ProofBank />} />
          <Route path="/agents" element={<AgentConsole />} />
          <Route path="/brand-memory" element={<BrandMemory />} />
          <Route path="/brand-catalog" element={<BrandCatalogue />} />
          <Route path="/media-center" element={<MediaCenter />} />

          {/* Finance & Administration */}
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/quotes" element={<FinanceQuotes />} />
          <Route path="/finance/invoices" element={<FinanceInvoices />} />
          <Route path="/finance/clients" element={<FinanceClients />} />
          <Route path="/finance/expenses" element={<FinanceExpenses />} />
          <Route path="/finance/reports" element={<FinanceReports />} />
          <Route path="/finance/settings" element={<FinanceSettings />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout />
      </HashRouter>
    </StoreProvider>
  );
}

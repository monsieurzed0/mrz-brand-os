import { useMemo, useState } from 'react';
import { Bell, Activity, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SystemClock from './SystemClock';
import GlobalSearch from './GlobalSearch';
import NotificationDrawer from './NotificationDrawer';

import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

interface Props {
  title: string;
}

export default function Topbar({ title }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notificationsData } = useApiQuery(api.getNotifications, []);
  const { data: agentRunsData } = useApiQuery(api.getAgentRuns, []);

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const agentRuns = Array.isArray(agentRunsData) ? agentRunsData : [];

  const unreadCount = useMemo(() => {
    return notifications.filter((n: any) => n.status === 'unread').length;
  }, [notifications]);

  const runningAgents = useMemo(() => {
    return agentRuns.filter((run: any) => run.run_status === 'running' || run.run_status === 'done').length;
  }, [agentRuns]);

  const totalAgents = 7;
  const systemHealthy = runningAgents >= 3;

  return (
    <>
      <header className="sticky top-0 z-30 bg-dark/90 backdrop-blur-xl border-b border-exec/10">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-ivory tracking-wide">{title}</h1>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-lg mx-8">
            <GlobalSearch />
          </div>

          {/* Right: System rail */}
          <div className="flex items-center gap-3">
            {/* System status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-carbon/60 border border-exec/10">
              <div
                className={`w-2 h-2 rounded-full ${
                  systemHealthy ? 'bg-copper animate-pulse-copper' : 'bg-subtle'
                }`}
              />
              <Activity
                size={13}
                className={systemHealthy ? 'text-copper' : 'text-subtle'}
              />
              <span className="text-xs font-semibold text-muted">
                {runningAgents}/{totalAgents} agents
              </span>
            </div>

            <div className="w-px h-6 bg-exec/15" />

            {/* Clock */}
            <SystemClock />

            <div className="w-px h-6 bg-exec/15" />

            {/* Media Center quick access */}
            <button
              onClick={() => navigate('/media-center')}
              className="p-2 rounded-lg hover:bg-carbon/60 transition text-subtle hover:text-copper"
              title="Media Center"
            >
              <Globe size={17} />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-lg hover:bg-carbon/60 transition group"
            >
              <Bell
                size={17}
                className={
                  unreadCount > 0
                    ? 'text-copper-light'
                    : 'text-subtle group-hover:text-muted'
                }
              />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-copper text-dark text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

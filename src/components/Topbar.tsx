import { useEffect, useMemo, useState } from 'react';
import { Bell, Activity, Globe, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemClock from './SystemClock';
import GlobalSearch from './GlobalSearch';
import NotificationDrawer from './NotificationDrawer';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { AGENTS } from '@/lib/agentConstants';

interface Props {
  title: string;
  agentRuns?: any[];
  activeAgentIds?: string[];
}

export default function Topbar({ title, agentRuns: propAgentRuns, activeAgentIds: propActiveAgentIds }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
    setData: setNotificationsData,
    refetch: refetchNotifications,
  } = useApiQuery(api.getNotifications, []);

  const { data: agentRunsData } = useApiQuery(api.getAgentRuns, []);

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const fetchedAgentRuns = Array.isArray(agentRunsData) ? agentRunsData : [];

  const agentRuns = propAgentRuns && propAgentRuns.length > 0 ? propAgentRuns : fetchedAgentRuns;
  const activeAgentIds = propActiveAgentIds || [];

  const unreadCount = useMemo(() => {
    return notifications.filter((n: any) => n.status === 'unread').length;
  }, [notifications]);

  const FIVE_MIN = 5 * 60 * 1000;

  const agentStatus = useMemo(() => {
    const now = Date.now();
    return AGENTS.map(agent => {
      if (activeAgentIds.includes(agent.id)) return 'running';
      const lastRun = agentRuns
        .filter((r: any) => r.agent_name === agent.name)
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
      if (lastRun && lastRun.created_at) {
        const lastTime = new Date(lastRun.created_at).getTime();
        if (!Number.isNaN(lastTime) && (now - lastTime) < FIVE_MIN) {
          if (lastRun.run_status === 'failed') return 'failed';
          return 'alive';
        }
      }
      return 'sleep';
    });
  }, [agentRuns, activeAgentIds]);

  const aliveCount = agentStatus.filter(s => s === 'alive' || s === 'running').length;
  const systemHealthy = aliveCount >= 3;

  useEffect(() => {
    function handleRefresh() {
      refetchNotifications();
    }
    window.addEventListener('mrz-refresh-notifications', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    const intervalId = setInterval(() => {
      refetchNotifications();
    }, 30000);
    return () => {
      window.removeEventListener('mrz-refresh-notifications', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      clearInterval(intervalId);
    };
  }, [refetchNotifications]);

  async function markOne(id: string) {
    try {
      await api.markNotificationRead(id);
      setNotificationsData((prev: any) =>
        (prev || []).map((item: any) =>
          item.id === id
            ? { ...item, status: 'read', read_at: new Date().toISOString() }
            : item
        )
      );
      window.dispatchEvent(new CustomEvent('mrz-refresh-notifications'));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAll() {
    try {
      await api.markAllNotificationsRead();
      setNotificationsData((prev: any) =>
        (prev || []).map((item: any) => ({
          ...item,
          status: 'read',
          read_at: new Date().toISOString(),
        }))
      );
      window.dispatchEvent(new CustomEvent('mrz-refresh-notifications'));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-xl border-b border-exec/10">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <h1 className="text-base sm:text-lg font-bold text-ivory tracking-wide truncate">{title}</h1>
          </div>

          <div className="flex-1 min-w-0 max-w-lg mx-2 sm:mx-8">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-carbon/60 border border-exec/10">
              <Wifi size={12} className="text-emerald-400" />
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Worker OK</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-carbon/60 border border-exec/10">
              <Activity size={13} className={systemHealthy ? 'text-copper' : 'text-subtle'} />
              <div className="flex items-center gap-1">
                {AGENTS.map((agent, i) => {
                  const status = agentStatus[i];
                  return (
                    <div key={agent.id} className="relative group">
                      <div
                        className={`
                          w-2 h-2 rounded-full transition-all duration-500
                          ${status === 'running'
                            ? 'bg-copper animate-pulse shadow-[0_0_6px_rgba(212,163,115,0.6)]'
                            : status === 'alive'
                              ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]'
                              : status === 'failed'
                                ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]'
                                : 'bg-gray-700'
                          }
                        `}
                      />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-dark border border-exec/10 text-[10px] text-ivory opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                        {agent.short} — {status === 'running' ? 'Exécution…' : status === 'alive' ? 'En ligne' : status === 'failed' ? 'Échec' : 'Sleep'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-muted tabular-nums">{aliveCount}/7</span>
            </div>

            <div className="hidden md:block w-px h-6 bg-exec/15" />
            <div className="hidden md:block">
              <SystemClock />
            </div>
            <div className="hidden md:block w-px h-6 bg-exec/15" />

            <button
              onClick={() => navigate('/media-center')}
              className="hidden sm:inline-flex p-2 rounded-lg hover:bg-carbon/60 transition text-subtle hover:text-copper"
              title="Media Center"
            >
              <Globe size={17} />
            </button>

            <button
              onClick={() => setNotifOpen((v) => !v)}
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

      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        loading={notificationsLoading}
        error={notificationsError}
        onMarkOne={markOne}
        onMarkAll={markAll}
      />
    </>
  );
}

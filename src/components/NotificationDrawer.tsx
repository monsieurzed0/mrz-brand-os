import { useEffect, useMemo } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { data, loading, error, setData, refetch } = useApiQuery(api.getNotifications, []);

  const notifications = Array.isArray(data) ? data : [];

  const unreadCount = useMemo(() => {
    return notifications.filter((item: any) => item.status === 'unread').length;
  }, [notifications]);

  useEffect(() => {
    function handleRefresh() {
      refetch();
    }

    window.addEventListener('mrz-refresh-notifications', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    const intervalId = setInterval(() => {
      refetch();
    }, 30000);

    return () => {
      window.removeEventListener('mrz-refresh-notifications', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      clearInterval(intervalId);
    };
  }, [refetch]);

  async function markOne(id: string) {
    try {
      await api.markNotificationRead(id);

      setData((prev: any) =>
        (prev || []).map((item: any) =>
          item.id === id
            ? { ...item, status: 'read', read_at: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function markAll() {
    try {
      await api.markAllNotificationsRead();

      setData((prev: any) =>
        (prev || []).map((item: any) => ({
          ...item,
          status: 'read',
          read_at: new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-[24rem] rounded-2xl border border-white/10 bg-[#141416] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F0EDE8]">Notifications</h3>
          <p className="text-xs text-[#71717A]">{unreadCount} non lue(s)</p>
        </div>

        <button
          onClick={markAll}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#EF9F27] hover:border-[#D67A2C]/30"
        >
          <CheckCheck size={12} />
          Tout lire
        </button>
      </div>

      {loading ? <div className="text-sm text-[#A1A1AA]">Chargement...</div> : null}
      {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {notifications.length === 0 && !loading ? (
          <div className="rounded-xl border border-white/5 bg-[#0D0D10] p-4 text-sm text-[#71717A]">
            Aucune notification.
          </div>
        ) : null}

        {notifications.map((item: any) => (
          <button
            key={item.id}
            onClick={() => markOne(item.id)}
            className={`block w-full rounded-xl border p-3 text-left transition ${
              item.status === 'unread'
                ? 'border-[#D67A2C]/25 bg-[#0D0D10]'
                : 'border-white/5 bg-[#0D0D10]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Bell size={12} className="text-[#D67A2C]" />
                  <span className="text-sm font-medium text-[#F0EDE8]">{item.title}</span>
                </div>
                {item.body ? (
                  <p className="mt-2 text-xs leading-6 text-[#A1A1AA]">{item.body}</p>
                ) : null}
              </div>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#71717A]">
                {item.status}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-[#71717A]">{item.created_at}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#A1A1AA] hover:border-[#D67A2C]/30"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  notifications: any[];
  loading: boolean;
  error: string | null;
  onMarkOne: (id: string) => Promise<void>;
  onMarkAll: () => Promise<void>;
};

function resolveNotificationRoute(item: any) {
  switch (item.entity_type) {
    case 'script':
      return '/scripts';
    case 'lead':
      return '/leads';
    case 'project':
      return '/projects';
    case 'proof':
      return '/proof-bank';
    case 'content_idea_batch':
      return '/content';
    case 'agent_run':
      return '/agents';
    default:
      return '/dashboard';
  }
}

export default function NotificationDrawer({
  open,
  onClose,
  notifications,
  loading,
  error,
  onMarkOne,
  onMarkAll,
}: NotificationDrawerProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const unreadCount = notifications.filter((item: any) => item.status === 'unread').length;

  async function handleOpenNotification(item: any) {
    try {
      if (item.status === 'unread') {
        await onMarkOne(item.id);
      }

      navigate(resolveNotificationRoute(item));
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Fermer notifications"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <div className="absolute right-6 top-20 w-[24rem] max-h-[75vh] overflow-hidden rounded-2xl border border-white/10 bg-[#141416]/95 backdrop-blur-xl shadow-2xl">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F0EDE8]">Notifications</h3>
              <p className="text-xs text-[#71717A]">{unreadCount} non lue(s)</p>
            </div>

            <button
              onClick={onMarkAll}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#EF9F27] hover:border-[#D67A2C]/30"
            >
              <CheckCheck size={12} />
              Tout lire
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {loading ? <div className="text-sm text-[#A1A1AA]">Chargement...</div> : null}
          {error ? <div className="text-sm text-red-400">Erreur : {error}</div> : null}

          {!loading && notifications.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-[#0D0D10] p-4 text-sm text-[#71717A]">
              Aucune notification.
            </div>
          ) : null}

          {notifications.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleOpenNotification(item)}
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
      </div>
    </div>
  );
}

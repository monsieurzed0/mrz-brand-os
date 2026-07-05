import { useStore } from '@/lib/useStore';
import { Bell, X, CheckCheck, AlertTriangle, Info, CheckCircle, XCircle, Lightbulb, FileText, Users, Briefcase, Bot, Shield } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info size={14} className="text-muted" />,
  warning: <AlertTriangle size={14} className="text-copper-light" />,
  success: <CheckCircle size={14} className="text-copper" />,
  error: <XCircle size={14} className="text-red-400" />,
};

const moduleIcons: Record<string, React.ReactNode> = {
  content: <Lightbulb size={12} />,
  scripts: <FileText size={12} />,
  leads: <Users size={12} />,
  projects: <Briefcase size={12} />,
  agents: <Bot size={12} />,
  proofs: <Shield size={12} />,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ open, onClose }: Props) {
  const { state, markNotificationRead, markAllNotificationsRead } = useStore();
  const notifications = state.notifications;
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-md bg-deep border-l border-exec/15 h-full overflow-hidden flex flex-col animate-slide-in-right shadow-premium" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-carbon border-b border-exec/10 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-copper/15">
              <Bell size={16} className="text-copper" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ivory">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-subtle">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllNotificationsRead} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper/10 border border-copper/20 text-xs text-copper-light font-semibold hover:bg-copper/20 transition"
              >
                <CheckCheck size={12} /> Tout marquer lu
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-exec/10 rounded-lg transition">
              <X size={18} className="text-muted" />
            </button>
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={32} className="text-subtle/30 mx-auto mb-3" />
              <p className="text-sm text-subtle">Aucune notification</p>
              <p className="text-xs text-subtle/60 mt-1">Les alertes système apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-exec/5">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-5 py-4 transition cursor-pointer hover:bg-carbon/50 ${
                    n.status === 'unread' 
                      ? 'bg-carbon/30 border-l-2 border-copper' 
                      : 'border-l-2 border-transparent'
                  }`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${
                      n.type === 'warning' ? 'bg-copper-light/10' :
                      n.type === 'success' ? 'bg-copper/10' :
                      n.type === 'error' ? 'bg-red-900/20' :
                      'bg-exec/10'
                    }`}>
                      {typeIcons[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${n.status === 'unread' ? 'text-ivory' : 'text-muted'}`}>
                          {n.title}
                        </p>
                        {n.status === 'unread' && (
                          <div className="w-2 h-2 rounded-full bg-copper animate-pulse-copper shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-subtle leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-subtle/60 bg-dark px-2 py-0.5 rounded">
                          {moduleIcons[n.module] || <Info size={10} />}
                          <span className="capitalize">{n.module}</span>
                        </span>
                        <span className="text-[10px] text-subtle/50">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

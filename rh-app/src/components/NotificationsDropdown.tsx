// src/components/NotificationsDropdown.tsx
import { useState, useEffect } from 'react';
import { BellIcon, InboxIcon, CheckIcon } from '@heroicons/react/24/outline';
import Dropdown from './ui/Dropdown';
import { notificationsService } from '../services/notifications.service';
import type { Notification } from '../services/notifications.service';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationsDropdownProps {
  iconSize?: number;
  badgeSize?: number;
  dropdownWidth?: number;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  iconSize = 20,
  badgeSize = 16,
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUnread = async () => {
    if (!user?.agentId) return;
    setLoading(true);
    try {
      const all = await notificationsService.getByAgent(user.agentId);
      setUnreadNotifications(all.filter((n) => !n.lu));
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.agentId]);

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const markAllAsRead = async () => {
    const ids = unreadNotifications.map((n) => n.id);
    setUnreadNotifications([]);
    await Promise.allSettled(ids.map((id) => notificationsService.markAsRead(id)));
  };

  const badgeContent = unreadNotifications.length > 9 ? '9+' : unreadNotifications.length;

  return (
    <Dropdown
      align="right"
      panelClassName="w-96 max-w-[calc(100vw-2rem)]"
      trigger={
        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-xl relative transition-colors"
          aria-label="Notifications"
        >
          <BellIcon style={{ width: iconSize, height: iconSize }} />
          {unreadNotifications.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
              style={{ width: badgeSize, height: badgeSize, fontSize: badgeSize * 0.6 }}
            >
              {badgeContent}
            </span>
          )}
        </button>
      }
    >
      {/* En-tête */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
          {unreadNotifications.length > 0 && (
            <span className="text-[11px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 rounded-full px-2 py-0.5">
              {unreadNotifications.length}
            </span>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <CheckIcon className="h-3.5 w-3.5" /> Tout lire
          </button>
        )}
      </div>

      {/* Corps */}
      {loading && unreadNotifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400">Chargement...</div>
      ) : unreadNotifications.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <InboxIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Aucune notification non lue</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Vous êtes à jour</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-700">
          {unreadNotifications.map((notif) => (
            <button
              key={notif.id}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 group"
              onClick={() => {
                markAsRead(notif.id);
                navigate('/notifications');
              }}
              title={notif.message}
            >
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{notif.message}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatDistanceToNow(new Date(notif.dateNotification), { addSuffix: true, locale: fr })}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Pied */}
      <div className="border-t border-slate-100 dark:border-slate-700">
        <button
          className="w-full px-4 py-2.5 text-center text-xs text-blue-600 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-700/50 font-medium transition-colors"
          onClick={() => navigate('/notifications')}
        >
          Voir toutes les notifications
        </button>
      </div>
    </Dropdown>
  );
};

export default NotificationsDropdown;

import React from 'react';
import { X, Bell, Flame, CheckCircle, ShieldCheck, Plus, Check } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onAddSampleNotification: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onAddSampleNotification,
}) => {
  if (!isOpen) return null;

  const triggerTestPush = () => {
    const alerts: Array<{ title: string; message: string; type: AppNotification['type'] }> = [
      {
        title: '🌟 Math Star Awarded!',
        message: 'You unlocked a new mastery streak! Great job solving fractions.',
        type: 'reward',
      },
      {
        title: '📢 Google Classroom Alert',
        message: 'Assignment "English Vocabulary Quest #3" is now synchronized.',
        type: 'assignment',
      },
      {
        title: '⏰ Learning Time Reminder',
        message: '10 minutes left in today’s daily session goal.',
        type: 'urgent',
      },
    ];
    const pick = alerts[Math.floor(Math.random() * alerts.length)];
    onAddSampleNotification({
      id: `notif_${Date.now()}`,
      title: pick.title,
      message: pick.message,
      type: pick.type,
      timestamp: 'Just now',
      isRead: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        id="modal-notifications-center"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Real-Time Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Urgent notifications & school updates</p>
            </div>
          </div>
          <button 
            id="btn-close-notifications"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between border-b border-indigo-100/50 dark:border-indigo-900/40">
          <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
            {notifications.filter(n => !n.isRead).length} Unread Notifications
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Check className="w-3.5 h-3.5" />
              Mark read
            </button>
            <button
              onClick={triggerTestPush}
              className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full hover:bg-indigo-700 transition"
            >
              <Plus className="w-3 h-3" />
              Test Alert
            </button>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No notifications right now.
            </div>
          ) : (
            notifications.map((notif) => {
              const icon = 
                notif.type === 'streak' ? <Flame className="w-4 h-4 text-amber-500" /> :
                notif.type === 'reward' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                notif.type === 'urgent' ? <ShieldCheck className="w-4 h-4 text-blue-500" /> :
                <Bell className="w-4 h-4 text-indigo-500" />;

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl transition ${
                    notif.isRead 
                      ? 'opacity-70 bg-transparent' 
                      : 'bg-indigo-50/40 dark:bg-indigo-950/20 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Push notifications comply with COPPA child-safe standards (zero ads or marketing).
          </p>
        </div>
      </div>
    </div>
  );
};

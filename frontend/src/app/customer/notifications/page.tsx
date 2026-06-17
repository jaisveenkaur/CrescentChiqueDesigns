'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Bell, RefreshCw, CheckCheck, MessageSquare } from 'lucide-react';
import { notificationService, Notification } from '@/services/notifications';

export default function CustomerNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, isError, refetch } = useQuery<Notification[]>({
    queryKey: ['customerNotifications'],
    queryFn: notificationService.getNotifications,
  });

  // Read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['customerDashboard'] });
    },
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    const unread = notifications.filter(n => !n.is_read);
    unread.forEach(n => markReadMutation.mutate(n.id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Inbox
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Notifications Alerts</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Stay up to date with scheduling slots confirmations, note logs, and status updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gold/45 text-gold hover:bg-gold hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Syncing Alerts...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center max-w-md mx-auto">
          Failed to retrieve notifications.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="max-w-3xl mx-auto w-full">
          {notifications.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              Your inbox is empty. No notifications alerts found.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-4 ${
                    notif.is_read 
                      ? 'bg-white/40 border-gold/5 text-charcoal/70 opacity-80' 
                      : 'bg-white border-gold/20 text-charcoal shadow-sm shadow-gold/5'
                  }`}
                >
                  <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.is_read ? 'bg-charcoal/5 text-charcoal/40' : 'bg-gold/10 text-gold'
                  }`}>
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-xs text-charcoal/90 truncate">{notif.title}</h3>
                      <span className="text-[8px] text-charcoal/40 font-mono">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal/70 leading-relaxed">{notif.message}</p>
                    
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[9px] font-bold text-gold uppercase tracking-wider hover:underline mt-1 self-start"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BellRing, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';
import { notificationService } from '@/services/notifications';

interface NotificationBroadcast {
  customer_id: string;
  title: string;
  message: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
}

export default function AdminNotifications() {
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch real customers list to populate options
  const { data: customers = [], isLoading: loadingCustomers, isError: customerLoadError } = useQuery<CustomerProfile[]>({
    queryKey: ['adminCustomers'],
    queryFn: async () => {
      try {
        const response = await api.get('/customers');
        return response.data;
      } catch (err: any) {
        console.error("GET /customers failed", err.response?.status, err.response?.data);
        throw err;
      }
    },
  });

  // Set default selected customer once loaded
  useEffect(() => {
    if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  // Mutation to trigger real system notification broadcast
  const broadcastMutation = useMutation({
    mutationFn: async (data: NotificationBroadcast) => {
      return await notificationService.broadcastNotification(data);
    },
    onSuccess: () => {
      setFormSuccess(true);
      setTitle('');
      setMessage('');
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to dispatch notification to the workspace.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError('');

    if (!customerId) {
      setFormError('Please select a target customer.');
      return;
    }

    if (!title || !message) {
      setFormError('Title and message are required.');
      return;
    }

    broadcastMutation.mutate({
      customer_id: customerId,
      title,
      message,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <BellRing className="h-3.5 w-3.5" /> Broadcast Console
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Global Alerts</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Dispatch real-time system alerts, status updates, or custom notes to specific client workspaces.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full bg-white/50 glass-card rounded-3xl p-6 sm:p-8 border border-gold/15 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-gold/10 pb-4">
          <Sparkles className="h-5 w-5 text-gold" />
          <h3 className="font-serif text-lg font-semibold">Trigger Customer Notification</h3>
        </div>

        {formSuccess && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            Notification dispatched successfully! Client timeline and dashboards will update.
          </div>
        )}

        {formError && (
          <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 mb-6">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Target Customer Profile</label>
            {loadingCustomers ? (
              <div className="text-xs text-gold animate-pulse">Loading customer profiles...</div>
            ) : customerLoadError ? (
              <div className="text-xs text-red-500">Failed to load target customers. Make sure the database is seeded.</div>
            ) : (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              >
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Alert Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Layout Draft Uploaded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Alert Message Body *</label>
            <textarea
              required
              placeholder="Type your message description here. This will immediately display inside the customer's portal dashboard..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={broadcastMutation.isPending || loadingCustomers || customers.length === 0}
            className="w-full py-3.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Send className="h-3.5 w-3.5" />
            {broadcastMutation.isPending ? 'Sending...' : 'Dispatch Alert Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

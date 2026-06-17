'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  Calendar, 
  FileText, 
  FolderOpen, 
  Bell, 
  ArrowRight, 
  Workflow, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { dashboardService, CustomerDashboardMetrics } from '@/services/dashboard';

export default function CustomerDashboard() {
  const [userName, setUserName] = useState('Valued Client');

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || 'Valued Client');
  }, []);

  const { data: metrics, isLoading, isError } = useQuery<CustomerDashboardMetrics>({
    queryKey: ['customerDashboard'],
    queryFn: dashboardService.getCustomerDashboard,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-xs text-gold font-semibold tracking-widest uppercase">Loading Portal Overview...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
        Failed to load portal metrics dashboard. Please refresh or try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header banner */}
      <div className="flex flex-col gap-1 border-b border-gold/15 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Luxury Workspace
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold mt-1">Hello, {userName}</h1>
        <p className="text-charcoal/70 text-xs mt-1">
          Welcome to your designer dashboard. Review your schedules, estimate costings, and check construction timelines.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Appointments</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_appointments} Booked</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Quotations</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_quotations} Saved</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <FolderOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Documents</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_files} Uploaded</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Active Project Tracker */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {metrics.active_project ? (
            <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5">
                    <Workflow className="h-3.5 w-3.5" /> Active Project
                  </span>
                  <h3 className="font-serif text-xl font-semibold mt-1">Living Room Turnkey Execution</h3>
                </div>
                <span className="bg-gold/10 text-gold border border-gold/30 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {metrics.active_project.project_status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-charcoal/60">Construction Progress</span>
                  <span className="text-gold font-serif">{metrics.active_project.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gold/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold-gradient h-full smooth-transition rounded-full" 
                    style={{ width: `${metrics.active_project.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-gold/10 pt-4 mb-4">
                <div>
                  <span className="text-charcoal/50 block font-medium">Expected Completion</span>
                  <span className="font-semibold text-charcoal/90 mt-0.5 block">
                    {metrics.active_project.expected_completion 
                      ? new Date(metrics.active_project.expected_completion).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'To Be Decided'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal/50 block font-medium">Project Code</span>
                  <span className="font-mono text-charcoal/80 mt-0.5 block truncate">{metrics.active_project.id}</span>
                </div>
              </div>

              <Link 
                href="/customer/timeline"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-dark smooth-transition"
              >
                Track Milestones Timeline <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white/40 glass-card rounded-2xl p-8 border border-gold/10 text-center flex flex-col items-center gap-4">
              <ClipboardList className="h-10 w-10 text-gold/60" />
              <h3 className="font-serif text-lg font-semibold">No Active Construction Project</h3>
              <p className="text-xs text-charcoal/60 max-w-sm leading-relaxed">
                Start by scheduling a slot consultation or saving cost estimates to begin designer layouts.
              </p>
              <Link
                href="/customer/appointments"
                className="bg-gold-gradient text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-md smooth-transition"
              >
                Book consultation
              </Link>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="bg-white/40 glass-card rounded-2xl p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">Portal Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <Link 
                href="/customer/appointments" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Book Appointment</span>
                <span className="text-[10px] text-charcoal/50">Schedule slot consultation.</span>
              </Link>
              <Link 
                href="/gallery" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Calculate Costings</span>
                <span className="text-[10px] text-charcoal/50">Estimate budgets on designs.</span>
              </Link>
              <Link 
                href="/customer/files" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Upload Files</span>
                <span className="text-[10px] text-charcoal/50">Store drafts and photos.</span>
              </Link>
              <Link 
                href="/customer/leads" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">File Inquiries</span>
                <span className="text-[10px] text-charcoal/50">Send general requirements.</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Notifications Board */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-semibold">Recent Notifications</h3>
              </div>
              <Link href="/customer/notifications" className="text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {metrics.recent_notifications.length === 0 ? (
                <p className="text-xs text-charcoal/50 text-center py-6">No unread notifications alerts.</p>
              ) : (
                metrics.recent_notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-4 bg-white/80 rounded-xl border border-gold/10 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs text-charcoal">{notif.title}</h4>
                      <span className="text-[8px] text-charcoal/40 font-mono">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/70 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

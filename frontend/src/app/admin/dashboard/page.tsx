'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  Users, 
  UserSquare2, 
  Workflow, 
  FileText, 
  History, 
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles
} from 'lucide-react';
import { dashboardService, AdminDashboardMetrics } from '@/services/dashboard';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Senior Architect');

  useEffect(() => {
    setAdminName(localStorage.getItem('user_name') || 'Senior Architect');
  }, []);

  // Fetch admin metrics
  const { data: metrics, isLoading, isError } = useQuery<AdminDashboardMetrics>({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-xs text-gold font-semibold tracking-widest uppercase">Fetching Studio Analytics...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
        Failed to load administrator dashboard metrics. Verify database connections.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col gap-1 border-b border-gold/15 pb-6">
        <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Studio Analytics
        </span>
        <h1 className="font-serif text-3xl font-semibold mt-1">Hello, {adminName}</h1>
        <p className="text-charcoal/70 text-xs mt-1">
          Review business inquiries, customer accounts, design execution progress, and system audit logs.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <UserSquare2 className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Total Leads</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_leads}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Customers</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_customers}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Workflow className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Projects</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_projects}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm col-span-1">
          <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Avg Progress</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.average_progress_percentage}%</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Quotations</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_quotations}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Recent activity streams */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-semibold">Recent Studio Activities</h3>
              </div>
              <Link href="/admin/audit-logs" className="text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline">
                View Audit Logs
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {metrics.recent_activities.map((act) => (
                <div 
                  key={act.id} 
                  className="p-4 bg-white/80 rounded-xl border border-gold/5 flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-start gap-2 text-[10px]">
                    <span className="font-bold text-gold uppercase tracking-wider">{act.action}</span>
                    <span className="text-charcoal/40 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">{act.details}</p>
                  {act.user_name && (
                    <span className="text-[9px] text-charcoal/40 font-medium self-end">By: {act.user_name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Shortcuts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
            <h3 className="font-serif text-lg font-semibold mb-4">Management Console</h3>
            <div className="flex flex-col gap-3.5 text-xs">
              <Link 
                href="/admin/leads" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex justify-between items-center smooth-transition"
              >
                <div>
                  <h4 className="font-semibold text-charcoal">Leads Dashboard</h4>
                  <p className="text-[10px] text-charcoal/50 mt-0.5">Filter, search & convert new inquires.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gold" />
              </Link>

              <Link 
                href="/admin/projects" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex justify-between items-center smooth-transition"
              >
                <div>
                  <h4 className="font-semibold text-charcoal">Projects Board</h4>
                  <p className="text-[10px] text-charcoal/50 mt-0.5">Track progress & record site update notes.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gold" />
              </Link>

              <Link 
                href="/admin/quotations" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex justify-between items-center smooth-transition"
              >
                <div>
                  <h4 className="font-semibold text-charcoal">Quotations Manager</h4>
                  <p className="text-[10px] text-charcoal/50 mt-0.5">Issue new cost estimates sheets.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gold" />
              </Link>

              <Link 
                href="/admin/audit-logs" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex justify-between items-center smooth-transition"
              >
                <div>
                  <h4 className="font-semibold text-charcoal">Security Audit Logs</h4>
                  <p className="text-[10px] text-charcoal/50 mt-0.5">Track developer and architect triggers.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gold" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

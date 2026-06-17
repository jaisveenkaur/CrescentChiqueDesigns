'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  UserSquare2, 
  Users, 
  Workflow, 
  Percent, 
  FileText, 
  History, 
  ArrowRight,
  TrendingUp,
  Coins,
  AlertTriangle,
  Calendar,
  Plus,
  RefreshCw
} from 'lucide-react';
import { dashboardService, AdminDashboardMetrics, AdminAnalyticsPayload } from '@/services/dashboard';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Senior Architect');

  useEffect(() => {
    setAdminName(localStorage.getItem('user_name') || 'Senior Architect');
  }, []);

  // Fetch admin metrics
  const { data: metrics, refetch: refetchMetrics } = useQuery<AdminDashboardMetrics>({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
  });

  // Fetch admin analytics
  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError, refetch: refetchAnalytics } = useQuery<AdminAnalyticsPayload>({
    queryKey: ['adminAnalytics'],
    queryFn: dashboardService.getAdminAnalytics,
  });

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchAnalytics();
  };

  if (analyticsLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-xs text-gold font-semibold tracking-widest uppercase">Compiling Studio Analytics...</p>
      </div>
    );
  }

  if (analyticsError || !analytics || !metrics) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white/60 glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/20 shadow-xl flex flex-col items-center gap-4">
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Connection Failure</span>
          <h3 className="font-serif text-lg font-semibold text-charcoal">Analytics Offline</h3>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Failed to load administrator dashboard analytics. Verify database migrations and try again.
          </p>
          <button
            onClick={handleRefreshAll}
            className="mt-2 px-6 py-2.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { leads, projects, quotations } = analytics;

  // Custom helper for calculating concentric SVG progress path attributes
  const getCircleProps = (percentage: number, radius: number) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return { circumference, offset };
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Operations Console
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Hello, {adminName}</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Overview metrics, upcoming deliverables, design trends, and pipeline projections.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          className="p-2.5 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition shrink-0 align-self-end sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white/40 glass-card rounded-2xl p-4 border border-gold/10 flex flex-wrap gap-3 items-center">
        <span className="text-[9px] uppercase font-bold text-charcoal/50 tracking-wider mr-2">Quick Commands:</span>
        <Link 
          href="/admin/leads?create=true"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:shadow-md smooth-transition"
        >
          <Plus className="h-3.5 w-3.5" /> New Lead
        </Link>
        <Link 
          href="/admin/projects?create=true"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white hover:bg-gold rounded-xl text-[10px] font-bold uppercase tracking-wider smooth-transition"
        >
          <Plus className="h-3.5 w-3.5" /> New Project
        </Link>
        <Link 
          href="/admin/quotations?create=true"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gold/30 hover:border-gold text-gold rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-gold/5 smooth-transition"
        >
          <Plus className="h-3.5 w-3.5" /> Issue Quotation
        </Link>
        <Link 
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-charcoal/10 hover:border-charcoal text-charcoal/70 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition ml-auto"
        >
          View Client Directory
        </Link>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <UserSquare2 className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Total Leads</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{leads.total_leads}</h3>
          </div>
        </div>

        {/* Total Customers */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Clients</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_customers}</h3>
          </div>
        </div>

        {/* Total Projects */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Workflow className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Active Proj</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{projects.total_projects}</h3>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Percent className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Avg Progress</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{projects.average_project_completion}%</h3>
          </div>
        </div>

        {/* Total Quotations */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wider block">Estimates</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal/90 mt-0.5">{metrics.total_quotations}</h3>
          </div>
        </div>

        {/* Forecast Revenue */}
        <div className="glass-card rounded-2xl p-5 border border-gold/10 bg-gold/5 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Coins className="h-4.5 w-4.5" />
          </div>
          <div className="mt-3">
            <span className="text-[9px] text-gold uppercase font-bold tracking-wider block">Revenue Est.</span>
            <h3 className="font-serif text-lg font-bold text-charcoal/90 mt-0.5">₹{quotations.revenue_forecast.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADS ANALYTICS */}
        <div className="bg-white/60 glass-card rounded-3xl p-6 border border-gold/15 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif text-base font-semibold text-charcoal">Leads Conversion & Sources</h3>
              <p className="text-[10px] text-charcoal/50">Real-time conversions and marketing channels</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-200">
              Conv Rate: {leads.conversion_rate}%
            </span>
          </div>

          {/* Mini concentric SVG progress loops */}
          <div className="flex justify-around items-center h-28 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background loops */}
              <circle cx="48" cy="48" r="40" className="stroke-gold/10 fill-none" strokeWidth="6" />
              <circle cx="48" cy="48" r="30" className="stroke-gold/10 fill-none" strokeWidth="6" />
              <circle cx="48" cy="48" r="20" className="stroke-gold/10 fill-none" strokeWidth="6" />

              {/* Qualified loop */}
              {(() => {
                const total = leads.total_leads || 1;
                const qualifiedPct = (leads.leads_by_status.qualified / total) * 100;
                const props = getCircleProps(qualifiedPct, 40);
                return (
                  <circle 
                    cx="48" cy="48" r="40" 
                    className="stroke-gold fill-none" 
                    strokeWidth="6" 
                    strokeDasharray={props.circumference} 
                    strokeDashoffset={props.offset} 
                    strokeLinecap="round" 
                  />
                );
              })()}

              {/* Contacted loop */}
              {(() => {
                const total = leads.total_leads || 1;
                const contactedPct = (leads.leads_by_status.contacted / total) * 100;
                const props = getCircleProps(contactedPct, 30);
                return (
                  <circle 
                    cx="48" cy="48" r="30" 
                    className="stroke-[#C9A36B] fill-none" 
                    strokeWidth="6" 
                    strokeDasharray={props.circumference} 
                    strokeDashoffset={props.offset} 
                    strokeLinecap="round" 
                  />
                );
              })()}

              {/* New loop */}
              {(() => {
                const total = leads.total_leads || 1;
                const newPct = (leads.leads_by_status.new / total) * 100;
                const props = getCircleProps(newPct, 20);
                return (
                  <circle 
                    cx="48" cy="48" r="20" 
                    className="stroke-charcoal fill-none" 
                    strokeWidth="6" 
                    strokeDasharray={props.circumference} 
                    strokeDashoffset={props.offset} 
                    strokeLinecap="round" 
                  />
                );
              })()}
            </svg>
            <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-charcoal/70 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Qualified: {leads.leads_by_status.qualified}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C9A36B]" /> Contacted: {leads.leads_by_status.contacted}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-charcoal" /> New: {leads.leads_by_status.new}</span>
            </div>
          </div>

          {/* Lead Sources channels */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gold/10">
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider">Top Sources Channels:</span>
            {leads.top_lead_sources.map((src) => {
              const pct = leads.total_leads > 0 ? (src.count / leads.total_leads) * 100 : 0;
              return (
                <div key={src.source} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-semibold text-charcoal/70">
                    <span>{src.source}</span>
                    <span>{src.count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gold/10 rounded-full overflow-hidden">
                    <div className="bg-gold h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROJECTS ANALYTICS */}
        <div className="bg-white/60 glass-card rounded-3xl p-6 border border-gold/15 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">Project Phases & Deadlines</h3>
            <p className="text-[10px] text-charcoal/50">Execution metrics and completion schedules</p>
          </div>

          {/* Project status distribution list */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider">Phases Distribution:</span>
            {Object.keys(projects.project_status_distribution).length === 0 ? (
              <p className="text-xs text-charcoal/40 py-2">No projects currently tracking.</p>
            ) : (
              Object.entries(projects.project_status_distribution).map(([status, count]) => {
                const total = projects.total_projects || 1;
                const pct = (count / total) * 100;
                return (
                  <div key={status} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold text-charcoal/70">
                      <span>{status}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gold/10 rounded-full overflow-hidden">
                      <div className="bg-charcoal h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Expected Upcoming Completion Deadlines */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gold/10">
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gold" /> Upcoming Deadlines
            </span>
            {projects.upcoming_completion_deadlines.length === 0 ? (
              <p className="text-[10px] text-charcoal/40 py-1">No upcoming deadlines.</p>
            ) : (
              projects.upcoming_completion_deadlines.slice(0, 3).map((d) => (
                <div key={d.id} className="flex justify-between items-center text-[10px] bg-white/40 p-2 rounded border border-gold/5">
                  <div className="truncate max-w-[150px]">
                    <span className="font-bold block text-charcoal/90 truncate">{d.customer_name}</span>
                    <span className="text-[8px] text-charcoal/40 uppercase block">{d.project_status} • {d.progress_percentage}%</span>
                  </div>
                  <span className="font-mono text-gold font-semibold text-[9px]">{new Date(d.expected_completion).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* QUOTATIONS ANALYTICS */}
        <div className="bg-white/60 glass-card rounded-3xl p-6 border border-gold/15 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">Quotations & Value Trends</h3>
            <p className="text-[10px] text-charcoal/50">Estimation pipeline and acceptance values</p>
          </div>

          {/* Simple SVG Line/Area graph for Monthly Quotation value trend */}
          <div className="h-28 flex flex-col justify-end gap-1.5 relative">
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider">Estimation Value Trend:</span>
            {quotations.monthly_quotation_trend.length === 0 ? (
              <div className="h-20 flex items-center justify-center text-[10px] text-charcoal/40">No quotation trends.</div>
            ) : (
              <div className="h-20 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Area fill */}
                  {(() => {
                    const trend = quotations.monthly_quotation_trend;
                    const maxVal = Math.max(...trend.map(t => t.total_value)) || 1;
                    const points = trend.map((t, idx) => {
                      const x = (idx / Math.max(1, trend.length - 1)) * 100;
                      const y = 40 - (t.total_value / maxVal) * 35;
                      return `${x},${y}`;
                    }).join(' ');
                    const areaPoints = `0,40 ${points} 100,40`;
                    return (
                      <>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points={areaPoints} fill="url(#areaGrad)" />
                        <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
                      </>
                    );
                  })()}
                </svg>
                {/* Labels */}
                <div className="flex justify-between text-[8px] font-semibold text-charcoal/40 font-mono mt-1">
                  <span>{quotations.monthly_quotation_trend[0].month}</span>
                  <span>{quotations.monthly_quotation_trend[quotations.monthly_quotation_trend.length - 1].month}</span>
                </div>
              </div>
            )}
          </div>

          {/* Accepted vs Rejected estimates */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-gold/10">
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider">Acceptance Ratios:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold uppercase tracking-wider">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                <span className="text-[14px] block font-serif mt-0.5">{quotations.accepted_vs_rejected.accepted}</span>
                Accepted
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-100">
                <span className="text-[14px] block font-serif mt-0.5">{quotations.accepted_vs_rejected.pending}</span>
                Pending
              </div>
              <div className="p-2 bg-red-50 text-red-700 rounded border border-red-100">
                <span className="text-[14px] block font-serif mt-0.5">{quotations.accepted_vs_rejected.rejected}</span>
                Rejected
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delayed Indicators Alert Panel */}
      {projects.delayed_count > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Delayed Project Alerts ({projects.delayed_count})</span>
            <p className="text-[11px] text-red-800/80 leading-relaxed">
              The following project milestone expected completion dates have expired, but construction has not yet been marked completed:
            </p>
            <div className="flex flex-wrap gap-2.5 mt-2.5">
              {projects.delayed_project_indicators.map((p) => (
                <Link 
                  key={p.id}
                  href="/admin/projects"
                  className="px-3 py-1.5 bg-white border border-red-200 hover:border-red-500 rounded-lg text-[10px] font-semibold text-charcoal flex items-center gap-2 smooth-transition shadow-sm"
                >
                  <span>{p.customer_name}</span>
                  <span className="text-red-600 font-mono text-[9px]">{p.expected_completion}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subcontent Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Recent activities stream */}
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
              {metrics.recent_activities.length === 0 ? (
                <p className="text-xs text-charcoal/40 text-center py-6">No recent audit logs.</p>
              ) : (
                metrics.recent_activities.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-4 bg-white/80 rounded-xl border border-gold/5 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-start gap-2 text-[10px]">
                      <span className="font-bold text-gold uppercase tracking-wider">{act.action}</span>
                      <span className="text-charcoal/40 font-mono">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/80 leading-relaxed">{act.details}</p>
                    {act.user_name && (
                      <span className="text-[9px] text-charcoal/40 font-medium self-end">By: {act.user_name}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Shortcuts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
            <h3 className="font-serif text-lg font-semibold mb-4">Management shortcuts</h3>
            <div className="flex flex-col gap-3.5 text-xs">
              <Link 
                href="/admin/leads" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex justify-between items-center smooth-transition"
              >
                <div>
                  <h4 className="font-semibold text-charcoal">Leads CRM</h4>
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

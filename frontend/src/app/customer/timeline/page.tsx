'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  Clock, 
  RefreshCw, 
  Inbox, 
  Calendar, 
  FileText, 
  Workflow, 
  FolderOpen, 
  Bell 
} from 'lucide-react';
import { dashboardService, TimelineResponse } from '@/services/dashboard';

export default function CustomerTimeline() {
  const { data: timelineData, isLoading, isError, refetch } = useQuery<TimelineResponse>({
    queryKey: ['customerTimeline'],
    queryFn: dashboardService.getCustomerTimeline,
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'lead': return { icon: Inbox, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'appointment': return { icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'quotation': return { icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'project': return { icon: Workflow, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'file': return { icon: FolderOpen, color: 'text-pink-600 bg-pink-50 border-pink-200' };
      default: return { icon: Bell, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const events = timelineData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Chronology
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Project Activity Timeline</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Aggregated real-time stream of all layout draft changes, cost quotation updates, bookings and workspace alerts.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
          title="Refresh Timeline"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Aggregating Workspace Events...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center max-w-md mx-auto">
          Failed to fetch timeline activity logs.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="max-w-3xl mx-auto w-full">
          {events.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              No registered workspace events. Inquiries, bookings, and drafts create timeline cards here.
            </div>
          ) : (
            <div className="relative border-l border-gold/25 ml-4 sm:ml-8 flex flex-col gap-10 py-6">
              {events.map((event, index) => {
                const config = getEventIcon(event.type);
                const Icon = config.icon;
                
                return (
                  <div key={index} className="relative pl-10 sm:pl-12">
                    {/* Timeline Node Icon Card */}
                    <div className={`absolute -left-[18px] top-0.5 h-9 w-9 rounded-full border-2 flex items-center justify-center shadow-sm ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white/60 glass-card rounded-2xl p-5 border border-gold/10 shadow-sm flex flex-col gap-2 hover:border-gold/50 smooth-transition">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gold">
                          {event.type} event
                        </span>
                        <span className="text-[9px] font-mono text-charcoal/40">
                          {new Date(event.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-base font-semibold text-charcoal/90 mt-0.5">{event.title}</h3>
                      <p className="text-xs text-charcoal/70 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

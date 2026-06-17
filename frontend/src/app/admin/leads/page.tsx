'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, UserSquare2, Search, SlidersHorizontal, RefreshCw, Trash2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { leadService, Lead } from '@/services/leads';

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all leads
  const { data: leadsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminLeads', activeTab, search],
    queryFn: () => leadService.getLeads({
      status: activeTab,
      name: search,
    }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: 'new' | 'contacted' | 'qualified' | 'lost' }) =>
      leadService.updateLeadStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setUpdatingId(null);
    },
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => leadService.restoreLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const handleStatusChange = (id: string, newStatus: 'new' | 'contacted' | 'qualified' | 'lost') => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to logically delete this lead entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const leads = leadsData?.items || [];
  const tabs = ['all', 'new', 'contacted', 'qualified', 'lost'];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <UserSquare2 className="h-3.5 w-3.5" /> Leads CRM
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Leads Management</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Track business inquiries, update status, trigger automated status emails, and view customer requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-gold/20 bg-white pl-8 pr-4 py-2 text-xs outline-none focus:border-gold smooth-transition w-48 sm:w-56"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-charcoal/40" />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition cursor-pointer border ${
              activeTab === tab 
                ? 'bg-gold border-gold text-white shadow-sm shadow-gold/20' 
                : 'border-gold/10 bg-white/40 text-charcoal/70 hover:bg-gold/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leads List */}
      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Syncing CRM Database...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
          Failed to load CRM leads. Check database connections.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-4">
          {leads.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              No matching client leads found in the repository.
            </div>
          ) : (
            leads.map((lead) => {
              const statusColorMap = {
                new: 'bg-blue-50 text-blue-700 border-blue-200',
                contacted: 'bg-amber-50 text-amber-700 border-amber-200',
                qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                lost: 'bg-red-50 text-red-700 border-red-200',
              };
              const badgeClass = statusColorMap[lead.status] || 'bg-gray-50 text-gray-700';

              return (
                <div 
                  key={lead.id}
                  className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 flex flex-col sm:flex-row sm:justify-between gap-6 shadow-sm hover:border-gold/30 smooth-transition"
                >
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start sm:justify-start gap-4">
                      <h3 className="font-serif text-lg font-semibold text-charcoal">{lead.name}</h3>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                        {lead.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px] text-charcoal/70 bg-white/40 p-3 rounded-lg border border-gold/5 max-w-md">
                      <div>
                        <span className="text-charcoal/40 font-medium block">Email Address</span>
                        <span className="font-semibold block mt-0.5 truncate">{lead.email}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/40 font-medium block">Phone Contact</span>
                        <span className="font-semibold block mt-0.5">{lead.phone}</span>
                      </div>
                    </div>

                    {lead.requirements && (
                      <div className="text-xs text-charcoal/80 bg-white/20 p-3 rounded-lg border border-gold/5 leading-relaxed">
                        <strong>Requirements:</strong> {lead.requirements}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-3 sm:items-end justify-center shrink-0 border-t sm:border-t-0 border-gold/10 pt-4 sm:pt-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal/50 mr-1">Status Action</span>
                      {updatingId === lead.id ? (
                        <div className="flex gap-1">
                          {(['new', 'contacted', 'qualified', 'lost'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(lead.id, st)}
                              className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider rounded border bg-white border-gold/25 text-charcoal hover:bg-gold hover:text-white smooth-transition"
                            >
                              {st}
                            </button>
                          ))}
                          <button
                            onClick={() => setUpdatingId(null)}
                            className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider rounded border bg-gray-50 border-gray-200 text-charcoal/70"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUpdatingId(lead.id)}
                          className="px-3 py-1 bg-charcoal/5 hover:bg-gold/15 text-charcoal/90 rounded border border-gold/20 text-[9px] font-bold uppercase tracking-wider smooth-transition"
                        >
                          Change Status
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3 mt-1.5 self-end">
                      <button
                        onClick={() => handleRestore(lead.id)}
                        className="text-[9px] font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                        title="Restore Lead"
                      >
                        <RotateCcw className="h-3 w-3" /> Restore
                      </button>
                      
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-[9px] font-bold text-red-600 uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

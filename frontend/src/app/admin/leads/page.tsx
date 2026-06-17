'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserSquare2, 
  Search, 
  RefreshCw, 
  Trash2, 
  RotateCcw, 
  Plus, 
  Edit3, 
  X,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { leadService, Lead } from '@/services/leads';
import { api } from '@/services/api';

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals visibility state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requirements: '',
    source: 'Website',
    status: 'new' as 'new' | 'contacted' | 'qualified' | 'lost',
    customer_id: '' as string | null
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all leads
  const { data: leadsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminLeads', activeTab, search],
    queryFn: () => leadService.getLeads({
      status: activeTab,
      name: search,
    }),
  });

  // Fetch active customers for linking dropdown
  const { data: customers = [] } = useQuery<CustomerOption[]>({
    queryKey: ['adminCustomersForLeads'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  // Check query parameter to auto-open creation modal
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Update status quick mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: 'new' | 'contacted' | 'qualified' | 'lost' }) =>
      leadService.updateLeadStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setUpdatingId(null);
    },
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: leadService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || err.message || 'Failed to create lead.');
    }
  });

  // Edit lead mutation
  const editLeadMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => leadService.editLead(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsEditOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || err.message || 'Failed to update lead.');
    }
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      requirements: '',
      source: 'Website',
      status: 'new',
      customer_id: ''
    });
    setFormError(null);
    setSelectedLead(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    resetForm();
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      requirements: lead.requirements || '',
      source: (lead as any).source || 'Website',
      status: lead.status,
      customer_id: lead.customer_id || ''
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Name, Email, and Phone contact are required fields.');
      return;
    }
    createLeadMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      requirements: formData.requirements || undefined,
      source: formData.source || undefined,
      customer_id: formData.customer_id ? formData.customer_id : null
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedLead) return;
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Name, Email, and Phone contact are required fields.');
      return;
    }
    editLeadMutation.mutate({
      id: selectedLead.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        requirements: formData.requirements ? formData.requirements : null,
        source: formData.source,
        status: formData.status,
        customer_id: formData.customer_id ? formData.customer_id : null
      }
    });
  };

  const leads = leadsData?.items || [];
  const tabs = ['all', 'new', 'contacted', 'qualified', 'lost'];
  const sources = ['Website', 'Instagram', 'Referral', 'Houzz', 'Google', 'Other'];

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
          
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
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {lead.status}
                        </span>
                        <span className="text-[9px] uppercase bg-gold/15 text-gold font-bold px-2.5 py-0.5 rounded-full border border-gold/25">
                          {(lead as any).source || 'Website'}
                        </span>
                        {lead.customer_id && (
                          <span className="text-[9px] uppercase bg-charcoal text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> Linked
                          </span>
                        )}
                      </div>
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
                      <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal/50 mr-1">Status Quick-Update</span>
                      {updatingId === lead.id ? (
                        <div className="flex gap-1 flex-wrap">
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
                          Quick Status
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3 mt-1.5 self-end items-center">
                      <button
                        onClick={() => openEditModal(lead)}
                        className="text-[9px] font-bold text-charcoal hover:text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5 smooth-transition"
                        title="Edit all fields"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Profile
                      </button>

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

      {/* CREATE LEAD MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 border border-gold/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-gold/15 text-charcoal/50 hover:text-gold hover:border-gold/40 smooth-transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3" /> System Form
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Create New Lead Entry</h2>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Priyal Sharma"
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. priyal@example.com"
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Phone Contact *</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Lead Channel Source</label>
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    {sources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Link Customer Profile (Optional)</label>
                  <select 
                    value={formData.customer_id || ''}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value || null})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer text-charcoal"
                  >
                    <option value="">-- No Account Link --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Design Requirements</label>
                <textarea 
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Summarize structural layouts, grade preferences, or style benchmarks..."
                  rows={3}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-charcoal/20 text-charcoal/70 rounded-xl font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="flex-1 py-3 bg-gold-gradient text-white rounded-xl font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition disabled:opacity-50"
                >
                  {createLeadMutation.isPending ? 'Saving Lead...' : 'Submit Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {isEditOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 border border-gold/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-gold/15 text-charcoal/50 hover:text-gold hover:border-gold/40 smooth-transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3" /> System Editor
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Edit Lead Profile Details</h2>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Phone Contact *</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Lead Channel Source</label>
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    {sources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Lead Status Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="qualified">qualified</option>
                    <option value="lost">lost</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Link Customer Profile (Optional)</label>
                <select 
                  value={formData.customer_id || ''}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value || null})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer text-charcoal"
                >
                  <option value="">-- No Account Link --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Design Requirements</label>
                <textarea 
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows={3}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 border border-charcoal/20 text-charcoal/70 rounded-xl font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLeadMutation.isPending}
                  className="flex-1 py-3 bg-gold-gradient text-white rounded-xl font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition disabled:opacity-50"
                >
                  {editLeadMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

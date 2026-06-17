'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Inbox, Send, RefreshCw, Layers } from 'lucide-react';
import { leadService, Lead } from '@/services/leads';

export default function CustomerLeads() {
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch current customer's leads
  const { data: leadsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customerLeads'],
    queryFn: () => leadService.getLeads(),
  });

  // Create lead mutation
  const leadMutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; requirements: string }) =>
      leadService.createLead(data),
    onSuccess: () => {
      setFormSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setRequirements('');
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['customerLeads'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to submit design inquiry.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setFormError('Name, email and phone number are required.');
      return;
    }
    leadMutation.mutate({ name, email, phone, requirements });
  };

  const leads = leadsData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Inbox className="h-3.5 w-3.5" /> Inquiries
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">My Service Leads</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            File general project requirements, and monitor their review status.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Submission panel */}
        <div className="lg:col-span-5 bg-white/50 glass-card rounded-2xl p-6 border border-gold/15 shadow-md">
          <h3 className="font-serif text-lg font-semibold mb-4">File New Inquiry</h3>
          
          {formSuccess && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-4">
              ✓ Service inquiry submitted successfully! Our consultants will review this detail.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter inquiry name"
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Contact Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jaisveen@gmail.com"
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-2834"
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Specific Requirements</label>
              <textarea
                placeholder="Describe your design scale, budget preference, or material grade..."
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition resize-none"
              />
            </div>

            {formError && (
              <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                ⚠️ {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={leadMutation.isPending}
              className="w-full py-3 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-md smooth-transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {leadMutation.isPending ? 'Filing Inquiry...' : 'Submit Design Lead'}
            </button>
          </form>
        </div>

        {/* RIGHT: List panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-serif text-lg font-semibold mb-2">My Inquiry History</h3>

          {isLoading && (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Loading history...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">
              Failed to pull inquiries list.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {leads.length === 0 ? (
                <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                  No registered inquiries. Submit a new lead on the left.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {leads.map((lead) => {
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
                        className="bg-white/60 glass-card rounded-2xl p-5 border border-gold/10 flex flex-col gap-3.5 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif text-base font-semibold text-charcoal/90">{lead.name}</h4>
                          <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {lead.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[10px] text-charcoal/70 bg-white/40 p-3 rounded-lg border border-gold/5">
                          <div>
                            <span className="text-charcoal/40 font-medium block">Phone Contact</span>
                            <span className="font-semibold block mt-0.5">{lead.phone}</span>
                          </div>
                          <div>
                            <span className="text-charcoal/40 font-medium block">Registered At</span>
                            <span className="font-semibold block mt-0.5">
                              {new Date(lead.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {lead.requirements && (
                          <div className="text-xs text-charcoal/80 leading-relaxed bg-white/20 p-3 rounded-lg border border-gold/5">
                            <strong>Requirements:</strong> {lead.requirements}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

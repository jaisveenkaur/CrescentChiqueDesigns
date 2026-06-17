'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '@/services/api';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  registered_at: string;
  tier: 'Economy' | 'Premium' | 'Luxury';
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  // Fetch customers from live endpoint
  const { data: customers = [], isLoading, isError, refetch, error } = useQuery<CustomerProfile[]>({
    queryKey: ['adminCustomers'],
    queryFn: async () => {
      try {
        const response = await api.get('/customers');
        return response.data;
      } catch (err: any) {
        console.error(
          "GET /customers failed",
          err.response?.status,
          err.response?.data
        );
        throw err;
      }
    },
  });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Portfolio
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Customers Portfolio</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Review registered client account sheets, addresses, and design package tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-gold/20 bg-white pl-8 pr-4 py-2 text-xs outline-none focus:border-gold smooth-transition w-48 sm:w-56"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-charcoal/40" />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Opening Client Directory...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50/10 border border-red-500/20 glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-500 font-semibold uppercase tracking-wider">Failed to Open Client Directory</p>
          <p className="text-xs text-charcoal/70 max-w-md">
            {(error as any)?.response?.data?.error || (error as any)?.message || 'A network error occurred while connecting to the database.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-5 py-2 border border-gold hover:bg-gold/15 text-gold text-xs font-bold uppercase tracking-wider rounded-full smooth-transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10 col-span-2">
              No matching client profiles found.
            </div>
          ) : (
            filtered.map((cust) => (
              <div 
                key={cust.id}
                className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 flex flex-col gap-4 shadow-sm hover:border-gold/30 smooth-transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold-gradient text-white flex items-center justify-center font-serif text-base font-bold uppercase shadow-sm">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-charcoal">{cust.name}</h3>
                      <p className="text-[9px] text-charcoal/40 font-mono mt-0.5">ID: {cust.id}</p>
                    </div>
                  </div>

                  <span className="bg-gold/10 text-gold border border-gold/30 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {cust.tier || 'Economy'} Member
                  </span>
                </div>

                <div className="border-t border-gold/10 pt-4 flex flex-col gap-2.5 text-xs text-charcoal/70">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gold shrink-0" />
                    <span>{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gold shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <span>{cust.address || 'N/A'}, {cust.city}, {cust.state}</span>
                  </div>
                </div>

                <div className="border-t border-gold/10 pt-4 flex justify-between items-center text-[10px] text-charcoal/40 font-semibold uppercase tracking-wider">
                  <span>Registered Date</span>
                  <span>{cust.registered_at ? new Date(cust.registered_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

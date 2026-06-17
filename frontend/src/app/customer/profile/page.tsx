'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, User, RefreshCw, Save, KeyRound } from 'lucide-react';
import { authService, User as UserType } from '@/services/auth';

export default function CustomerProfile() {
  const queryClient = useQueryClient();

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Load profile details
  const { data: user, isLoading, isError, refetch } = useQuery<UserType>({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setStateName(user.state || '');
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserType>) => authService.updateProfile(data),
    onSuccess: () => {
      setFormSuccess(true);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err: any) => {
      setFormError(err || 'Failed to modify profile details.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError('');
    if (!name || !phone || !city || !stateName) {
      setFormError('Required fields: Name, phone number, city, and state.');
      return;
    }
    updateProfileMutation.mutate({
      name,
      phone,
      address,
      city,
      state: stateName,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Identity
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">My Personal Profile</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Update your operational contact details, address, and city location fields.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
          title="Refresh Profile"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Loading Profile Credentials...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center max-w-md mx-auto">
          Failed to load profile parameters.
        </div>
      )}

      {!isLoading && !isError && user && (
        <div className="max-w-xl mx-auto w-full bg-white/50 glass-card rounded-3xl p-6 sm:p-8 border border-gold/15 shadow-xl">
          <div className="flex items-center gap-4 border-b border-gold/10 pb-6 mb-6">
            <div className="h-12 w-12 rounded-full bg-gold-gradient text-white flex items-center justify-center font-serif text-lg font-bold uppercase shadow-sm">
              {name.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">{name}</h3>
              <p className="text-xs text-charcoal/50 font-mono">Role: Client ({user.role})</p>
            </div>
          </div>

          {formSuccess && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-6">
              ✓ Profile information modified and synced successfully!
            </div>
          )}

          {formError && (
            <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 mb-6">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Registered Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-gold/10 bg-charcoal/5 px-4 py-2.5 text-xs text-charcoal/50 outline-none cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
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
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Beverly Hills"
                  className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">State *</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. CA"
                  className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Full Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 100 Luxury Avenue, Suite 400"
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full py-3.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? 'Saving Settings...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

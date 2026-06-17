'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Compass, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';
import { leadService } from '@/services/leads';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Submit Lead mutation
  const leadMutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; requirements: string }) =>
      leadService.createLead(data),
    onSuccess: () => {
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setRequirements('');
      setError('');
    },
    onError: (err: any) => {
      setError(err || 'Failed to submit inquiry. Please ensure you are logged in as a registered customer.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError('Please fill in all required fields.');
      return;
    }
    leadMutation.mutate({ name, email, phone, requirements });
  };

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Page title header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Get In Touch</span>
          <h1 className="font-serif text-4xl sm:text-5xl mt-3 font-semibold">Initiate Your Design Concept</h1>
          <p className="text-charcoal/70 text-sm mt-3">
            Ready to remodel your space? File an inquiry lead below, and our design consultants will reach out within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-charcoal text-white rounded-3xl p-8 sm:p-10 border border-gold/10 shadow-2xl flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Compass className="h-8 w-8 text-gold" />
              <h3 className="font-serif text-2xl font-semibold mt-2">Crescent Chique Studio</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Connect with our concierge. We coordinate structural designs across luxury residential apartments, villas, penthouses and commercial lobbies.
              </p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-white/95 uppercase tracking-wider mb-1">Office Location</h4>
                  <p className="text-white/75 leading-relaxed">
                    100 Luxury Avenue, Suite 400,<br />Beverly Hills, CA 90210
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-white/95 uppercase tracking-wider mb-1">Telephone Support</h4>
                  <p className="text-white/75 leading-relaxed">+1 (555) 019-2834</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-white/95 uppercase tracking-wider mb-1">Concierge Email</h4>
                  <p className="text-white/75 leading-relaxed">concierge@crescentchique.com</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mt-2 text-[10px] text-white/40 leading-relaxed">
              * Note: Valid client accounts allow design tracking, document storage and timeline management inside the online customer portal.
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="lg:col-span-7 bg-white/50 glass-card rounded-3xl p-8 sm:p-10 border border-gold/15 shadow-xl">
            <h3 className="font-serif text-2xl font-semibold mb-6">Service Inquiry Form</h3>

            {success ? (
              <div className="py-12 text-center flex flex-col items-center gap-4 bg-white/80 rounded-2xl border border-gold/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-gold" />
                <h4 className="font-serif text-xl font-semibold">Inquiry Filed Successfully</h4>
                <p className="text-xs text-charcoal/70 max-w-sm leading-relaxed">
                  Your lead inquiry has been registered in our database. An interior coordinator will review your requirements and follow up.
                </p>
                <div className="mt-4 flex gap-4 text-xs font-semibold uppercase tracking-wider">
                  <Link href="/gallery" className="text-gold hover:underline">Browse Designs</Link>
                  <span className="text-charcoal/30">|</span>
                  <Link href="/customer/dashboard" className="text-charcoal hover:underline">Client Portal</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-3 text-xs outline-none focus:border-gold smooth-transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jaisveen@gmail.com"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-3 text-xs outline-none focus:border-gold smooth-transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-3 text-xs outline-none focus:border-gold smooth-transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Requirements & Details</label>
                  <textarea
                    placeholder="Describe your design space type, dimensions, budget preferences or material grade..."
                    rows={4}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-3 text-xs outline-none focus:border-gold smooth-transition resize-none"
                  />
                </div>

                {error && (
                  <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg leading-relaxed">
                    ⚠️ {error}
                    <div className="mt-1 font-semibold">
                      Please <Link href="/login" className="underline hover:text-red-800">log in as a customer</Link> to submit this lead inquiry to the backend database.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={leadMutation.isPending}
                  className="w-full py-3.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {leadMutation.isPending ? 'Filing Inquiry...' : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Submit Service Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

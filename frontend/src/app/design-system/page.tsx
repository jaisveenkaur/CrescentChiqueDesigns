'use client';

import React from 'react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';
import { Compass, Sparkles, LayoutTemplate, MessageSquare } from 'lucide-react';

export default function DesignSystem() {
  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="border-b border-gold/15 pb-6 mb-12">
          <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Design Curation</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mt-1">Crescent Chique UI Design System</h1>
        </div>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold mb-4">Core Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-24 w-full bg-beige-soft rounded-xl border border-gold/15 shadow-sm" />
              <span className="text-xs font-semibold">Beige Soft (Bg)</span>
              <span className="text-[10px] text-charcoal/50">#F8F6F2</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-24 w-full bg-beige-dark rounded-xl border border-gold/15 shadow-sm" />
              <span className="text-xs font-semibold">Beige Dark (Panels)</span>
              <span className="text-[10px] text-charcoal/50">#F4EEE5</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-24 w-full bg-gold rounded-xl shadow-sm" />
              <span className="text-xs font-semibold">Accent Gold</span>
              <span className="text-[10px] text-charcoal/50">#D4AF37</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-24 w-full bg-gold-dark rounded-xl shadow-sm" />
              <span className="text-xs font-semibold">Gold Dark</span>
              <span className="text-[10px] text-charcoal/50">#C9A36B</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-24 w-full bg-charcoal rounded-xl shadow-sm" />
              <span className="text-xs font-semibold">Charcoal Text/Sidebar</span>
              <span className="text-[10px] text-charcoal/50">#1F2937</span>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12 border-t border-gold/10 pt-8">
          <h2 className="font-serif text-2xl font-semibold mb-4">Typography Scaling</h2>
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Serif Display Heading</span>
              <h1 className="font-serif text-4xl sm:text-5xl font-light leading-none mt-1">Playfair Luxury Headings</h1>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Serif Sub-heading</span>
              <h2 className="font-serif text-2xl font-semibold mt-1">Bespoke Residential Layouts</h2>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Sans-serif Body Text</span>
              <p className="font-sans text-sm leading-relaxed max-w-2xl text-charcoal/80 mt-1">
                Natural oak paneling, low-profile seating, textured linen textiles, and organic clay vases are curated inside modern Japandi residential formats. This is our default geometric font style (Manrope / Inter).
              </p>
            </div>
          </div>
        </section>

        {/* UI Elements: Cards, Buttons */}
        <section className="mb-12 border-t border-gold/10 pt-8">
          <h2 className="font-serif text-2xl font-semibold mb-4">Bespoke UI Elements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Panels */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-charcoal/50 mb-2">Frosted Glassmorphic Cards</h3>
              
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">Card Label</span>
                <h4 className="font-serif text-lg font-semibold">Light Glass Panel</h4>
                <p className="text-xs text-charcoal/70">
                  Ideal for customer portal listings, active notification boards, and pricing estimate sliders.
                </p>
              </div>

              <div className="glass-card-dark rounded-2xl p-6 flex flex-col gap-3 text-white">
                <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">Admin Label</span>
                <h4 className="font-serif text-lg font-semibold">Dark Charcoal Panel</h4>
                <p className="text-xs text-white/70">
                  Ideal for sidebar layers, headers, dashboard status counts, and settings sections.
                </p>
              </div>
            </div>

            {/* Buttons & Forms */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-charcoal/50 mb-2">Luxury Call to Actions</h3>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-gold-gradient text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:shadow-lg smooth-transition">
                  Primary Gold Button
                </button>
                
                <button className="bg-charcoal text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-gold smooth-transition">
                  Charcoal CTA
                </button>

                <button className="border border-gold/40 text-charcoal bg-white/40 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-white smooth-transition">
                  Muted Border Button
                </button>
              </div>

              <h3 className="text-xs uppercase font-bold tracking-wider text-charcoal/50 mt-4 mb-2">Inputs Forms</h3>
              <div className="flex flex-col gap-4 max-w-sm">
                <input
                  type="text"
                  placeholder="Standard text input field..."
                  className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
                <select className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition">
                  <option>Select Option Tier</option>
                  <option>Economy Grade</option>
                  <option>Premium Grade</option>
                  <option>Luxury Grade</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, PenTool, LayoutTemplate, Hammer, Gem, ArrowRight } from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';

export default function Services() {
  const servicePillars = [
    {
      icon: LayoutTemplate,
      title: 'Space Layout Planning',
      description: 'Creating ergonomic, customized floor plans and structural pathways. We maximize spatial flow and natural light alignments for any residence.',
    },
    {
      icon: PenTool,
      title: '3D Visual Renders',
      description: 'Stunning high-fidelity 3D conceptual designs and dynamic walkthrough simulations. Experience your future home before construction commences.',
    },
    {
      icon: Hammer,
      title: 'Modular Carpentry & Fittings',
      description: 'High-end modular smart kitchens, customized wardrobes, and premium wood panels manufactured under strict factory precision.',
    },
    {
      icon: Gem,
      title: 'Luxury Decor Curation',
      description: 'Selecting premium imported marbles, luxury upholstery fabrics, bespoke furniture, and decorative lighting pieces to complete the look.',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Our Offerings</span>
          <h1 className="font-serif text-4xl sm:text-5xl mt-3 font-semibold">Exquisite Design Services</h1>
          <p className="text-charcoal/70 text-sm mt-3">
            From single room transformations to full turnkey luxury residential renovations, we provide complete design and execution.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {servicePillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={index} 
                className="bg-white/40 glass-card rounded-2xl p-8 border border-gold/15 shadow-md flex gap-6 hover:border-gold hover:shadow-xl smooth-transition"
              >
                <div className="h-12 w-12 rounded-xl bg-gold-gradient text-white flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-xl font-semibold">{pillar.title}</h3>
                  <p className="text-xs text-charcoal/75 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout Section */}
        <div className="bg-charcoal text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-gold/10">
          <div className="absolute inset-0 z-0 opacity-15">
            <Compass className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-gold" />
          </div>
          
          <div className="relative z-10 max-w-2xl flex flex-col gap-6">
            <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Bespoke Curation</span>
            <h2 className="font-serif text-3xl font-semibold">Elevating Spaces Into Art</h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Every detail is meticulously planned. Our collaborations with direct Italian marble quarries, high-end veneer crafters, and automated smart house manufacturers guarantee premium execution.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                href="/gallery" 
                className="inline-flex items-center gap-2 bg-gold-gradient text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-gold/30 smooth-transition"
              >
                Explore Gallery <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white hover:text-charcoal px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition"
              >
                Request Estimation
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

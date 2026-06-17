'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Award, Heart, CheckCircle2 } from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';

export default function About() {
  const principles = [
    {
      icon: Award,
      title: 'Architectural Excellence',
      desc: 'Our layouts combine structural integrity, spatial geometry, and bespoke high-end textures.',
    },
    {
      icon: Heart,
      title: 'Client-Centric Customization',
      desc: 'Your space is a visual autobiography. We tailor every millwork joint to fit your exact lifestyle.',
    },
    {
      icon: CheckCircle2,
      title: 'Factory-Grade Quality',
      desc: 'State-of-the-art machinery cuts custom modular paneling to avoid manual alignment errors.',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Editorial Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Our Studio</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold">Crescent Chique Designs</h1>
            <p className="text-charcoal/80 text-sm leading-relaxed mt-2">
              Established with the ambition of merging classic interior architecture with modern luxury, Crescent Chique has evolved into a premier turnkey design studio.
            </p>
            <p className="text-charcoal/70 text-xs leading-relaxed">
              We specialize in creating bespoke interior layouts for high-end residential properties and executive offices. Our signature aesthetic integrates warm soft beige tones, gold gradients, glassmorphism paneling, and curated natural stones to build spaces that look timeless.
            </p>
          </div>
          
          <div className="lg:col-span-6 relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gold/15">
            <Image
              src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800"
              alt="Design Studio Curation"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Principles Section */}
        <div className="bg-white/40 glass-card rounded-3xl p-8 sm:p-12 border border-gold/15 mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Core Beliefs</span>
            <h2 className="font-serif text-2xl sm:text-3xl mt-2 font-semibold">Our Design Philosophy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((pr, index) => {
              const Icon = pr.icon;
              return (
                <div key={index} className="flex flex-col gap-3.5 items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{pr.title}</h3>
                  <p className="text-xs text-charcoal/70 leading-relaxed">{pr.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet the Founders */}
        <div className="text-center max-w-xl mx-auto">
          <h3 className="font-serif text-2xl font-semibold">Interested in working with us?</h3>
          <p className="text-charcoal/70 text-xs mt-3 leading-relaxed">
            Schedule a site consultation slot today. Get custom material catalogs, 3D renderings, and complete project tracking directly.
          </p>
          <div className="mt-6 flex justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-charcoal text-white hover:bg-gold px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider smooth-transition"
            >
              Contact Our Architects
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

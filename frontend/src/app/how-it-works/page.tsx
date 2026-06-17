'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, CalendarDays, Palette, Settings, CheckSquare, Key, ArrowRight } from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';

export default function HowItWorks() {
  const steps = [
    {
      icon: CalendarDays,
      num: '01',
      title: 'Consultation & Booking',
      desc: 'Submit your online inquiry and book a slots consultation. We inspect your site requirements, room typologies, and style preferences.',
    },
    {
      icon: Palette,
      num: '02',
      title: 'Design Renders & Estimations',
      desc: 'Our architects develop floor layouts and high-fidelity 3D walkthroughs. Instant estimations help refine material options and budget tiers.',
    },
    {
      icon: Settings,
      num: '03',
      title: 'Production & Logistics',
      desc: 'Custom cabinetry, wardrobes and wall panels are precision-cut at our production hubs. All imported stone slabs and fabrics are gathered.',
    },
    {
      icon: CheckSquare,
      num: '04',
      title: 'On-Site Execution',
      desc: 'Our construction crew starts core setups, electrical cabling, false ceilings, custom carpentry fitting, and modular setups under architect supervision.',
    },
    {
      icon: Key,
      num: '05',
      title: 'Auditing & Handover',
      desc: 'A comprehensive 145-point quality check covers joints, alignments, polish, and electrical feeds. We clean the space and hand over your keys.',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">The Process</span>
          <h1 className="font-serif text-4xl sm:text-5xl mt-3 font-semibold">How It Works</h1>
          <p className="text-charcoal/70 text-sm mt-3">
            Our systematic approach ensures projects are delivered on-schedule, within-budget, and to the highest standards of luxury interior architecture.
          </p>
        </div>

        {/* Workflow Timeline */}
        <div className="relative border-l border-gold/20 ml-6 sm:ml-12 flex flex-col gap-16 py-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative pl-10 sm:pl-16">
                {/* Timeline dot with icon */}
                <div className="absolute -left-[24px] top-0 h-12 w-12 rounded-full bg-charcoal border-4 border-beige-soft flex items-center justify-center text-gold shadow-md">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-1.5 max-w-3xl">
                  <span className="font-serif text-3xl font-light text-gold/50">{step.num}</span>
                  <h3 className="font-serif text-xl font-semibold -mt-2">{step.title}</h3>
                  <p className="text-xs text-charcoal/75 leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div className="mt-20 text-center bg-white/40 glass-card rounded-3xl p-8 sm:p-12 border border-gold/15 max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Ready to Upgrade Your Living Space?</h2>
          <p className="text-charcoal/70 text-xs mt-3 max-w-lg mx-auto leading-relaxed">
            Begin the journey by submitting an inquiry. Keep track of progress milestones and notes directly through our premium portal.
          </p>
          <div className="mt-6 flex justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-gold-gradient text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-gold/30 smooth-transition"
            >
              Start Consultation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

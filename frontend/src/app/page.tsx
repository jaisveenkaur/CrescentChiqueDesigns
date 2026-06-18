'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  Quote,
  Star,
  Award,
  Compass,
  CheckCircle2
} from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';
import { appointmentService } from '@/services/appointments';
import { designService } from '@/services/designs';
import { Logo, GoldPattern, LuxuryDivider, EditorialAccent } from '@/components/brand';

export default function Home() {
  // Before/After Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) { // Left button dragged
      handleSliderMove(e.clientX);
    }
  };

  // Consultation booking form state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [requirements, setRequirements] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Design Journey Active Step
  const [activeStep, setActiveStep] = useState(0);

  // Testimonials Carousel Active Index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Animated counters state for 4 metrics (Homeowners, Rating, Experience, Projects)
  const [counters, setCounters] = useState({
    homeowners: 0,
    rating: 0,
    experience: 0,
    projects: 0,
  });

  useEffect(() => {
    const duration = 2000; 
    const interval = 50; 
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCounters({
        homeowners: Math.floor((1200 / steps) * step),
        rating: parseFloat(((4.9 / steps) * step).toFixed(1)),
        experience: Math.floor((15 / steps) * step),
        projects: Math.floor((300 / steps) * step),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters({
          homeowners: 1200,
          rating: 4.9,
          experience: 15,
          projects: 300,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const bookingMutation = useMutation({
    mutationFn: (data: { appointment_date: string; appointment_time: string; requirements: string }) =>
      appointmentService.createAppointment(data),
    onSuccess: () => {
      setBookingSuccess(true);
      setBookingDate('');
      setBookingTime('');
      setRequirements('');
      setBookingError('');
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to schedule appointment. Please ensure you are logged in as a customer.');
    },
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      setBookingError('Please select a date and time.');
      return;
    }
    bookingMutation.mutate({
      appointment_date: bookingDate,
      appointment_time: bookingTime,
      requirements,
    });
  };

  // Fetch designs for Featured Work
  const { data: designs } = useQuery({
    queryKey: ['featuredDesigns'],
    queryFn: designService.getDesigns,
  });

  // Client-side particles generator to avoid server hydration issues
  const [particlesArray, setParticlesArray] = useState<{ id: number; left: string; top: string; delay: number; duration: number }[]>([]);
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      top: `${15 + Math.random() * 70}%`,
      delay: Math.random() * 4,
      duration: 5 + Math.random() * 6
    }));
    setParticlesArray(generated);
  }, []);

  // Short screen height detection for layout safety
  const [isShortScreen, setIsShortScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsShortScreen(window.innerHeight < 820);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const journeySteps = [
    {
      step: 'Step 01',
      title: 'Consultation',
      duration: '1 - 2 Weeks',
      deliverables: 'Style Moodboard, Site Audit Blueprint',
      description: 'Our journey begins with a private consultation at your property. We study the natural illumination, capture precise spatial measurements, and discuss your lifestyle desires to establish a bespoke design direction.',
      image: '/images/image.png'
    },
    {
      step: 'Step 02',
      title: 'Space Planning',
      duration: '2 Weeks',
      deliverables: '2D Floor Layouts, Circulation Flow Analysis',
      description: 'We craft comprehensive architectural flow plans, optimizing circulation, micro-zoning spaces, and sketching custom spatial alignments to unlock the full potential of your site layout.',
      image: '/images/image copy.png'
    },
    {
      step: 'Step 03',
      title: '3D Visualization',
      duration: '3 - 4 Weeks',
      deliverables: 'Photorealistic 4K Renders, 360° VR Walkthrough',
      description: 'Witness your future sanctuary before a single stone is cut. We produce ultra-realistic, volumetric 3D renders with exact material mapping and virtual reality sequences to refine aesthetic details.',
      image: '/images/image copy 2.png'
    },
    {
      step: 'Step 04',
      title: 'Material Selection',
      duration: '2 Weeks',
      deliverables: 'Curated Palette Board, Hardware Specifications',
      description: 'A private walkthrough of our material vault. We touch and pair Greek marble slabs, wire-brushed oak paneling, premium velvet swatches, and custom brass hardware to complete the sensory palette.',
      image: '/images/image copy 3.png'
    },
    {
      step: 'Step 05',
      title: 'Turnkey Execution',
      duration: '12 - 16 Weeks',
      deliverables: 'Civil Modifications, Custom Carpentry, Installation',
      description: 'Our certified master craftsmen step in. Under the close daily supervision of your dedicated project architect, we execute civil changes, fit custom millwork, and install fine services with absolute precision.',
      image: '/images/image copy 4.png'
    },
    {
      step: 'Step 06',
      title: 'Handover & Styling',
      duration: '1 Week',
      deliverables: 'Final Styling, Professional Staging, Warranty Manual',
      description: 'The reveal of your masterpiece. We complete the final deep clean, stage custom lighting and decor accents, and present your bespoke home alongside a comprehensive 10-year warranty folder.',
      image: '/images/landing page image.png'
    }
  ];

  const testimonials = [
    {
      quote: "CRESCENT CHIQUE did not just design our penthouse—they crafted a timeless lifestyle statement. The integration of high-end Italian stones and Japandi wood detailing has created a sanctuary we never want to leave.",
      author: "Helena & Marcus Vance",
      location: "Beverly Hills Penthouse",
      rating: "5.0"
    },
    {
      quote: "From the photorealistic 3D VR previews to the meticulous turnkey execution, the professionalism was outstanding. The design concierges kept us updated weekly, making the entire design journey an absolute pleasure.",
      author: "Dr. Alistair Sterling",
      location: "Malibu Oceanfront Estate",
      rating: "5.0"
    },
    {
      quote: "Their attention to custom carpentry detailing and concealed architectural lighting is unmatched. They have successfully blended heritage details with modern luxury to give our townhouse an editorial-grade finish.",
      author: "Julianne Croft",
      location: "Westside Townhouse",
      rating: "5.0"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal font-sans selection:bg-gold selection:text-white overflow-hidden relative">
      <PublicNav />

      {/* CINEMATIC HERO (100vh) */}
      <section className="relative h-[100vh] min-h-[850px] w-full flex flex-col overflow-hidden z-10 pt-[90px]">
        
        {/* Background Image Layer with Zoom */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 15, ease: 'easeOut' }}
        >
          <Image
            src="/images/landing page image.png"
            alt="Crescent Chique Living Chandelier Lounge"
            fill
            priority
            className="object-cover brightness-[0.95]"
          />
        </motion.div>

        {/* OVERLAY SYSTEM (CINEMATIC DEPTH & GRADIENTS) */}
        {/* Layer 1: Left-to-right navy gradient overlay */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none" 
          style={{
            background: 'linear-gradient(90deg, rgba(23,29,40,0.78) 0%, rgba(23,29,40,0.55) 40%, rgba(23,29,40,0.15) 100%)'
          }}
        />

        {/* Layer 2: Gold ambient glow representing soft interior highlights */}
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_70%_35%,rgba(212,175,55,0.15)_0%,rgba(212,175,55,0.01)_60%,transparent_100%)] pointer-events-none" />

        {/* Layer 3: Subtle floating particles */}
        <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
          {particlesArray.map((ptcl) => (
            <motion.div
              key={ptcl.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-gold/25 blur-[0.5px]"
              style={{
                left: ptcl.left,
                top: ptcl.top,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, 10, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.9, 1.2, 0.9]
              }}
              transition={{
                duration: ptcl.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: ptcl.delay,
              }}
            />
          ))}
        </div>

        {/* Layer 4: Soft Vignette for cinematic framing */}
        <div className="absolute inset-0 z-[4] bg-[radial-gradient(circle_at_center,transparent_50%,rgba(23,29,40,0.45)_100%)] pointer-events-none" />

        {/* Faint gold light streaks (Atmosphere Effect) */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-gold/0 via-gold/[0.01] to-gold/0 opacity-30 pointer-events-none" />

        {/* Hero Content Container */}
        <div className={`relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:pl-[48px] flex-1 flex flex-col pb-12 ${
          isShortScreen ? 'justify-start pt-14' : 'justify-center'
        }`}>
          <div className="w-full lg:w-[700px] flex flex-col items-start text-left">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start"
            >
              {/* Rounded Pill Trust Badge */}
              <div 
                className="flex items-center gap-2 mb-6 px-[18px] py-[8px] rounded-full select-none"
                style={{
                  backgroundColor: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)'
                }}
              >
                <span className="text-[#D4AF37] text-xs">★</span>
                <span className="text-[11px] tracking-widest font-semibold text-[#D4AF37]">
                  India's Premium Interior Design Platform
                </span>
              </div>

              {/* Exact Screenshot Typography Heading */}
              <h1 className="font-serif text-[42px] sm:text-[76px] lg:text-[96px] text-white font-medium leading-[1.08] tracking-tight">
                Design Your <span className="font-cormorant italic text-[#D4AF37] font-light tracking-wide text-gold-gradient drop-shadow-[0_2px_15px_rgba(212,175,55,0.25)]">Dream Home</span> <br />
                with Expert Craftsmanship
              </h1>

              {/* Hero Description (Width 650px, Font Size 30px scaled) */}
              <p className="text-sm md:text-xl lg:text-[30px] lg:leading-[44px] font-light max-w-[650px] mt-6 font-sans" style={{ color: 'rgba(255,255,255,0.88)' }}>
                Discover curated interior design packages, get instant quotes, and transform your space with India's most trusted design platform.
              </p>

              {/* Buttons Section with Rounded corners (14px) */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/gallery"
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#1F2937] hover:bg-[#e2c154] rounded-[14px] px-8 py-[18px] text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300 shadow-lg cursor-pointer"
                >
                  Explore Designs <ArrowRight className="h-4.5 w-4.5 ml-0.5 shrink-0" strokeWidth={2.5} />
                </Link>
                <a
                  href="#consultation"
                  className="hover:bg-white/20 hover:text-white rounded-[14px] px-8 py-[18px] text-sm font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300 text-white flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)'
                  }}
                >
                  Get Free Quote
                </a>
              </div>

              {/* Overlapping circular avatars with gold borders */}
              <div className="flex items-center gap-4 mt-8">
                {/* 5 overlapping circular avatars */}
                <div className="flex -space-x-3 select-none">
                  {['PS', 'RM', 'AK', 'SJ', 'MK'].map((initial, i) => (
                    <div 
                      key={i} 
                      className="h-9 w-9 rounded-full border-2 border-[#D4AF37] bg-gradient-to-tr from-[#1F2937] to-[#2E3B4E] text-white flex items-center justify-center font-sans text-[11px] font-bold shadow-lg shrink-0"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                
                {/* Rating details */}
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-0.5 text-[#D4AF37]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-xs">★</span>
                    ))}
                  </div>
                  <span className="text-xs text-white font-medium tracking-wide">
                    1,200+ happy homeowners
                  </span>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Animated Scroll Down Indicator (Chevron Down, White, 60% opacity) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 animate-bounce cursor-pointer z-10">
            <ChevronDown className="h-7 w-7 text-white" strokeWidth={1.5} />
          </div>

        </div>
      </section>

      {/* FEATURED PRESS LOGOS SECTION */}
      <section className="py-12 bg-white/40 border-b border-gold/10 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-wrap justify-between items-center gap-8 text-center text-charcoal/80 font-serif text-lg tracking-widest select-none">
          <span className="hover:text-gold transition-colors duration-300 font-light opacity-75">Architectural Digest</span>
          <span className="hover:text-gold transition-colors duration-300 font-light opacity-75">ELLE DECOR</span>
          <span className="hover:text-gold transition-colors duration-300 font-light opacity-75">INTERIOR DESIGN</span>
          <span className="hover:text-gold transition-colors duration-300 font-light opacity-75">LUXE</span>
          <span className="hover:text-gold transition-colors duration-300 font-light opacity-75">dezeen</span>
        </div>
      </section>

      {/* BEFORE/AFTER TRANSFORMATION SLIDER (Immediately below Hero) */}
      <section className="py-32 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 relative">
          {/* Subtle Glow backdrop behind title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 gold-glow-radial opacity-60 pointer-events-none -z-10" />

          <span className="text-gold tracking-[0.25em] text-xs font-bold uppercase block mb-3">Spatial Evolution</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light leading-tight text-charcoal">Before & After Transformations</h2>
          <p className="text-charcoal/70 text-sm mt-4 leading-relaxed font-sans max-w-md mx-auto">
            Drag the champagne gold handle left and right to reveal the transition from structural blueprints to editorial execution.
          </p>
        </div>

        {/* Drag Slider Panel */}
        <div 
          ref={sliderRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative h-[480px] sm:h-[620px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gold/15 cursor-ew-resize select-none"
        >
          {/* After Image (Full background) */}
          <div className="absolute inset-0">
            <Image
              src="/images/landing page image.png"
              alt="After Professional Custom Execution"
              fill
              priority
              className="object-cover pointer-events-none"
            />
            <div className="absolute bottom-8 right-8 bg-charcoal/95 backdrop-blur border border-gold/20 text-white px-5 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg">
              After Execution
            </div>
          </div>

          {/* Before Image (Left Clipped layer) */}
          <div 
            className="absolute inset-y-0 left-0 overflow-hidden" 
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-y-0 left-0 w-[100vw] h-full">
              <Image
                src="/images/image copy.png"
                alt="Before Blueprint Space"
                fill
                className="object-cover pointer-events-none brightness-75 grayscale-[20%]"
              />
            </div>
            <div className="absolute bottom-8 left-8 bg-charcoal/95 backdrop-blur border border-gold/20 text-white px-5 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg">
              Before Blueprint
            </div>
          </div>

          {/* Slide Divider Bar */}
          <div 
            className="absolute inset-y-0 w-[2px] bg-gold pointer-events-none shadow-[0_0_15px_rgba(212,175,55,0.8)]"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Drag Handle Button */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gold border-2 border-white flex items-center justify-center shadow-xl text-white pointer-events-auto hover:scale-110 active:scale-95 smooth-transition">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <LuxuryDivider />

      {/* FEATURED WORK */}
      <section className="py-32 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="text-gold tracking-[0.25em] text-xs font-bold uppercase block mb-3">Portfolio Curation</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light leading-tight">Featured Residences</h2>
            <p className="text-charcoal/70 text-sm mt-4 leading-relaxed font-sans">
              Explore our curation of award-winning spaces, meticulously engineered from concept renders to final turnkey handovers.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-dark mt-6 md:mt-0 transition-colors"
          >
            Explore Complete Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured Work Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs?.slice(0, 3).map((design, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              key={design.id}
              className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gold/10 hover:border-gold/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image Container with Zoom */}
              <div className="relative h-80 overflow-hidden w-full">
                <Image
                  src={design.image_url}
                  alt={design.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-60" />
                <span className="absolute top-4 left-4 bg-beige-soft/90 backdrop-blur-md text-gold-dark border border-gold/15 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {design.style}
                </span>
              </div>

              {/* Card Contents */}
              <div className="p-8 flex flex-col flex-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold mb-1.5">
                  {design.room_type}
                </span>
                <h3 className="font-serif text-2xl font-light text-charcoal mb-3 group-hover:text-gold transition-colors">
                  {design.title}
                </h3>
                <p className="text-charcoal/60 text-xs leading-relaxed mb-6 font-sans flex-1 line-clamp-3">
                  {design.description}
                </p>

                <div className="flex justify-between items-center pt-5 border-t border-gold/10 mt-auto">
                  <span className="text-sm font-serif font-light text-charcoal/80">
                    Est: <span className="font-semibold font-sans text-gold">₹{design.price_per_sqft}</span> / sqft
                  </span>
                  <Link
                    href={`/gallery`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal group-hover:text-gold transition-colors"
                  >
                    View Project <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <LuxuryDivider />

      {/* DESIGN JOURNEY (Horizontal Timeline) */}
      <section className="py-32 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 gold-glow-radial opacity-60 pointer-events-none -z-10" />

          <span className="text-gold tracking-[0.25em] text-xs font-bold uppercase block mb-3">Our Methodology</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-charcoal">The Design Journey</h2>
          <p className="text-charcoal/70 text-sm mt-4 leading-relaxed font-sans">
            A seamless, transparent roadmap from the initial consult to the styled handover of your bespoke estate.
          </p>
        </div>

        {/* Interactive Steps Horizontal Row */}
        <div className="relative flex flex-col items-center gap-12 w-full mb-12">
          {/* Champagne Gold Progression Line */}
          <div className="absolute top-8 left-10 right-10 h-[2px] bg-gold/10 hidden md:block z-0">
            <div 
              className="bg-gold h-full smooth-transition shadow-[0_0_8px_rgba(212,175,55,0.5)]" 
              style={{ width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Timeline Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-6 w-full gap-6 relative z-10">
            {journeySteps.map((stepItem, idx) => {
              const isSelected = idx === activeStep;
              return (
                <button
                  key={stepItem.step}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center group focus:outline-none cursor-pointer"
                >
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center border smooth-transition shadow-sm ${
                    isSelected 
                      ? 'bg-gold border-gold text-white scale-110 shadow-gold/30' 
                      : 'bg-white border-gold/15 text-gold-dark hover:border-gold/50'
                  }`}>
                    <span className="font-serif text-xs font-semibold">{stepItem.step.replace('Step ', '')}</span>
                  </div>
                  <h4 className={`mt-3 font-serif text-sm font-medium transition-colors ${isSelected ? 'text-gold-dark' : 'text-charcoal/80 group-hover:text-gold'}`}>
                    {stepItem.title}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Card Presentation */}
        <div className="bg-white/70 glass-card rounded-[2.5rem] border border-gold/15 p-8 sm:p-12 shadow-xl relative min-h-[420px] overflow-hidden">
          <EditorialAccent position="top-left" />
          <EditorialAccent position="bottom-right" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Step Details Column */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-gold-dark font-semibold text-lg tracking-wider">
                    {journeySteps[activeStep].step}
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <span className="font-serif italic font-light text-charcoal/50 text-sm">
                    Duration: {journeySteps[activeStep].duration}
                  </span>
                </div>

                <h3 className="font-serif text-3xl font-light text-charcoal">
                  {journeySteps[activeStep].title}
                </h3>

                <p className="text-charcoal/70 text-xs leading-relaxed font-sans">
                  {journeySteps[activeStep].description}
                </p>

                <div className="bg-beige-soft/50 rounded-2xl p-5 border border-gold/10 flex flex-col gap-2 mt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gold">Key Deliverables</span>
                  <span className="font-serif text-xs font-light text-charcoal/90 leading-relaxed">
                    {journeySteps[activeStep].deliverables}
                  </span>
                </div>
              </div>

              {/* Step Image Column */}
              <div className="lg:col-span-6 relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-md border border-gold/10">
                <Image
                  src={journeySteps[activeStep].image}
                  alt={journeySteps[activeStep].title}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <LuxuryDivider />

      {/* EDITORIAL TESTIMONIALS */}
      <section className="py-32 bg-charcoal text-white/90 w-full relative overflow-hidden z-10">
        {/* Subtle Background Accent Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
          <GoldPattern />
        </div>

        {/* Ambient Gold Radial Glow backdrop behind content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center relative z-10">
          <span className="text-gold tracking-[0.25em] text-xs font-bold uppercase block mb-4">Client Appreciations</span>
          
          <Quote className="h-12 w-12 text-gold/30 mb-8" strokeWidth={1} />

          <div className="min-h-[220px] sm:min-h-[160px] flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-6"
              >
                <p className="font-cormorant italic font-light text-2xl sm:text-3xl leading-relaxed text-white/95 max-w-4xl">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-serif text-sm font-semibold text-gold-gradient tracking-wide">
                    {testimonials[activeTestimonial].author}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/50">
                    {testimonials[activeTestimonial].location}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial Nav Arrows */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={prevTestimonial}
              className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SEAMLESS BOOKING CONSULTATION CTA */}
      <section id="consultation" className="py-32 max-w-4xl mx-auto px-6 sm:px-8 w-full relative z-10">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 border border-gold/20 shadow-2xl relative overflow-hidden bg-white/40">
          <EditorialAccent position="top-left" />
          <EditorialAccent position="bottom-right" />
          
          <div className="text-center max-w-lg mx-auto mb-10">
            <span className="text-gold tracking-[0.25em] text-xs font-bold uppercase flex justify-center gap-2 items-center">
              <Calendar className="h-4 w-4" /> Concierge Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl mt-4 font-light text-charcoal">Schedule Consultation</h2>
            <p className="text-charcoal/70 text-xs mt-3 leading-relaxed font-sans">
              Enter your preferred details. A representative will contact you immediately to lock in the private designer blueprint session.
            </p>
          </div>

          <form onSubmit={handleBook} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-charcoal/60">Consultation Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl border border-gold/15 bg-white/70 px-4 py-3.5 text-xs outline-none focus:border-gold focus:ring-1 focus:ring-gold smooth-transition font-sans"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-charcoal/60">Preferred Time Slot</label>
                <input
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-xl border border-gold/15 bg-white/70 px-4 py-3.5 text-xs outline-none focus:border-gold focus:ring-1 focus:ring-gold smooth-transition font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-charcoal/60">Spatial Requirements</label>
              <textarea
                placeholder="Describe your design specifications (e.g. Modern Japandi master bedroom, marble flooring, structural layout revisions...)"
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-xl border border-gold/15 bg-white/70 px-4 py-3.5 text-xs outline-none focus:border-gold focus:ring-1 focus:ring-gold smooth-transition resize-none font-sans"
              />
            </div>

            {bookingError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg font-sans">
                ⚠️ {bookingError}
                <div className="mt-1.5 font-semibold">
                  Please <Link href="/login" className="underline hover:text-red-800">log in as a customer</Link> to submit bookings.
                </div>
              </div>
            )}

            {bookingSuccess && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg font-sans">
                ✓ Consultation booked successfully! You can view this inside your portal dashboard.
              </div>
            )}

            <button
              type="submit"
              disabled={bookingMutation.isPending}
              className="w-full py-4.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-102 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {bookingMutation.isPending ? 'Scheduling slot...' : 'Schedule Design Slot'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

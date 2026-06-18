'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Compass, 
  ArrowLeft, 
  Calculator, 
  Layers, 
  DollarSign, 
  FileText, 
  CalendarDays,
  Grid
} from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';
import { designService, Design } from '@/services/designs';
import { quotationService, QuotationEstimation } from '@/services/quotations';

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Active picture slideshow state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Estimator Form states
  const [area, setArea] = useState<number>(1000);
  const [grade, setGrade] = useState<'Economy' | 'Premium' | 'Luxury'>('Premium');
  const [estimationResult, setEstimationResult] = useState<QuotationEstimation | null>(null);
  const [estimationError, setEstimationError] = useState('');

  // Fetch design details
  const { data: design, isLoading, isError } = useQuery<Design>({
    queryKey: ['design', id],
    queryFn: () => designService.getDesignDetails(id),
  });

  // Quotation estimation mutation
  const estimateMutation = useMutation({
    mutationFn: (data: { design_id: string; area_sqft: number; material_grade: 'Economy' | 'Premium' | 'Luxury' }) =>
      quotationService.generateEstimation(data),
    onSuccess: (data) => {
      setEstimationResult(data);
      setEstimationError('');
    },
    onError: (err: any) => {
      setEstimationError(err || 'Failed to calculate estimation');
    },
  });

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || area <= 0) {
      setEstimationError('Please enter a valid positive area.');
      return;
    }
    estimateMutation.mutate({
      design_id: id,
      area_sqft: area,
      material_grade: grade,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
        <PublicNav />
        <div className="flex-1 py-32 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Fetching Design Concept...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !design) {
    return (
      <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
        <PublicNav />
        <div className="flex-1 max-w-md mx-auto py-32 px-4 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h3 className="font-serif text-lg font-semibold mb-2">Design Concept Not Found</h3>
            <p className="text-xs">The design spec might have been archived or deleted.</p>
            <Link href="/gallery" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gold hover:text-gold-dark">
              <ArrowLeft className="h-4 w-4" /> Back to Gallery
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = design.images || [
    { id: 'primary', image_url: design.image_url, is_primary: true }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Back Link */}
        <Link href="/gallery" className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-charcoal/70 hover:text-gold mb-8 smooth-transition">
          <ArrowLeft className="h-4 w-4" /> Back to Design Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Image Slideshow & Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Active Image Frame */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gold/15 bg-white">
              <Image
                src={allImages[activeImageIndex]?.image_url}
                alt={design.title}
                fill
                className="object-cover transition-all duration-500"
              />
            </div>

            {/* Sub-Images Carousel Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 smooth-transition shrink-0 cursor-pointer ${
                      activeImageIndex === index ? 'border-gold scale-95 shadow-md' : 'border-transparent hover:border-gold/50'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Design Spec Description */}
            <div className="bg-white/40 glass-card rounded-2xl p-6 sm:p-8 mt-4">
              <span className="text-gold tracking-[0.2em] text-[10px] font-bold uppercase">Concept & philosophy</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-4">Design Narrative</h2>
              <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line">
                {design.description}
              </p>
            </div>
          </div>

          {/* RIGHT: Specs Table & Estimator */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Spec Card */}
            <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
              <h1 className="font-serif text-3xl font-semibold tracking-tight">{design.title}</h1>
              
              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gold/10 pt-4 text-xs">
                <div>
                  <span className="text-charcoal/50 block font-medium">Room Typology</span>
                  <span className="font-semibold text-charcoal/90 mt-0.5 block">{design.room_type}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block font-medium">Design Style</span>
                  <span className="font-semibold text-charcoal/90 mt-0.5 block">{design.style}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block font-medium">Base Price Estimate</span>
                  <span className="font-serif font-bold text-gold text-sm mt-0.5 block">₹{design.price_per_sqft} / sqft</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block font-medium">Estimated Timeline</span>
                  <span className="font-semibold text-charcoal/90 mt-0.5 block">6-10 Weeks</span>
                </div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-xl font-semibold">Cost Breakdown Estimator</h3>
              </div>
              <p className="text-charcoal/70 text-[11px] leading-relaxed mb-6">
                Calculate estimated pricing on-the-fly. Choose your approximate square footage area and material grade tier.
              </p>

              <form onSubmit={handleEstimate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Area Space (sqft)</label>
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Material Grade Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Economy', 'Premium', 'Luxury'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setGrade(tier)}
                        className={`py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider border cursor-pointer smooth-transition ${
                          grade === tier 
                            ? 'bg-gold border-gold text-white' 
                            : 'border-gold/20 bg-white/30 text-charcoal/80 hover:bg-gold/5'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {estimationError && (
                  <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    ⚠️ {estimationError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={estimateMutation.isPending}
                  className="w-full py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gold smooth-transition cursor-pointer"
                >
                  {estimateMutation.isPending ? 'Calculating...' : 'Generate Estimate Breakdown'}
                </button>
              </form>

              {/* Dynamic Cost breakdown reveal */}
              {estimationResult && (
                <div className="mt-6 border-t border-gold/15 pt-5 flex flex-col gap-2.5 text-xs">
                  <h4 className="font-semibold text-charcoal/70 uppercase text-[10px] tracking-wider mb-2">Estimated Costs Breakdown</h4>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Design Consultation Fees</span>
                    <span className="font-semibold text-charcoal/90">₹{estimationResult.design_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Estimated Material Cost</span>
                    <span className="font-semibold text-charcoal/90">₹{estimationResult.material_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Estimated Labour Cost</span>
                    <span className="font-semibold text-charcoal/90">₹{estimationResult.labour_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">GST (18%)</span>
                    <span className="font-semibold text-charcoal/90">₹{estimationResult.tax_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gold/15 mt-2 pt-2 text-sm">
                    <span className="font-semibold text-charcoal">Total Budget Estimate</span>
                    <span className="font-serif font-bold text-gold text-base">₹{estimationResult.total_amount.toLocaleString()}</span>
                  </div>

                  <div className="mt-4 bg-gold/5 p-3 rounded-lg border border-gold/15 text-[10px] text-charcoal/80 leading-relaxed">
                    💡 <strong>Save this quotation:</strong> Log in to your Customer Portal to save estimations, request layout changes, download PDF printouts, and start project tracking.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

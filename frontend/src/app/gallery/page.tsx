'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import PublicNav from '@/components/public-nav';
import Footer from '@/components/footer';
import { designService, Design } from '@/services/designs';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch designs with query caching & background refetch
  const { data: designs = [], isLoading, isError } = useQuery<Design[]>({
    queryKey: ['designs'],
    queryFn: designService.getDesigns,
  });

  const categories = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Office', 'Commercial'];

  const filteredDesigns = designs.filter((design) => {
    const matchesCategory = activeFilter === 'All' || design.room_type === activeFilter;
    const matchesSearch = 
      design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-beige-soft text-charcoal">
      <PublicNav />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gold/15 pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-gold tracking-[0.2em] text-xs font-bold uppercase">Design Portfolio</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold">Luxury Interior Showcases</h1>
            <p className="text-charcoal/70 text-sm max-w-lg mt-2">
              Browse through our conceptual renderings and executed spaces. Filter by room typology or search specific materials and details.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search wood, marble, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gold/25 bg-white/40 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-charcoal/40" />
          </div>
        </div>

        {/* Filter categories tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-none">
          <SlidersHorizontal className="h-4 w-4 text-gold shrink-0 mr-2" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider smooth-transition whitespace-nowrap cursor-pointer ${
                activeFilter === cat 
                  ? 'bg-gold text-white shadow-md shadow-gold/20' 
                  : 'bg-white/40 hover:bg-gold/10 text-charcoal/80 border border-gold/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Screen */}
        {isLoading && (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            <p className="text-xs text-gold font-semibold tracking-widest uppercase">Curating Portfolio...</p>
          </div>
        )}

        {/* Error Screen */}
        {isError && (
          <div className="py-24 text-center text-xs text-red-600 bg-red-50/50 border border-red-200/50 rounded-xl p-8 max-w-md mx-auto">
            Failed to pull portfolio items. Please check local database connection or try again.
          </div>
        )}

        {/* Pinterest Masonry Grid */}
        {!isLoading && !isError && (
          <>
            {filteredDesigns.length === 0 ? (
              <div className="py-24 text-center text-sm text-charcoal/60 bg-white/30 rounded-2xl border border-gold/10">
                No design layouts match your search filters.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 gap-6 w-full">
                <AnimatePresence mode="popLayout">
                  {filteredDesigns.map((design, idx) => (
                    <motion.div
                      key={design.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="masonry-item break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden shadow-lg border border-gold/10 bg-white"
                    >
                      <Link href={`/gallery/${design.id}`}>
                        {/* Image layout container */}
                        <div className="relative aspect-[3/4] sm:aspect-square md:aspect-[4/5] w-full overflow-hidden">
                          <Image
                            src={design.image_url}
                            alt={design.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                          {/* Rich hover visual elements */}
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6" />
                        </div>

                        {/* Title details */}
                        <div className="p-5 flex flex-col gap-1 bg-white relative">
                          <span className="text-[10px] uppercase text-gold tracking-widest font-semibold flex items-center justify-between">
                            {design.room_type} • {design.style}
                            <ArrowUpRight className="h-4.5 w-4.5 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold smooth-transition mt-0.5">
                            {design.title}
                          </h3>
                          <p className="text-[11px] text-charcoal/60 line-clamp-2 mt-1 leading-relaxed">
                            {design.description}
                          </p>
                          <div className="border-t border-gold/10 mt-3 pt-3 flex justify-between items-center text-[10px] uppercase tracking-wider text-charcoal/50">
                            <span>Estimated Budget</span>
                            <span className="font-semibold text-gold font-serif text-xs">₹{design.price_per_sqft}/sqft</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

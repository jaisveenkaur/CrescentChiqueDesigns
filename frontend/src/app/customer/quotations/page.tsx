'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, FileText, Download, RefreshCw, Printer, Coins } from 'lucide-react';
import { quotationService, Quotation } from '@/services/quotations';

export default function CustomerQuotations() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch customer's saved quotations
  const { data: quotesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customerQuotations'],
    queryFn: () => quotationService.getQuotations(),
  });

  const handleDownloadPdf = async (id: string) => {
    try {
      setDownloadingId(id);
      const blob = await quotationService.getQuotationPdfBlob(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download quotation PDF', err);
      alert('Could not download PDF quotation. Please check local service configurations.');
    } finally {
      setDownloadingId(null);
    }
  };

  const quotations = quotesData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Estimates
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Quotation History</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Review saved cost estimations, and download official PDF copies.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Fetching Saved Sheets...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center max-w-md mx-auto">
          Failed to load quotation records.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-6">
          {quotations.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              No saved quotations found. Calculate and save estimators on the design portfolio views to generate entries here.
            </div>
          ) : (
            quotations.map((quote) => (
              <div 
                key={quote.id}
                className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/10 shadow-sm flex flex-col gap-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-gold tracking-widest">
                      Quotation ID • {quote.id}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-charcoal">
                      Estimate for {quote.area_sqft} sqft Space
                    </h3>
                    <p className="text-[10px] text-charcoal/50">
                      Calculated on {new Date(quote.created_at).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-gold/10 text-gold border border-gold/30 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {quote.material_grade} Grade
                    </span>
                    <button
                      onClick={() => handleDownloadPdf(quote.id)}
                      disabled={downloadingId === quote.id}
                      className="inline-flex items-center gap-1.5 bg-charcoal text-white hover:bg-gold px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloadingId === quote.id ? 'Saving...' : 'Download PDF'}
                    </button>
                  </div>
                </div>

                {/* Costs details breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/40 p-4 rounded-xl border border-gold/5 text-xs text-charcoal/70">
                  <div>
                    <span className="text-charcoal/40 font-medium block">Design Cost</span>
                    <span className="font-semibold block mt-0.5">${quote.design_cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-charcoal/40 font-medium block">Material Cost</span>
                    <span className="font-semibold block mt-0.5">${quote.material_cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-charcoal/40 font-medium block">Labour Cost</span>
                    <span className="font-semibold block mt-0.5">${quote.labour_cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-charcoal/40 font-medium block">GST (18%)</span>
                    <span className="font-semibold block mt-0.5">${quote.tax_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total row */}
                <div className="border-t border-gold/10 pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
                    <Coins className="h-4 w-4 text-gold" /> Estimated Net Budget
                  </div>
                  <div className="font-serif font-bold text-gold text-xl sm:text-2xl">
                    ${quote.total_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, FileText, Download, Trash2, RotateCcw, RefreshCw, Calculator, Coins } from 'lucide-react';
import { quotationService, Quotation, QuotationEstimation } from '@/services/quotations';
import { designService, Design } from '@/services/designs';

export default function AdminQuotations() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Estimator State
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [area, setArea] = useState<number>(1000);
  const [grade, setGrade] = useState<'Economy' | 'Premium' | 'Luxury'>('Premium');
  const [estimationResult, setEstimationResult] = useState<QuotationEstimation | null>(null);
  const [estimationError, setEstimationError] = useState('');

  // Fetch designs list for the estimator dropdown
  const { data: designs = [] } = useQuery<Design[]>({
    queryKey: ['adminDesignsList'],
    queryFn: designService.getDesigns,
  });

  // Fetch quotations list
  const { data: quotesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminQuotations'],
    queryFn: () => quotationService.getQuotations(),
  });

  // Estimate mutation
  const estimateMutation = useMutation({
    mutationFn: (data: { design_id: string; area_sqft: number; material_grade: 'Economy' | 'Premium' | 'Luxury' }) =>
      quotationService.generateEstimation(data),
    onSuccess: (data) => {
      setEstimationResult(data);
      setEstimationError('');
    },
    onError: (err: any) => {
      setEstimationError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to calculate estimation');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotationService.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuotations'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => quotationService.restoreQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuotations'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignId) {
      setEstimationError('Please select a design layout concept.');
      return;
    }
    if (!area || area <= 0) {
      setEstimationError('Please enter a valid positive area.');
      return;
    }
    estimateMutation.mutate({
      design_id: selectedDesignId,
      area_sqft: area,
      material_grade: grade,
    });
  };

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
      alert('Could not download PDF quotation. Verify local service configurations.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to logically delete this quotation?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const quotations = quotesData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Finance
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Quotations Hub</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Review saved pricing estimations, calculate on-the-fly custom models, and audit physical PDFs.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Quick calculator */}
        <div className="lg:col-span-5 bg-white/50 glass-card rounded-2xl p-6 border border-gold/15 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg font-semibold">Estimate Costings</h3>
          </div>

          <form onSubmit={handleEstimate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Select Design Concept</label>
              <select
                required
                value={selectedDesignId}
                onChange={(e) => setSelectedDesignId(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              >
                <option value="">Choose Concept...</option>
                {designs.map(d => (
                  <option key={d.id} value={d.id}>{d.title} (${d.price_per_sqft}/sqft)</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
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

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Material Grade Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Economy', 'Premium', 'Luxury'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setGrade(tier)}
                    className={`py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider border cursor-pointer smooth-transition ${
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
              <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                ⚠️ {estimationError}
              </div>
            )}

            <button
              type="submit"
              disabled={estimateMutation.isPending}
              className="w-full py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gold smooth-transition cursor-pointer"
            >
              {estimateMutation.isPending ? 'Calculating...' : 'Generate Estimate'}
            </button>
          </form>

          {estimationResult && (
            <div className="mt-6 border-t border-gold/15 pt-5 flex flex-col gap-2.5 text-xs">
              <h4 className="font-semibold text-charcoal/70 uppercase text-[9px] tracking-wider mb-1">Costs Breakdown Renders</h4>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Design Fees</span>
                <span className="font-semibold text-charcoal/90">${estimationResult.design_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Material Estimate</span>
                <span className="font-semibold text-charcoal/90">${estimationResult.material_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Labour Estimate</span>
                <span className="font-semibold text-charcoal/90">${estimationResult.labour_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">GST (18%)</span>
                <span className="font-semibold text-charcoal/90">${estimationResult.tax_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gold/15 mt-2 pt-2 text-sm">
                <span className="font-semibold text-charcoal">Total Price</span>
                <span className="font-serif font-bold text-gold text-base">${estimationResult.total_amount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Quotations History */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-serif text-lg font-semibold mb-2">Saved Quotation Records</h3>

          {isLoading && (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Loading sheets...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">
              Failed to pull saved quotation records.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex flex-col gap-4">
              {quotations.length === 0 ? (
                <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                  No saved client sheets found in database files.
                </div>
              ) : (
                quotations.map((quote) => (
                  <div 
                    key={quote.id}
                    className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-gold font-bold">Quotation Sheet</span>
                        <h4 className="font-serif text-base font-semibold text-charcoal/90 mt-0.5">
                          ID: {quote.id.substr(0, 8)}... for Client {quote.customer_id.substr(0, 8)}...
                        </h4>
                        <p className="text-[10px] text-charcoal/50 mt-0.5">
                          {quote.area_sqft} sqft • {quote.material_grade} Grade • Total: <strong className="text-gold font-serif text-xs">${quote.total_amount.toLocaleString()}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPdf(quote.id)}
                          disabled={downloadingId === quote.id}
                          className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                          title="Download PDF Copy"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRestore(quote.id)}
                          className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                          title="Restore Record"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 border border-red-100 hover:border-red-600 text-red-600 rounded-lg hover:bg-red-50 smooth-transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

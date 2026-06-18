'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, RefreshCw, Coins, X, Printer, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { quotationService, Quotation } from '@/services/quotations';
import { Logo } from '@/components/brand';

export default function CustomerQuotations() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Quotation | null>(null);
  const [clientName, setClientName] = useState('Elite Customer');
  const [clientEmail, setClientEmail] = useState('jaisveen@gmail.com');

  useEffect(() => {
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    if (name) setClientName(name);
    if (email) setClientEmail(email);
  }, []);

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
      a.download = `invoice_${id}.pdf`;
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

  const handlePrint = () => {
    window.print();
  };

  const quotations = quotesData?.items || [];

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Estimates & Billing
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Quotation & Invoice History</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Review saved cost estimations, analyze budget distributions, and view official invoices.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Fetching Billing Sheets...</p>
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
              No saved quotations or invoices found. Calculate and save estimators on the design portfolio views to generate entries here.
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
                      Quotation ID • {quote.id.substring(0, 18)}...
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

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-gold/10 text-gold border border-gold/30 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {quote.material_grade} Grade
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(quote)}
                      className="inline-flex items-center gap-1.5 border border-gold/25 text-gold hover:bg-gold/5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition cursor-pointer"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      View Invoice
                    </button>
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

                {/* Budget Distribution Visualizer */}
                <div className="flex flex-col gap-2 border-t border-gold/10 pt-4">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 tracking-wider">
                    Budget Distribution
                  </span>
                  
                  {/* Stacked Percentage Bar */}
                  <div className="h-3.5 w-full rounded-full bg-beige-dark overflow-hidden flex shadow-inner border border-gold/10">
                    <div 
                      className="bg-[#C9A36B] h-full transition-all duration-500 hover:brightness-105" 
                      style={{ width: `${(quote.design_cost / quote.total_amount) * 100}%` }}
                      title={`Design Cost: ₹${quote.design_cost.toLocaleString()} (${((quote.design_cost / quote.total_amount) * 100).toFixed(1)}%)`}
                    />
                    <div 
                      className="bg-[#D4AF37] h-full transition-all duration-500 hover:brightness-105" 
                      style={{ width: `${(quote.material_cost / quote.total_amount) * 100}%` }}
                      title={`Material Cost: ₹${quote.material_cost.toLocaleString()} (${((quote.material_cost / quote.total_amount) * 100).toFixed(1)}%)`}
                    />
                    <div 
                      className="bg-[#1F2937] h-full transition-all duration-500 hover:brightness-105" 
                      style={{ width: `${(quote.labour_cost / quote.total_amount) * 100}%` }}
                      title={`Labour Cost: ₹${quote.labour_cost.toLocaleString()} (${((quote.labour_cost / quote.total_amount) * 100).toFixed(1)}%)`}
                    />
                    <div 
                      className="bg-[#E6C687] h-full transition-all duration-500 hover:brightness-105" 
                      style={{ width: `${(quote.tax_amount / quote.total_amount) * 100}%` }}
                      title={`GST (18%): ₹${quote.tax_amount.toLocaleString()} (${((quote.tax_amount / quote.total_amount) * 100).toFixed(1)}%)`}
                    />
                  </div>

                  {/* Dynamic Percentage Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-charcoal/60 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#C9A36B] shrink-0" />
                      <span>Design: {((quote.design_cost / quote.total_amount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#D4AF37] shrink-0" />
                      <span>Material: {((quote.material_cost / quote.total_amount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#1F2937] shrink-0" />
                      <span>Labour: {((quote.labour_cost / quote.total_amount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#E6C687] shrink-0" />
                      <span>GST: {((quote.tax_amount / quote.total_amount) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Total Net Budget row */}
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

      {/* Invoice Modal Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-md print:bg-white print:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-beige-soft rounded-3xl w-full max-w-2xl border border-gold/15 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-y-auto max-h-[90vh] print:border-none print:shadow-none print:max-h-full print:rounded-none"
            >
              {/* Gold wax/foil paid seal */}
              <div className="absolute top-6 right-16 border-2 border-emerald-600/30 text-emerald-600/80 rounded-lg px-3 py-1.5 text-[10px] tracking-widest font-extrabold rotate-12 select-none uppercase print:border-emerald-600">
                Concierge Approved
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-6 right-6 p-1.5 rounded-full border border-gold/10 hover:border-gold/40 text-charcoal/60 hover:text-charcoal smooth-transition cursor-pointer print:hidden animate-none"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Invoice Logo & Meta header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-gold/15 pb-6">
                <div className="flex flex-col gap-2">
                  <Logo variant="dark" className="bg-[#171d28] p-3.5 rounded-xl text-white inline-flex" />
                  <span className="text-[10px] text-charcoal/50 mt-1 block">
                    Crescent Chique Designs Private Ltd.<br />
                    Nariman Point Offices, Mumbai, IN
                  </span>
                </div>
                <div className="text-left sm:text-right flex flex-col gap-1 sm:mt-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Official Invoice</span>
                  <span className="text-lg font-serif font-semibold text-charcoal">
                    INV-CC-{selectedInvoice.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-charcoal/50">
                    Invoice Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-charcoal/50">
                    Due Date: {new Date(new Date(selectedInvoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Bill Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-charcoal/40 font-bold uppercase text-[9px] tracking-wider">Billed To</span>
                  <span className="font-semibold text-charcoal text-sm">{clientName}</span>
                  <span className="text-charcoal/60">{clientEmail}</span>
                  <span className="text-charcoal/40 italic">Valued Premium Client</span>
                </div>
                <div className="flex flex-col gap-1 sm:text-right">
                  <span className="text-charcoal/40 font-bold uppercase text-[9px] tracking-wider">Project Scope</span>
                  <span className="font-semibold text-charcoal">Luxury Interior Architecture</span>
                  <span className="text-charcoal/60">Material Grade: {selectedInvoice.material_grade} Grade</span>
                  <span className="text-charcoal/60">Estimated Area: {selectedInvoice.area_sqft} sqft</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-charcoal/40 font-bold uppercase text-[9px] tracking-wider">Itemized Services Breakdown</span>
                <div className="border border-gold/10 rounded-xl overflow-hidden text-xs">
                  {/* Table Header */}
                  <div className="bg-beige-dark/50 grid grid-cols-12 p-3 font-semibold text-charcoal border-b border-gold/10">
                    <div className="col-span-8">Service Description</div>
                    <div className="col-span-4 text-right">Estimated Amount</div>
                  </div>
                  {/* Table Rows */}
                  <div className="divide-y divide-gold/5 bg-white/40">
                    <div className="grid grid-cols-12 p-3 text-charcoal/80">
                      <div className="col-span-8">
                        <span className="font-medium block">Spatial Concept Design & Consultations</span>
                        <span className="text-[10px] text-charcoal/50 block">Architectural layouts, 3D renderings, moodboards & site audits.</span>
                      </div>
                      <div className="col-span-4 text-right self-center">${selectedInvoice.design_cost.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 p-3 text-charcoal/80">
                      <div className="col-span-8">
                        <span className="font-medium block">Material & Procurement Specifications</span>
                        <span className="text-[10px] text-charcoal/50 block">Premium Greek marble slabs, veneer panelling, and customized hardware.</span>
                      </div>
                      <div className="col-span-4 text-right self-center">${selectedInvoice.material_cost.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 p-3 text-charcoal/80">
                      <div className="col-span-8">
                        <span className="font-medium block">Construction Labor & Project Management</span>
                        <span className="text-[10px] text-charcoal/50 block">Certified carpentry works, civil customizations & turnkey installations.</span>
                      </div>
                      <div className="col-span-4 text-right self-center">${selectedInvoice.labour_cost.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 p-3 text-charcoal/80 bg-beige-dark/10">
                      <div className="col-span-8">
                        <span className="font-medium block">Goods & Services Tax (GST 18%)</span>
                        <span className="text-[10px] text-charcoal/50 block">Statutory central & state taxation on construction contracts.</span>
                      </div>
                      <div className="col-span-4 text-right self-center">${selectedInvoice.tax_amount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-end border-t border-gold/15 pt-4">
                <div className="flex flex-col gap-1 text-[10px] text-charcoal/50">
                  <p>Bank: HDFC Bank Private Banking</p>
                  <p>A/C: 502000847291 • IFSC: HDFC0000109</p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs uppercase font-bold text-charcoal/40">Grand Total Net Budget</span>
                  <span className="font-serif font-extrabold text-gold text-2xl">
                    ${selectedInvoice.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Modal Buttons (Actions) */}
              <div className="flex justify-end gap-3 mt-4 print:hidden border-t border-gold/10 pt-4">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 border border-gold/20 text-gold hover:bg-gold/5 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice.id)}
                  disabled={downloadingId === selectedInvoice.id}
                  className="inline-flex items-center gap-1.5 bg-charcoal text-white hover:bg-gold px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider smooth-transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === selectedInvoice.id ? 'Saving...' : 'Download PDF'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

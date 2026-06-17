'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  Trash2, 
  RotateCcw, 
  RefreshCw, 
  Calculator, 
  Coins, 
  Plus, 
  Edit3, 
  X, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';
import { quotationService, Quotation, QuotationEstimation } from '@/services/quotations';
import { designService, Design } from '@/services/designs';
import { api } from '@/services/api';

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminQuotations() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Estimator Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [area, setArea] = useState<number>(1000);
  const [grade, setGrade] = useState<'Economy' | 'Premium' | 'Luxury'>('Premium');
  const [quoteStatus, setQuoteStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [estimationResult, setEstimationResult] = useState<QuotationEstimation | null>(null);
  
  // Errors & Success
  const [estimationError, setEstimationError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [editFormData, setEditFormData] = useState({
    customer_id: '',
    design_id: '',
    area_sqft: 0,
    material_grade: 'Premium' as 'Economy' | 'Premium' | 'Luxury',
    status: 'pending' as 'pending' | 'accepted' | 'rejected'
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Fetch designs list
  const { data: designs = [] } = useQuery<Design[]>({
    queryKey: ['adminDesignsList'],
    queryFn: designService.getDesigns,
  });

  // Fetch customers list
  const { data: customers = [] } = useQuery<CustomerOption[]>({
    queryKey: ['adminCustomersForQuotes'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  // Fetch quotations list
  const { data: quotesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminQuotations'],
    queryFn: () => quotationService.getQuotations({ per_page: 1000 }),
  });

  // Highlight or focus on calculator if ?create=true query parameter is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      const el = document.getElementById('estimator-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  // Estimate mutation
  const estimateMutation = useMutation({
    mutationFn: (data: { design_id: string; area_sqft: number; material_grade: 'Economy' | 'Premium' | 'Luxury' }) =>
      quotationService.generateEstimation(data),
    onSuccess: (data) => {
      setEstimationResult(data);
      setEstimationError('');
      setSaveSuccess(false);
    },
    onError: (err: any) => {
      setEstimationError(err.response?.data?.error || err.message || 'Failed to calculate estimation');
    },
  });

  // Save quotation mutation
  const saveQuotationMutation = useMutation({
    mutationFn: quotationService.saveQuotation,
    onSuccess: () => {
      setSaveSuccess(true);
      setEstimationResult(null);
      setSelectedCustomerId('');
      setSelectedDesignId('');
      setArea(1000);
      setGrade('Premium');
      setQuoteStatus('pending');
      queryClient.invalidateQueries({ queryKey: ['adminQuotations'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err: any) => {
      setEstimationError(err.response?.data?.error || err.message || 'Failed to save quotation');
    }
  });

  // Edit quotation mutation
  const editQuotationMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => quotationService.editQuotation(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuotations'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsEditOpen(false);
      setSelectedQuote(null);
    },
    onError: (err: any) => {
      setEditError(err.response?.data?.error || err.message || 'Failed to update quotation');
    }
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

  const handleEstimateOnly = (e: React.FormEvent) => {
    e.preventDefault();
    setEstimationError('');
    setSaveSuccess(false);
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

  const handleSaveQuotation = () => {
    setEstimationError('');
    if (!selectedCustomerId) {
      setEstimationError('You must assign a customer profile to save this quotation.');
      return;
    }
    if (!selectedDesignId || !area) return;
    saveQuotationMutation.mutate({
      design_id: selectedDesignId,
      area_sqft: area,
      material_grade: grade,
      customer_id: selectedCustomerId,
      status: quoteStatus
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

  const openEditModal = (quote: Quotation) => {
    setSelectedQuote(quote);
    setEditFormData({
      customer_id: quote.customer_id,
      design_id: quote.design_id || '',
      area_sqft: quote.area_sqft,
      material_grade: quote.material_grade,
      status: (quote as any).status || 'pending'
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setEditError(null);
    editQuotationMutation.mutate({
      id: selectedQuote.id,
      data: editFormData
    });
  };

  const getCustomerName = (id: string) => {
    const cust = customers.find(c => c.id === id);
    return cust ? cust.name : `ID: ${id.substring(0, 8)}...`;
  };

  const getDesignTitle = (id?: string | null) => {
    if (!id) return 'Custom Layout Concept';
    const des = designs.find(d => d.id === id);
    return des ? des.title : 'Custom Concept';
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
        <div id="estimator-panel" className="lg:col-span-5 bg-white/50 glass-card rounded-2xl p-6 border border-gold/15 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg font-semibold">Estimate Costings</h3>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl mb-4 font-bold flex items-center gap-2">
              ✓ Quotation saved to client portfolio successfully!
            </div>
          )}

          <form onSubmit={handleEstimateOnly} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Assign Customer Account</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition cursor-pointer text-charcoal"
              >
                <option value="">Choose Profile (Optional to Calculate, Required to Save)...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Select Design Concept</label>
              <select
                required
                value={selectedDesignId}
                onChange={(e) => setSelectedDesignId(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition cursor-pointer"
              >
                <option value="">Choose Concept...</option>
                {designs.map(d => (
                  <option key={d.id} value={d.id}>{d.title} (₹{d.price_per_sqft}/sqft)</option>
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

            {selectedCustomerId && (
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Default Status Status</label>
                <select
                  value={quoteStatus}
                  onChange={(e) => setQuoteStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition cursor-pointer"
                >
                  <option value="pending">pending (Client review required)</option>
                  <option value="accepted">accepted (Direct layout bypass)</option>
                  <option value="rejected">rejected (Archived proposal)</option>
                </select>
              </div>
            )}

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
              {estimateMutation.isPending ? 'Calculating...' : 'Generate Estimate Breakdown'}
            </button>
          </form>

          {estimationResult && (
            <div className="mt-6 border-t border-gold/15 pt-5 flex flex-col gap-2.5 text-xs">
              <h4 className="font-semibold text-charcoal/70 uppercase text-[9px] tracking-wider mb-1">Costs Breakdown Renders</h4>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Design Fees</span>
                <span className="font-semibold text-charcoal/90">₹{estimationResult.design_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Material Estimate</span>
                <span className="font-semibold text-charcoal/90">₹{estimationResult.material_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Labour Estimate</span>
                <span className="font-semibold text-charcoal/90">₹{estimationResult.labour_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">GST (18%)</span>
                <span className="font-semibold text-charcoal/90">₹{estimationResult.tax_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gold/15 mt-2 pt-2 text-sm">
                <span className="font-semibold text-charcoal">Total Amount</span>
                <span className="font-serif font-bold text-gold text-base">₹{estimationResult.total_amount.toLocaleString()}</span>
              </div>

              {selectedCustomerId && (
                <button
                  onClick={handleSaveQuotation}
                  disabled={saveQuotationMutation.isPending}
                  className="w-full py-3 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition mt-4 cursor-pointer"
                >
                  {saveQuotationMutation.isPending ? 'Saving to Database...' : 'Save Estimate to DB'}
                </button>
              )}
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
                quotations.map((quote) => {
                  const isDeleted = (quote as any).is_deleted;
                  const statusClass = (quote as any).status === 'accepted' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : (quote as any).status === 'rejected'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';
                  
                  return (
                    <div 
                      key={quote.id}
                      className={`bg-white/60 glass-card rounded-2xl p-6 border flex flex-col gap-4 shadow-sm smooth-transition ${
                        isDeleted ? 'opacity-60 border-red-200 bg-red-50/5' : 'border-gold/10 hover:border-gold/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[8px] uppercase tracking-wider text-gold font-bold">Estimate Sheet</span>
                            <span className={`text-[8.5px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>
                              {(quote as any).status || 'pending'}
                            </span>
                            {isDeleted && (
                              <span className="text-[8px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">Archived</span>
                            )}
                          </div>

                          <h4 className="font-serif text-base font-semibold text-charcoal/90 mt-1.5">
                            {getDesignTitle(quote.design_id)}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-charcoal/60 font-medium mt-1">
                            <UserCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                            <span>Client: <strong>{getCustomerName(quote.customer_id)}</strong></span>
                          </div>

                          <p className="text-[10px] text-charcoal/50 mt-1">
                            {quote.area_sqft} sqft • {quote.material_grade} Grade • Total: <strong className="text-gold font-serif text-xs">₹{quote.total_amount.toLocaleString()}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => openEditModal(quote)}
                            className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                            title="Edit Quotation details"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(quote.id)}
                            disabled={downloadingId === quote.id}
                            className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer disabled:opacity-50"
                            title="Download PDF Copy"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestore(quote.id)}
                              className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                              title="Restore Record"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(quote.id)}
                              className="p-2 border border-red-100 hover:border-red-600 text-red-600 rounded-lg hover:bg-red-50 smooth-transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT QUOTATION MODAL */}
      {isEditOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 border border-gold/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => {
                setIsEditOpen(false);
                setSelectedQuote(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full border border-gold/15 text-charcoal/50 hover:text-gold hover:border-gold/40 smooth-transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3" /> System Editor
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Edit Quotation Calculations</h2>
            
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Assign Customer</label>
                <select 
                  value={editFormData.customer_id}
                  onChange={(e) => setEditFormData({...editFormData, customer_id: e.target.value})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer text-charcoal"
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Design Concept Layout</label>
                <select 
                  value={editFormData.design_id}
                  onChange={(e) => setEditFormData({...editFormData, design_id: e.target.value})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  required
                >
                  {designs.map(d => (
                    <option key={d.id} value={d.id}>{d.title} (₹{d.price_per_sqft}/sqft)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Area Space (sqft)</label>
                  <input 
                    type="number" 
                    value={editFormData.area_sqft}
                    onChange={(e) => setEditFormData({...editFormData, area_sqft: Number(e.target.value)})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Material Grade Tier</label>
                  <select 
                    value={editFormData.material_grade}
                    onChange={(e) => setEditFormData({...editFormData, material_grade: e.target.value as any})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Quotation Status Status</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                >
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div className="text-[10px] text-charcoal/40 italic leading-normal border-t border-gold/10 pt-2.5">
                Note: Updating the design layout, area, or material tier triggers database-level cost calculator modifications for materials, labor, design fees, and taxes.
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedQuote(null);
                  }}
                  className="flex-1 py-3 border border-charcoal/20 text-charcoal/70 rounded-xl font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editQuotationMutation.isPending}
                  className="flex-1 py-3 bg-gold-gradient text-white rounded-xl font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition disabled:opacity-50"
                >
                  {editQuotationMutation.isPending ? 'Recalculating...' : 'Recalculate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

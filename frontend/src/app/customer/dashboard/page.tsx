'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  Calendar, 
  FileText, 
  FolderOpen, 
  Bell, 
  ArrowRight, 
  Workflow, 
  Sparkles,
  ClipboardList,
  Download,
  Coins,
  X,
  Printer,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService, CustomerDashboardMetrics } from '@/services/dashboard';
import { quotationService, Quotation } from '@/services/quotations';
import { Logo } from '@/components/brand';

export default function CustomerDashboard() {
  const [userName, setUserName] = useState('Valued Client');
  const [clientEmail, setClientEmail] = useState('client@crescentchique.com');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Quotation | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || 'Valued Client');
    setClientEmail(localStorage.getItem('user_email') || 'client@crescentchique.com');
  }, []);

  const { data: metrics, isLoading, isError, refetch } = useQuery<CustomerDashboardMetrics>({
    queryKey: ['customerDashboard'],
    queryFn: dashboardService.getCustomerDashboard,
  });

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['customerQuotationsDashboard'],
    queryFn: () => quotationService.getQuotations({ per_page: 3 }),
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

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-xs text-gold font-semibold tracking-widest uppercase">Loading Portal Overview...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white/60 glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/20 shadow-xl flex flex-col items-center gap-4">
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Connection Failure</span>
          <h3 className="font-serif text-lg font-semibold text-charcoal">Workspace Offline</h3>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Failed to load your personal designer dashboard. Verify your local connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-6 py-2.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header banner */}
      <div className="flex flex-col gap-1 border-b border-gold/15 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Luxury Workspace
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold mt-1">Hello, {userName}</h1>
        <p className="text-charcoal/70 text-xs mt-1">
          Welcome to your designer dashboard. Review your schedules, estimate costings, and check construction timelines.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link 
          href="/customer/appointments" 
          className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 hover:border-gold/50 shadow-sm cursor-pointer hover:bg-gold/5 hover:-translate-y-0.5 smooth-transition group"
        >
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 smooth-transition">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Appointments</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_appointments} Booked</h3>
          </div>
        </Link>

        <Link 
          href="/customer/quotations" 
          className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 hover:border-gold/50 shadow-sm cursor-pointer hover:bg-gold/5 hover:-translate-y-0.5 smooth-transition group"
        >
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 smooth-transition">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Quotations</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_quotations} Saved</h3>
          </div>
        </Link>

        <Link 
          href="/customer/files" 
          className="glass-card rounded-2xl p-6 flex items-center gap-5 border border-gold/10 hover:border-gold/50 shadow-sm cursor-pointer hover:bg-gold/5 hover:-translate-y-0.5 smooth-transition group"
        >
          <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 smooth-transition">
            <FolderOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Documents</span>
            <h3 className="font-serif text-xl font-bold text-charcoal/90 mt-0.5">{metrics.total_files} Uploaded</h3>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Active Project Tracker */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {metrics.active_project ? (
            <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5">
                    <Workflow className="h-3.5 w-3.5" /> Active Project
                  </span>
                  <h3 className="font-serif text-xl font-semibold mt-1">Living Room Turnkey Execution</h3>
                </div>
                <span className="bg-gold/10 text-gold border border-gold/30 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {metrics.active_project.project_status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-charcoal/60">Construction Progress</span>
                  <span className="text-gold font-serif">{metrics.active_project.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gold/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold-gradient h-full smooth-transition rounded-full" 
                    style={{ width: `${metrics.active_project.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-gold/10 pt-4 mb-4">
                <div>
                  <span className="text-charcoal/50 block font-medium">Expected Completion</span>
                  <span className="font-semibold text-charcoal/90 mt-0.5 block">
                    {metrics.active_project.expected_completion 
                      ? new Date(metrics.active_project.expected_completion).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'To Be Decided'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal/50 block font-medium">Project Code</span>
                  <span className="font-mono text-charcoal/80 mt-0.5 block truncate">{metrics.active_project.id}</span>
                </div>
              </div>

              <Link 
                href="/customer/timeline"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-dark smooth-transition"
              >
                Track Milestones Timeline <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white/40 glass-card rounded-2xl p-8 border border-gold/10 text-center flex flex-col items-center gap-4">
              <ClipboardList className="h-10 w-10 text-gold/60" />
              <h3 className="font-serif text-lg font-semibold">No Active Construction Project</h3>
              <p className="text-xs text-charcoal/60 max-w-sm leading-relaxed">
                Start by scheduling a slot consultation or saving cost estimates to begin designer layouts.
              </p>
              <Link
                href="/customer/appointments"
                className="bg-gold-gradient text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-md smooth-transition"
              >
                Book consultation
              </Link>
            </div>
          )}

          {/* Recent Quotations & Invoices */}
          <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gold/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-gold" />
                <h3 className="font-serif text-lg font-semibold text-charcoal">Recent Quotations & Invoices</h3>
              </div>
              <Link 
                href="/customer/quotations" 
                className="text-[10px] font-bold uppercase tracking-wider text-gold hover:underline"
              >
                View All
              </Link>
            </div>

            {quotesLoading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="h-5 w-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <p className="text-[10px] text-gold/80 font-semibold tracking-wider uppercase">Loading Estimates...</p>
              </div>
            ) : !quotesData || quotesData.items.length === 0 ? (
              <p className="text-xs text-charcoal/50 text-center py-6">No saved quotations found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {quotesData.items.slice(0, 2).map((quote) => (
                  <div key={quote.id} className="flex flex-col gap-3 bg-white/40 p-4 rounded-xl border border-gold/5 text-xs text-charcoal">
                    {/* ID and Action row */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-gold tracking-widest block">
                          ID: {quote.id.substring(0, 12)}...
                        </span>
                        <h4 className="font-serif font-semibold text-sm mt-0.5">
                          Estimate for {quote.area_sqft} sqft Space ({quote.material_grade} Grade)
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedInvoice(quote)}
                          className="p-1.5 border border-gold/20 hover:border-gold/60 text-gold hover:bg-gold/5 rounded-lg smooth-transition cursor-pointer"
                          title="View Invoice"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(quote.id)}
                          disabled={downloadingId === quote.id}
                          className="p-1.5 bg-charcoal hover:bg-gold text-white rounded-lg smooth-transition disabled:opacity-50 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Cost row */}
                    <div className="flex justify-between items-center text-xs font-semibold border-t border-gold/5 pt-2">
                      <span className="text-charcoal/50">Estimated Budget</span>
                      <span className="text-gold font-bold font-serif text-sm">${quote.total_amount.toLocaleString()}</span>
                    </div>

                    {/* Stacked Percentage Budget Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="h-2 w-full rounded-full bg-beige-dark overflow-hidden flex shadow-inner border border-gold/5">
                        <div 
                          className="bg-[#C9A36B] h-full" 
                          style={{ width: `${(quote.design_cost / quote.total_amount) * 100}%` }}
                          title={`Design: $${quote.design_cost.toLocaleString()}`}
                        />
                        <div 
                          className="bg-[#D4AF37] h-full" 
                          style={{ width: `${(quote.material_cost / quote.total_amount) * 100}%` }}
                          title={`Material: $${quote.material_cost.toLocaleString()}`}
                        />
                        <div 
                          className="bg-[#1F2937] h-full" 
                          style={{ width: `${(quote.labour_cost / quote.total_amount) * 100}%` }}
                          title={`Labour: $${quote.labour_cost.toLocaleString()}`}
                        />
                        <div 
                          className="bg-[#E6C687] h-full" 
                          style={{ width: `${(quote.tax_amount / quote.total_amount) * 100}%` }}
                          title={`GST: $${quote.tax_amount.toLocaleString()}`}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-charcoal/50">
                        <span>Design: {((quote.design_cost / quote.total_amount) * 100).toFixed(0)}%</span>
                        <span>Mat: {((quote.material_cost / quote.total_amount) * 100).toFixed(0)}%</span>
                        <span>Lab: {((quote.labour_cost / quote.total_amount) * 100).toFixed(0)}%</span>
                        <span>GST: {((quote.tax_amount / quote.total_amount) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white/40 glass-card rounded-2xl p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">Portal Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <Link 
                href="/customer/appointments" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Book Appointment</span>
                <span className="text-[10px] text-charcoal/50">Schedule slot consultation.</span>
              </Link>
              <Link 
                href="/gallery" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Calculate Costings</span>
                <span className="text-[10px] text-charcoal/50">Estimate budgets on designs.</span>
              </Link>
              <Link 
                href="/customer/files" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">Upload Files</span>
                <span className="text-[10px] text-charcoal/50">Store drafts and photos.</span>
              </Link>
              <Link 
                href="/customer/leads" 
                className="p-4 rounded-xl bg-white hover:bg-gold/5 border border-gold/10 hover:border-gold flex flex-col gap-1 smooth-transition"
              >
                <span className="font-semibold text-charcoal">File Inquiries</span>
                <span className="text-[10px] text-charcoal/50">Send general requirements.</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Notifications Board */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-semibold">Recent Notifications</h3>
              </div>
              <Link href="/customer/notifications" className="text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {metrics.recent_notifications.length === 0 ? (
                <p className="text-xs text-charcoal/50 text-center py-6">No unread notifications alerts.</p>
              ) : (
                metrics.recent_notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-4 bg-white/80 rounded-xl border border-gold/10 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs text-charcoal">{notif.title}</h4>
                      <span className="text-[8px] text-charcoal/40 font-mono">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/70 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
                  <span className="font-semibold text-charcoal text-sm">{userName}</span>
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

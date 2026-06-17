'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Sparkles, 
  Workflow, 
  Percent, 
  Download, 
  Bell, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { api } from '@/services/api';
import { fileService } from '@/services/files';
import { quotationService } from '@/services/quotations';

interface CustomerDetailPayload {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    registered_at: string;
    tier: 'Economy' | 'Premium' | 'Luxury';
  };
  projects: Array<{
    id: string;
    project_status: string;
    progress_percentage: number;
    start_date: string | null;
    expected_completion: string | null;
    created_at: string;
  }>;
  quotations: Array<{
    id: string;
    design_id: string;
    design_title: string;
    area_sqft: number;
    material_grade: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  appointments: Array<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    requirements: string;
    created_at: string;
  }>;
  files: Array<{
    id: string;
    filename: string;
    file_type: string;
    uploaded_at: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<CustomerDetailPayload>({
    queryKey: ['adminCustomerDetail', customerId],
    queryFn: async () => {
      const response = await api.get(`/customers/${customerId}`);
      return response.data;
    },
    enabled: !!customerId
  });

  const handleDownloadFile = async (id: string, filename: string) => {
    try {
      setDownloadingFileId(id);
      const blob = await fileService.downloadFileBlob(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('File download failed', err);
      alert('Could not download file. Verify local service configurations.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDownloadQuote = async (id: string) => {
    try {
      setDownloadingQuoteId(id);
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
      setDownloadingQuoteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-xs text-gold font-semibold tracking-widest uppercase font-mono">Opening Portfolio Sheet...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white/60 glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/20 shadow-xl flex flex-col items-center gap-4">
          <ShieldAlert className="text-red-500 h-8 w-8" />
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest font-mono">Profile Offline</span>
          <h3 className="font-serif text-lg font-semibold text-charcoal">Failed to open Client profile</h3>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            {(error as any)?.response?.data?.error || (error as any)?.message || 'An error occurred during database lookup.'}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => router.push('/admin/customers')}
              className="px-5 py-2 border border-charcoal/20 text-charcoal/70 rounded-full text-xs font-bold uppercase tracking-wider smooth-transition hover:bg-charcoal/5"
            >
              Back to Portfolio
            </button>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, projects, quotations, appointments, files, notifications } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-gold/15 pb-6">
        <div className="flex items-center gap-2">
          <Link 
            href="/admin/customers"
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
            title="Back to Customers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold font-mono flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> Client Portfolio Sheet
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-charcoal">{profile.name}</h1>
            <p className="text-xs text-charcoal/50 font-mono mt-1">System ID: {profile.id}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition self-start sm:self-auto"
            title="Refresh details"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of Profile Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 flex flex-col gap-4 shadow-sm md:col-span-2">
          <h3 className="font-serif text-base font-semibold text-charcoal border-b border-gold/10 pb-2 flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-gold" /> Contact Profile & Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal/80">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-gold/70 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase font-bold text-charcoal/40 block">Email Address</span>
                <span className="font-medium truncate block">{profile.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-gold/70 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-charcoal/40 block">Phone Line</span>
                <span className="font-medium">{profile.phone || 'Not Provided'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 sm:col-span-2">
              <MapPin className="h-4.5 w-4.5 text-gold/70 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] uppercase font-bold text-charcoal/40 block">Mailing Address</span>
                <span className="font-medium">
                  {profile.address || 'No address logged'}, {profile.city}, {profile.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Details Card */}
        <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/15 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider block">Membership Bracket</span>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <h2 className="font-serif text-xl font-bold text-charcoal uppercase tracking-wide">
                {profile.tier} Member
              </h2>
            </div>
            <p className="text-[10px] text-charcoal/50 leading-relaxed mt-2">
              Assigned based on highest estimate material grade tier approved by the studio manager.
            </p>
          </div>
          <div className="border-t border-gold/10 pt-4 flex justify-between text-[10px] text-charcoal/40 uppercase font-semibold font-mono mt-4">
            <span>Registered Date</span>
            <span>{new Date(profile.registered_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Projects Timeline Tracker */}
      <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
        <h3 className="font-serif text-base font-semibold text-charcoal flex items-center gap-2">
          <Workflow className="h-4.5 w-4.5 text-gold" /> Active Projects & Deliverables ({projects.length})
        </h3>
        {projects.length === 0 ? (
          <div className="p-6 text-center text-xs text-charcoal/40 border border-dashed border-gold/15 rounded-xl bg-white/20">
            No projects have been initiated for this client yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="bg-white/80 border border-gold/5 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-gold/20 smooth-transition"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      proj.project_status.toLowerCase() === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : proj.project_status.toLowerCase() === 'in progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {proj.project_status}
                    </span>
                    <span className="text-[10px] text-charcoal/40 font-mono">ID: {proj.id}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gold/10 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full" style={{ width: `${proj.progress_percentage}%` }} />
                    </div>
                    <span className="text-xs font-bold text-charcoal font-mono flex items-center gap-0.5">
                      <Percent className="h-3 w-3 text-gold/80" /> {proj.progress_percentage}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 text-[10px] sm:text-right text-charcoal/60 shrink-0 font-mono">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-charcoal/40 block">Start Date</span>
                    <span>{proj.start_date ? new Date(proj.start_date).toLocaleDateString() : 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-charcoal/40 block">Expected Completion</span>
                    <span>{proj.expected_completion ? new Date(proj.expected_completion).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <Link 
                    href="/admin/projects"
                    className="self-center p-2 border border-gold/10 hover:border-gold/50 rounded-lg hover:bg-gold/5 text-gold smooth-transition"
                    title="Open Projects Board"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotations estimates panel */}
      <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
        <h3 className="font-serif text-base font-semibold text-charcoal flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-gold" /> Quotations & Estimates Summary ({quotations.length})
        </h3>
        {quotations.length === 0 ? (
          <div className="p-6 text-center text-xs text-charcoal/40 border border-dashed border-gold/15 rounded-xl bg-white/20">
            No quotation drafts or approvals found on file.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quotations.map((quote) => (
              <div 
                key={quote.id} 
                className="bg-white/85 p-5 rounded-xl border border-gold/10 hover:border-gold/30 smooth-transition flex flex-col gap-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-charcoal truncate max-w-[180px]">
                      {quote.design_title}
                    </h4>
                    <span className="text-[9px] text-charcoal/40 font-mono block mt-0.5">ID: {quote.id}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                    quote.status.toLowerCase() === 'accepted' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : quote.status.toLowerCase() === 'rejected'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {quote.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-gold/10 py-3 font-mono text-charcoal/70">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-charcoal/40 block">Dimensions</span>
                    <span>{quote.area_sqft} SQFT</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-charcoal/40 block">Grade Tier</span>
                    <span>{quote.material_grade}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-charcoal/40 block">Total Est.</span>
                    <span className="font-serif text-base font-bold text-gold">
                      ₹{quote.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadQuote(quote.id)}
                    disabled={downloadingQuoteId === quote.id}
                    className="px-3.5 py-1.5 border border-gold/30 hover:border-gold text-gold hover:bg-gold/5 rounded-lg text-[10px] font-bold uppercase tracking-wider smooth-transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" /> 
                    {downloadingQuoteId === quote.id ? 'Saving...' : 'PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Booking slots & Uploaded Blueprints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bookings/Appointments Consultations */}
        <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
          <h3 className="font-serif text-base font-semibold text-charcoal flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-gold" /> Consultation Appointments ({appointments.length})
          </h3>
          {appointments.length === 0 ? (
            <p className="text-xs text-charcoal/40 py-6 text-center">No consultations logged in history.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-3 bg-white/80 rounded-xl border border-gold/5 text-xs flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-charcoal/40">Slot ID: {appt.id}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      appt.status.toLowerCase() === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : appt.status.toLowerCase() === 'cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-charcoal/80 font-medium">
                    <Clock className="h-4 w-4 text-gold shrink-0" />
                    <span>
                      {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}
                    </span>
                  </div>

                  {appt.requirements && (
                    <div className="bg-beige-soft/40 p-2 rounded border border-gold/5 text-[10px] text-charcoal/70 italic leading-relaxed">
                      "{appt.requirements}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Blueprints & Files */}
        <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
          <h3 className="font-serif text-base font-semibold text-charcoal flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-gold" /> Blueprints & Uploaded Files ({files.length})
          </h3>
          {files.length === 0 ? (
            <p className="text-xs text-charcoal/40 py-6 text-center">No design files or layouts uploaded.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="p-3 bg-white/80 rounded-xl border border-gold/5 text-xs flex justify-between items-center gap-3 hover:border-gold/15 smooth-transition"
                >
                  <div className="truncate">
                    <span className="font-bold text-charcoal truncate block max-w-[180px]">{file.filename}</span>
                    <span className="text-[8.5px] uppercase font-bold text-gold tracking-wide font-mono block mt-0.5">
                      {file.file_type} • {new Date(file.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file.id, file.filename)}
                    disabled={downloadingFileId === file.id}
                    className="p-2 border border-gold/20 hover:border-gold text-gold hover:bg-gold/5 rounded-lg smooth-transition shrink-0 disabled:opacity-50"
                    title="Download File"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Notifications History Panel */}
      <div className="bg-white/60 glass-card rounded-2xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4">
        <h3 className="font-serif text-base font-semibold text-charcoal flex items-center gap-2">
          <Bell className="h-4.5 w-4.5 text-gold" /> System Notifications Dispatched ({notifications.length})
        </h3>
        {notifications.length === 0 ? (
          <p className="text-xs text-charcoal/40 py-4 text-center">No alerts history logged for this account.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className="p-3 bg-white/80 rounded-xl border border-gold/5 flex flex-col gap-1 hover:border-gold/15 smooth-transition"
              >
                <div className="flex justify-between items-center text-[9px] font-semibold font-mono text-charcoal/40">
                  <span className={notif.is_read ? 'text-charcoal/30' : 'text-gold'}>
                    {notif.is_read ? 'READ' : 'UNREAD'}
                  </span>
                  <span>{new Date(notif.created_at).toLocaleString()}</span>
                </div>
                <h4 className="font-bold text-charcoal text-[11px] mt-0.5">{notif.title}</h4>
                <p className="text-[10px] text-charcoal/75 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

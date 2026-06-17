'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Calendar, Clock, RefreshCw, CalendarPlus, XCircle, FileClock } from 'lucide-react';
import { appointmentService } from '@/services/appointments';

export default function CustomerAppointments() {
  const queryClient = useQueryClient();

  // Booking states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reqs, setReqs] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch appointments list
  const { data: apptsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customerAppointments'],
    queryFn: () => appointmentService.getAppointments(),
  });

  // Schedule mutation
  const bookMutation = useMutation({
    mutationFn: (data: { appointment_date: string; appointment_time: string; requirements: string }) =>
      appointmentService.createAppointment(data),
    onSuccess: () => {
      setFormSuccess(true);
      setDate('');
      setTime('');
      setReqs('');
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['customerAppointments'] });
    },
    onError: (err: any) => {
      setFormError(err || 'Failed to book consultation slots.');
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAppointments'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setFormError('Please select both a date and time.');
      return;
    }
    bookMutation.mutate({
      appointment_date: date,
      appointment_time: time,
      requirements: reqs,
    });
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this consultation slot?')) {
      cancelMutation.mutate(id);
    }
  };

  const appointments = apptsData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Bookings
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Consultation Appointments</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Manage your scheduled designer consultations, floor plan reviews, and architecture walkthroughs.
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
        {/* LEFT: Book panel */}
        <div className="lg:col-span-5 bg-white/50 glass-card rounded-2xl p-6 border border-gold/15 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CalendarPlus className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg font-semibold">Book Consultation Slot</h3>
          </div>

          {formSuccess && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-4">
              ✓ Appointment slot requested successfully! We will confirm scheduling shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Preferred Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Preferred Time Slot *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Design Requirements</label>
              <textarea
                placeholder="Describe your goals (e.g. kitchen remodel layouts, material grade choices...)"
                rows={4}
                value={reqs}
                onChange={(e) => setReqs(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition resize-none"
              />
            </div>

            {formError && (
              <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                ⚠️ {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={bookMutation.isPending}
              className="w-full py-3 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-md smooth-transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {bookMutation.isPending ? 'Scheduling Slot...' : 'Schedule Design Slot'}
            </button>
          </form>
        </div>

        {/* RIGHT: Calendar slots list */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-serif text-lg font-semibold mb-2">My Bookings History</h3>

          {isLoading && (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Loading history...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">
              Failed to load appointments calendar slots.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {appointments.length === 0 ? (
                <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                  No appointments scheduled. Book a consultation on the left.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {appointments.map((appt) => {
                    const statusColorMap = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      cancelled: 'bg-red-50 text-red-700 border-red-200',
                    };
                    const badgeClass = statusColorMap[appt.status] || 'bg-gray-50 text-gray-700';

                    return (
                      <div 
                        key={appt.id}
                        className="bg-white/60 glass-card rounded-2xl p-5 border border-gold/10 flex flex-col gap-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                              <FileClock className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-serif text-base font-semibold text-charcoal/90">
                                {new Date(appt.appointment_date).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </h4>
                              <p className="text-[10px] text-charcoal/50 flex items-center gap-1 mt-0.5">
                                <Clock className="h-3.5 w-3.5" /> {appt.appointment_time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                              {appt.status}
                            </span>
                            {appt.status === 'pending' && (
                              <button
                                onClick={() => handleCancel(appt.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 smooth-transition"
                                title="Cancel Slot"
                              >
                                <XCircle className="h-4.5 w-4.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {appt.requirements && (
                          <div className="text-xs text-charcoal/80 bg-white/30 p-3 rounded-lg border border-gold/5 leading-relaxed">
                            <strong>Details:</strong> {appt.requirements}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

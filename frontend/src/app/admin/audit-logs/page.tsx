'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, FileTerminal, Search, RefreshCw, ShieldAlert, Sliders } from 'lucide-react';
import { dashboardService, AuditLog } from '@/services/dashboard';

export default function AdminAuditLogs() {
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch paginated audit logs
  const { data: logsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminAuditLogs', actionFilter, page],
    queryFn: () => dashboardService.getAuditLogs({
      action: actionFilter,
      page,
      per_page: 10,
    }),
  });

  const logs = logsData?.items || [];
  const totalPages = logsData?.pages || 1;

  const actionsList = [
    { label: 'All Actions', value: 'all' },
    { label: 'User Login', value: 'User Login' },
    { label: 'User Logout', value: 'User Logout' },
    { label: 'Lead Created', value: 'Lead Created' },
    { label: 'Lead Status Updated', value: 'Lead Status Updated' },
    { label: 'Quotation Created', value: 'Quotation Created' },
    { label: 'PDF Generated', value: 'PDF Generated' },
    { label: 'Project Progress Updated', value: 'Project Progress Updated' },
    { label: 'Project Note Added', value: 'Project Note Added' },
    { label: 'File Uploaded', value: 'File Uploaded' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FileTerminal className="h-3.5 w-3.5" /> Security
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">System Audit Logs</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Paginated compliance database tracking all system access logs, lead registrations, calculations, note updates, and file downloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-gold shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1); // Reset page on filter change
              }}
              className="rounded-full border border-gold/20 bg-white px-3 py-2 text-xs outline-none focus:border-gold smooth-transition"
            >
              {actionsList.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Opening Audit Stream...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
          Failed to retrieve compliance audit logs. Verify database configurations.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-6">
          {logs.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              No matching system events found in compliance records.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="bg-white/60 glass-card rounded-xl p-4 border border-gold/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:border-gold/30 smooth-transition text-xs"
                >
                  <div className="flex items-start gap-3.5 overflow-hidden">
                    <div className="h-9 w-9 rounded-lg bg-charcoal text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-4.5 w-4.5 text-gold" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-bold text-gold uppercase tracking-wider text-[10px]">{log.action}</span>
                        <span className="text-charcoal/40 text-[9px] font-mono">ID: {log.id.substr(0, 8)}...</span>
                      </div>
                      <p className="text-charcoal/80 mt-1 leading-relaxed">{log.details}</p>
                      {log.user_name && (
                        <span className="text-[9px] text-charcoal/40 font-semibold block mt-0.5">By: {log.user_name} (ID: {log.user_id.substr(0, 6)}...)</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-charcoal/40 shrink-0 self-end sm:self-center">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 text-xs font-semibold uppercase tracking-wider">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gold/15 bg-white/40 rounded-full hover:bg-gold hover:text-white disabled:opacity-50 smooth-transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-charcoal/60">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-gold/15 bg-white/40 rounded-full hover:bg-gold hover:text-white disabled:opacity-50 smooth-transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

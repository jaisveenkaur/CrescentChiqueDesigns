'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, FolderLock, Download, Trash2, RotateCcw, RefreshCw, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { fileService } from '@/services/files';

export default function AdminFiles() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Fetch all files
  const { data: filesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminFiles', search],
    queryFn: () => fileService.getFiles({ filename: search }),
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFiles'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => fileService.restoreFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFiles'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const handleDownload = async (id: string, filename: string) => {
    try {
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
      console.error('Download error', err);
      alert('Could not download file. Verify local service configurations.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to logically delete this client file?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const files = filesData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FolderLock className="h-3.5 w-3.5" /> Workspace Manager
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Files Manager</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Browse and download all blueprints, contract drawings, and customer uploads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-gold/20 bg-white pl-8 pr-4 py-2 text-xs outline-none focus:border-gold smooth-transition w-48 sm:w-56"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-charcoal/40" />
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
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Opening Files Vault...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
          Failed to load database files.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-4">
          {files.length === 0 ? (
            <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
              No registered files found matching search query.
            </div>
          ) : (
            files.map((file) => {
              const isImg = file.file_type.startsWith('image/');
              const FileIcon = isImg ? ImageIcon : FileText;

              return (
                <div 
                  key={file.id}
                  className="bg-white/60 glass-card rounded-xl p-4 border border-gold/10 flex items-center justify-between gap-4 shadow-sm hover:border-gold/30 smooth-transition"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs text-charcoal truncate" title={file.filename}>
                        {file.filename}
                      </h4>
                      <p className="text-[9px] text-charcoal/40 font-mono mt-0.5">
                        Client ID: {file.customer_id.substr(0, 8)}... • At: {new Date(file.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRestore(file.id)}
                      className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                      title="Restore File"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 border border-red-100 hover:border-red-600 text-red-600 rounded-lg hover:bg-red-50 smooth-transition cursor-pointer"
                      title="Soft Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

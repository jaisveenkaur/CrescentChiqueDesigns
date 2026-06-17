'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, FolderOpen, Upload, Download, Trash2, RefreshCw, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { fileService } from '@/services/files';

export default function CustomerFiles() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadingName, setUploadingName] = useState('');

  // Fetch files list
  const { data: filesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customerFiles'],
    queryFn: () => fileService.getFiles(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileService.uploadFile(file),
    onSuccess: () => {
      setUploadSuccess(true);
      setUploadError('');
      setUploadingName('');
      queryClient.invalidateQueries({ queryKey: ['customerFiles'] });
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to upload file. Check file size (max 5MB) and formats.');
      setUploadingName('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerFiles'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setUploadingName(selectedFile.name);
      setUploadSuccess(false);
      setUploadError('');
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setUploadingName(selectedFile.name);
      setUploadSuccess(false);
      setUploadError('');
      uploadMutation.mutate(selectedFile);
    }
  };

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
      console.error('Download file error', err);
      alert('Could not download file. Verify local service configurations.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this file from your project workspace?')) {
      deleteMutation.mutate(id);
    }
  };

  const files = filesData?.items || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" /> Workspace
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">File Upload Center</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Store structural blueprints, floor plans, contract layouts, and design inspiration photos.
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
          title="Refresh Workspace"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Upload Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="font-serif text-lg font-semibold mb-2">Upload Documents</h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 cursor-pointer smooth-transition min-h-[220px] ${
              dragActive 
                ? 'border-gold bg-gold/5 shadow-inner' 
                : 'border-gold/20 bg-white/40 hover:border-gold/60 hover:bg-gold/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.doc,.docx"
            />
            
            <div className="h-12 w-12 rounded-full bg-gold/10 text-gold flex items-center justify-center">
              <Upload className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-charcoal">
                Drag and drop files, or <span className="text-gold underline">browse local directory</span>
              </p>
              <p className="text-[10px] text-charcoal/40">
                Supports PDF, XLS, JPG, PNG, DOC (max 5MB)
              </p>
            </div>
          </div>

          {uploadingName && (
            <div className="text-xs text-charcoal/60 bg-white p-3 rounded-lg border border-gold/10 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-gold border-t-transparent animate-spin" />
              Uploading &ldquo;{uploadingName}&rdquo;...
            </div>
          )}

          {uploadSuccess && (
            <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
              <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              Document uploaded and synced successfully!
            </div>
          )}

          {uploadError && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* RIGHT: Files List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-serif text-lg font-semibold mb-2">Workspace Documents</h3>

          {isLoading && (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              <span className="text-[10px] uppercase text-gold font-bold tracking-wider">Retrieving folders...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">
              Failed to load workspace files.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {files.length === 0 ? (
                <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                  No files registered. Upload blueprints or layouts on the left.
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {files.map((file) => {
                    const isImg = file.file_type.startsWith('image/');
                    const FileIcon = isImg ? ImageIcon : FileText;

                    return (
                      <div
                        key={file.id}
                        className="bg-white/60 glass-card rounded-xl p-4 border border-gold/10 flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                            <FileIcon className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-xs text-charcoal truncate" title={file.filename}>
                              {file.filename}
                            </h4>
                            <span className="text-[9px] text-charcoal/40 font-mono mt-0.5 block">
                              Uploaded At {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownload(file.id, file.filename)}
                            className="p-2 border border-gold/10 hover:border-gold text-gold rounded-lg hover:bg-gold/5 smooth-transition cursor-pointer"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 border border-red-100 hover:border-red-600 text-red-600 rounded-lg hover:bg-red-50 smooth-transition cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

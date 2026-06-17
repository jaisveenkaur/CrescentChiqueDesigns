'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Workflow, 
  RefreshCw, 
  Percent, 
  MessageSquare, 
  Calendar, 
  Plus, 
  X,
  Trash2,
  RotateCcw,
  Sparkles,
  ListOrdered,
  Edit3,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { projectService, Project, ProjectNote } from '@/services/projects';
import { api } from '@/services/api';
import { quotationService, Quotation } from '@/services/quotations';

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  // Note text state
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');

  // Modals visibility state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customer_id: '',
    quotation_id: '',
    project_status: 'Execution',
    progress_percentage: 0,
    start_date: '',
    expected_completion: ''
  });

  // Fetch projects list
  const { data: projects = [], isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ['adminProjects'],
    queryFn: projectService.getProjects,
  });

  // Fetch active project's notes
  const { data: notes = [], refetch: refetchNotes } = useQuery<ProjectNote[]>({
    queryKey: ['projectNotes', selectedProj?.id],
    queryFn: () => selectedProj ? projectService.getProjectNotes(selectedProj.id) : Promise.resolve([]),
    enabled: !!selectedProj,
  });

  // Fetch customers for project assignment
  const { data: customers = [] } = useQuery<CustomerOption[]>({
    queryKey: ['adminCustomersForProjects'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  // Fetch all quotations to filter by selected customer
  const { data: quotationsResp } = useQuery({
    queryKey: ['adminAllQuotationsForProjects'],
    queryFn: () => quotationService.getQuotations({ per_page: 1000 })
  });
  const quotations = quotationsResp?.items || [];

  // Filter quotations based on selected customer in form
  const availableQuotations = quotations.filter(q => q.customer_id === formData.customer_id);

  // Check query parameter to auto-open creation modal
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Update progress slider mutation
  const progressMutation = useMutation({
    mutationFn: (data: { id: string; progress: number }) =>
      projectService.updateProjectProgress(data.id, data.progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      // Keep selected project state synced with updated progress
      if (selectedProj) {
        setSelectedProj(prev => prev ? { ...prev, progress_percentage: formData.progress_percentage } : null);
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.message || 'Failed to update progress.');
    },
  });

  // Add note mutation
  const noteMutation = useMutation({
    mutationFn: (data: { id: string; note: string }) =>
      projectService.addProjectNote(data.id, data.note),
    onSuccess: () => {
      setNoteText('');
      setNoteError('');
      queryClient.invalidateQueries({ queryKey: ['projectNotes', selectedProj?.id] });
    },
    onError: (err: any) => {
      setNoteError(err.response?.data?.error || err.message || 'Failed to save project note.');
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || err.message || 'Failed to create project.');
    }
  });

  // Edit project mutation
  const editProjectMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => projectService.editProject(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsEditOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || err.message || 'Failed to update project.');
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setSelectedProj(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.message || 'Failed to delete project.');
    }
  });

  // Restore project mutation
  const restoreProjectMutation = useMutation({
    mutationFn: projectService.restoreProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.message || 'Failed to restore project.');
    }
  });

  const handleSelectProject = (proj: Project) => {
    setSelectedProj(proj);
    setNoteText('');
    setNoteError('');
    setFormData({
      customer_id: proj.customer_id,
      quotation_id: proj.quotation_id,
      project_status: proj.project_status,
      progress_percentage: proj.progress_percentage,
      start_date: proj.start_date || '',
      expected_completion: proj.expected_completion || ''
    });
  };

  const handleUpdateProgressQuick = (progress: number) => {
    if (!selectedProj) return;
    progressMutation.mutate({ id: selectedProj.id, progress });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;
    if (!noteText.trim()) {
      setNoteError('Note text cannot be empty.');
      return;
    }
    noteMutation.mutate({ id: selectedProj.id, note: noteText.trim() });
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      quotation_id: '',
      project_status: 'Planning',
      progress_percentage: 0,
      start_date: '',
      expected_completion: ''
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (proj: Project) => {
    resetForm();
    setFormData({
      customer_id: proj.customer_id,
      quotation_id: proj.quotation_id,
      project_status: proj.project_status,
      progress_percentage: proj.progress_percentage,
      start_date: proj.start_date || '',
      expected_completion: proj.expected_completion || ''
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.customer_id || !formData.quotation_id) {
      setFormError('Please select both a customer and an associated estimation sheet.');
      return;
    }
    createProjectMutation.mutate({
      customer_id: formData.customer_id,
      quotation_id: formData.quotation_id,
      project_status: formData.project_status,
      progress_percentage: Number(formData.progress_percentage),
      start_date: formData.start_date ? formData.start_date : null,
      expected_completion: formData.expected_completion ? formData.expected_completion : null
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedProj) return;
    editProjectMutation.mutate({
      id: selectedProj.id,
      data: {
        customer_id: formData.customer_id,
        quotation_id: formData.quotation_id,
        project_status: formData.project_status,
        progress_percentage: Number(formData.progress_percentage),
        start_date: formData.start_date ? formData.start_date : null,
        expected_completion: formData.expected_completion ? formData.expected_completion : null
      }
    });
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to logically delete this project directory?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleRestoreProject = (id: string) => {
    restoreProjectMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gold/15 pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Workflow className="h-3.5 w-3.5" /> Operations
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Active Projects Tracking</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Update construction percentage milestones, review project detail sheets, and post architect notes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>

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
          <p className="text-xs text-gold font-semibold tracking-widest uppercase">Opening Operations Folder...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-md mx-auto">
          Failed to load operations project folders.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Projects Listing cards */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="font-serif text-lg font-semibold mb-2">Projects Directory</h3>
            {projects.length === 0 ? (
              <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                No active execution projects found.
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = selectedProj?.id === proj.id;
                const isSoftDeleted = (proj as any).is_deleted;
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProject(proj)}
                    className={`bg-white/60 glass-card rounded-2xl p-6 border transition-all duration-300 shadow-sm cursor-pointer flex flex-col gap-4 ${
                      isSelected ? 'border-gold shadow-md shadow-gold/5 scale-[1.01]' : 'border-gold/10 hover:border-gold/30'
                    } ${isSoftDeleted ? 'opacity-60 border-red-200 bg-red-50/10' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-semibold text-charcoal">{proj.customer_name}</h4>
                          {isSoftDeleted && (
                            <span className="text-[8px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">Archived</span>
                          )}
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                          {proj.project_status}
                        </span>
                      </div>
                      <span className="text-[10px] text-charcoal/40 font-mono truncate max-w-[100px]" title={proj.id}>
                        {proj.id.substr(0, 8)}...
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-semibold text-charcoal/60">
                        <span>Milestone Progress</span>
                        <span className="text-gold font-serif">{proj.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gold/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gold-gradient h-full rounded-full smooth-transition" 
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[9px] text-charcoal/40 uppercase tracking-wider font-semibold border-t border-gold/10 pt-3">
                      <div>
                        <span>Started: {proj.start_date || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span>Expected Ends: {proj.expected_completion || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Detail View, Note Addition and Progress adjustments */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {selectedProj ? (
              <div className="bg-white/60 glass-card rounded-2xl p-6 sm:p-8 border border-gold/15 shadow-lg flex flex-col gap-6">
                
                {/* Header panel */}
                <div className="flex justify-between items-start border-b border-gold/10 pb-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gold tracking-widest">Selected Workspace</span>
                    <h3 className="font-serif text-xl font-semibold text-charcoal mt-0.5">
                      {selectedProj.customer_name}&rsquo;s Project
                    </h3>
                    <p className="text-[10px] text-charcoal/50 font-mono mt-0.5">ID: {selectedProj.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => openEditModal(selectedProj)}
                      className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-gold smooth-transition"
                      title="Edit project properties"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedProj(null)}
                      className="p-2 border border-gold/10 hover:border-gold/50 rounded-xl hover:bg-gold/5 text-charcoal/40 hover:text-gold smooth-transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Adjust Form */}
                <div className="flex flex-col gap-4 bg-white/40 p-5 rounded-xl border border-gold/5 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4.5 w-4.5 text-gold" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">Milestone Progress slider</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({...formData, progress_percentage: val});
                        handleUpdateProgressQuick(val);
                      }}
                      className="flex-1 accent-gold h-1 cursor-pointer bg-gold/10 rounded-full"
                    />
                    <span className="font-serif font-bold text-gold text-base w-12 text-right">{formData.progress_percentage}%</span>
                  </div>
                  <span className="text-[9.5px] text-charcoal/40">Drag slider to update live construction status percentage.</span>
                </div>

                {/* Project Notes Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-gold/10 pb-2">
                    <MessageSquare className="h-4.5 w-4.5 text-gold" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">Project Notes Log</h4>
                  </div>

                  {/* Notes Addition Form */}
                  <form onSubmit={handleAddNote} className="flex flex-col gap-2.5">
                    <textarea
                      placeholder="Add an update note (e.g. Electrical wiring completed. Custom teak panels arriving tomorrow...)"
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition resize-none"
                    />

                    {noteError && (
                      <div className="text-[9px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                        ⚠️ {noteError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={noteMutation.isPending}
                      className="inline-flex items-center gap-1.5 py-2.5 bg-gold-gradient text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:shadow-md smooth-transition self-end px-5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> {noteMutation.isPending ? 'Adding...' : 'Add Note'}
                    </button>
                  </form>

                  {/* Notes List */}
                  <div className="flex flex-col gap-3.5 mt-2 max-h-[160px] overflow-y-auto pr-1">
                    {notes.length === 0 ? (
                      <p className="text-[10px] text-charcoal/40 text-center py-4">No notes recorded for this project workspace.</p>
                    ) : (
                      notes.map((note) => (
                        <div 
                          key={note.id}
                          className="bg-white/80 border border-gold/5 p-4 rounded-xl flex flex-col gap-1.5 shadow-sm"
                        >
                          <div className="flex justify-between items-start gap-2 text-[9px] text-charcoal/40 font-semibold uppercase">
                            <span>{note.creator_name || 'Architect'}</span>
                            <span className="font-mono">{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-charcoal/80 leading-relaxed">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Danger zone actions */}
                <div className="border-t border-gold/10 pt-4 flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-charcoal/40 tracking-wider">Danger Zone Actions</span>
                  <div className="flex gap-2">
                    {selectedProj && (selectedProj as any).is_deleted ? (
                      <button
                        onClick={() => handleRestoreProject(selectedProj.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gold/40 text-gold hover:bg-gold/5 rounded-lg text-[10px] font-bold uppercase smooth-transition"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore Project
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteProject(selectedProj.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase smooth-transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Archive Project
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white/40 glass-card rounded-2xl p-10 border border-gold/10 text-center flex flex-col items-center gap-4 justify-center min-h-[300px]">
                <ListOrdered className="h-10 w-10 text-gold/60" />
                <h3 className="font-serif text-lg font-semibold">Select Project Workspace</h3>
                <p className="text-xs text-charcoal/60 max-w-xs leading-relaxed">
                  Click on an active construction folder on the left to track progress percentage settings and notes logs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 border border-gold/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-gold/15 text-charcoal/50 hover:text-gold hover:border-gold/40 smooth-transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3" /> System Form
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Create New Project Directory</h2>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Assign Customer *</label>
                <select 
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value, quotation_id: ''})}
                  className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {formData.customer_id && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Select Approved Estimation Sheet *</label>
                  {availableQuotations.length === 0 ? (
                    <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>No estimation sheets found on file for this client. Please draft a quotation for them first.</span>
                    </div>
                  ) : (
                    <select 
                      value={formData.quotation_id}
                      onChange={(e) => setFormData({...formData, quotation_id: e.target.value})}
                      className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Select Quotation --</option>
                      {availableQuotations.map(q => (
                        <option key={q.id} value={q.id}>
                          ID: {q.id.substr(0, 8)}... - Grade: {q.material_grade} (Total: ₹{q.total_amount.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Project Status Status</label>
                  <select 
                    value={formData.project_status}
                    onChange={(e) => setFormData({...formData, project_status: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="Lead Created">Lead Created</option>
                    <option value="Quotation Approved">Quotation Approved</option>
                    <option value="Design Finalized">Design Finalized</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Execution">Execution</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Initial progress percentage</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: Number(e.target.value)})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Expected completion date</label>
                  <input 
                    type="date" 
                    value={formData.expected_completion}
                    onChange={(e) => setFormData({...formData, expected_completion: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-charcoal/20 text-charcoal/70 rounded-xl font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending || (!!formData.customer_id && availableQuotations.length === 0)}
                  className="flex-1 py-3 bg-gold-gradient text-white rounded-xl font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition disabled:opacity-50"
                >
                  {createProjectMutation.isPending ? 'Generating directory...' : 'Create Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT PROPERTIES MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 border border-gold/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-gold/15 text-charcoal/50 hover:text-gold hover:border-gold/40 smooth-transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <span className="text-gold tracking-[0.2em] text-[9px] font-bold uppercase flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3" /> System Editor
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Edit Project Configuration</h2>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Project Status Status</label>
                  <select 
                    value={formData.project_status}
                    onChange={(e) => setFormData({...formData, project_status: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="Lead Created">Lead Created</option>
                    <option value="Quotation Approved">Quotation Approved</option>
                    <option value="Design Finalized">Design Finalized</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Execution">Execution</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Milestone Progress percentage</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: Number(e.target.value)})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Start date (YYYY-MM-DD)</label>
                  <input 
                    type="date" 
                    value={formData.start_date.substring(0, 10)}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-charcoal/60 uppercase text-[9px] tracking-wide">Expected completion date</label>
                  <input 
                    type="date" 
                    value={formData.expected_completion.substring(0, 10)}
                    onChange={(e) => setFormData({...formData, expected_completion: e.target.value})}
                    className="p-3 border border-gold/25 bg-white rounded-xl focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 border border-charcoal/20 text-charcoal/70 rounded-xl font-bold uppercase tracking-wider hover:bg-charcoal/5 smooth-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProjectMutation.isPending}
                  className="flex-1 py-3 bg-gold-gradient text-white rounded-xl font-bold uppercase tracking-wider hover:shadow-lg transition-transform hover:-translate-y-0.5 smooth-transition disabled:opacity-50"
                >
                  {editProjectMutation.isPending ? 'Updating...' : 'Save Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Compass, 
  Workflow, 
  RefreshCw, 
  Percent, 
  MessageSquare, 
  Calendar, 
  Plus, 
  X,
  FileCheck2,
  ListOrdered
} from 'lucide-react';
import { projectService, Project, ProjectNote } from '@/services/projects';

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  // Note text state
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');

  // Progress percentage state
  const [progressVal, setProgressVal] = useState<number>(0);
  const [progressError, setProgressError] = useState('');
  const [progressSuccess, setProgressSuccess] = useState(false);

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

  // Update progress mutation
  const progressMutation = useMutation({
    mutationFn: (data: { id: string; progress: number }) =>
      projectService.updateProjectProgress(data.id, data.progress),
    onSuccess: () => {
      setProgressSuccess(true);
      setProgressError('');
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err: any) => {
      setProgressError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update progress percentage.');
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
      setNoteError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save project note.');
    },
  });

  const handleSelectProject = (proj: Project) => {
    setSelectedProj(proj);
    setProgressVal(proj.progress_percentage);
    setProgressSuccess(false);
    setProgressError('');
    setNoteText('');
    setNoteError('');
  };

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;
    setProgressSuccess(false);
    progressMutation.mutate({ id: selectedProj.id, progress: progressVal });
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

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex justify-between items-end border-b border-gold/15 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-gold tracking-[0.25em] text-[10px] font-bold uppercase flex items-center gap-1.5">
            <Workflow className="h-3.5 w-3.5" /> Operations
          </span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Active Projects Tracking</h1>
          <p className="text-charcoal/70 text-xs mt-1">
            Update construction percentage milestones, review project detail sheets, and post architect notes.
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
            <h3 className="font-serif text-lg font-semibold mb-2">Projects List</h3>
            {projects.length === 0 ? (
              <div className="bg-white/40 glass-card rounded-2xl p-8 text-center text-xs text-charcoal/50 border border-gold/10">
                No active execution projects found.
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = selectedProj?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProject(proj)}
                    className={`bg-white/60 glass-card rounded-2xl p-6 border transition-all duration-300 shadow-sm cursor-pointer flex flex-col gap-4 ${
                      isSelected ? 'border-gold shadow-md shadow-gold/5 scale-[1.01]' : 'border-gold/10 hover:border-gold/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-serif text-base font-semibold text-charcoal">{proj.customer_name}</h4>
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
                        <span>Progress status</span>
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
                        <span>Ends: {proj.expected_completion || 'N/A'}</span>
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
                  <button 
                    onClick={() => setSelectedProj(null)}
                    className="p-1 rounded-full hover:bg-gold/10 text-charcoal/40 hover:text-gold smooth-transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress Adjust Form */}
                <form onSubmit={handleUpdateProgress} className="flex flex-col gap-4 bg-white/40 p-5 rounded-xl border border-gold/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="h-4.5 w-4.5 text-gold" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">Update Progress Milestone</h4>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      className="flex-1 accent-gold h-1 cursor-pointer bg-gold/10 rounded-full"
                    />
                    <span className="font-serif font-bold text-gold text-base w-12 text-right">{progressVal}%</span>
                  </div>

                  {progressSuccess && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                      ✓ Construction milestone percentage saved successfully!
                    </div>
                  )}

                  {progressError && (
                    <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                      ⚠️ {progressError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={progressMutation.isPending}
                    className="py-2.5 bg-charcoal text-white hover:bg-gold text-[10px] font-bold uppercase tracking-wider rounded-lg smooth-transition self-end px-6 cursor-pointer"
                  >
                    {progressMutation.isPending ? 'Updating...' : 'Save progress'}
                  </button>
                </form>

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
                  <div className="flex flex-col gap-3.5 mt-2 max-h-[200px] overflow-y-auto pr-1">
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
    </div>
  );
}

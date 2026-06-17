import { api } from './api';

export interface ProjectNote {
  id: string;
  project_id: string;
  note: string;
  created_by: string;
  created_at: string;
  creator_name?: string;
}

export interface Project {
  id: string;
  customer_id: string;
  customer_name?: string;
  quotation_id: string;
  project_status: string;
  progress_percentage: number;
  start_date?: string | null;
  expected_completion?: string | null;
  created_at: string;
  updated_at?: string;
  notes?: ProjectNote[];
}

let mockProjects: Project[] = [
  {
    id: 'proj-1',
    customer_id: 'customer-id-456',
    customer_name: 'Jaisveen Kaur',
    quotation_id: 'quote-1',
    project_status: 'Execution',
    progress_percentage: 65,
    start_date: '2026-06-01',
    expected_completion: '2026-08-15',
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'proj-2',
    customer_id: 'customer-id-789',
    customer_name: 'Robert Downey',
    quotation_id: 'quote-2',
    project_status: 'Design Phase',
    progress_percentage: 20,
    start_date: '2026-06-10',
    expected_completion: '2026-09-30',
    created_at: '2026-06-01T14:30:00Z',
  }
];

let mockNotes: Record<string, ProjectNote[]> = {
  'proj-1': [
    {
      id: 'note-1',
      project_id: 'proj-1',
      note: 'Electrical layout diagram approved. Core cabling work started.',
      created_by: 'admin-id-123',
      created_at: '2026-06-12T11:00:00Z',
      creator_name: 'Senior Architect',
    },
    {
      id: 'note-2',
      project_id: 'proj-1',
      note: 'Custom natural oak paneling ordered. Material shipment arriving next week.',
      created_by: 'admin-id-123',
      created_at: '2026-06-15T09:30:00Z',
      creator_name: 'Senior Architect',
    }
  ],
  'proj-2': [
    {
      id: 'note-3',
      project_id: 'proj-2',
      note: 'Initial floor plans presented. Feedback received and modifications are in progress.',
      created_by: 'admin-id-123',
      created_at: '2026-06-11T16:00:00Z',
      creator_name: 'Senior Architect',
    }
  ]
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.warn('Projects API failed, returning mock projects list', error);
      // Filter if customer
      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role');
        const customerId = localStorage.getItem('user_id');
        if (role === 'customer' && customerId) {
          return mockProjects.filter(p => p.customer_id === customerId);
        }
      }
      return mockProjects;
    }
  },

  getProjectDetails: async (id: string): Promise<Project> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Project details API for ${id} failed, returning mock`, error);
      const proj = mockProjects.find(p => p.id === id);
      if (!proj) throw new Error('Project not found');
      return proj;
    }
  },

  updateProjectProgress: async (
    id: string,
    progressPercentage: number
  ): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/projects/${id}/progress`, {
        progress_percentage: progressPercentage,
      });
      return response.data;
    } catch (error) {
      console.warn(`Update progress API for ${id} failed, applying mock`, error);
      const projIndex = mockProjects.findIndex(p => p.id === id);
      if (projIndex === -1) throw new Error('Project not found');
      mockProjects[projIndex].progress_percentage = Math.min(100, Math.max(0, progressPercentage));
      return { message: 'Progress updated successfully (mock fallback)' };
    }
  },

  getProjectNotes: async (projectId: string): Promise<ProjectNote[]> => {
    try {
      const response = await api.get(`/projects/${projectId}/notes`);
      return response.data;
    } catch (error) {
      console.warn(`Project notes API for ${projectId} failed, returning mocks`, error);
      return mockNotes[projectId] || [];
    }
  },

  addProjectNote: async (
    projectId: string,
    note: string
  ): Promise<ProjectNote> => {
    try {
      const response = await api.post(`/projects/${projectId}/notes`, { note });
      return response.data;
    } catch (error) {
      console.warn(`Add project note API for ${projectId} failed, adding mock`, error);
      const creatorName =
        (typeof window !== 'undefined' && localStorage.getItem('user_name')) || 'Architect';
      const newNote: ProjectNote = {
        id: 'note-' + Math.random().toString(36).substr(2, 9),
        project_id: projectId,
        note,
        created_by: 'admin-id-123',
        created_at: new Date().toISOString(),
        creator_name: creatorName,
      };
      if (!mockNotes[projectId]) {
        mockNotes[projectId] = [];
      }
      mockNotes[projectId] = [newNote, ...mockNotes[projectId]];
      return newNote;
    }
  },
};

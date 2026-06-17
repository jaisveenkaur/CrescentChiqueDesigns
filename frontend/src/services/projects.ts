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

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error(
        "GET /projects failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getProjectDetails: async (id: string): Promise<Project> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `GET /projects/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
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
    } catch (error: any) {
      console.error(
        `PUT /projects/${id}/progress failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getProjectNotes: async (projectId: string): Promise<ProjectNote[]> => {
    try {
      const response = await api.get(`/projects/${projectId}/notes`);
      return response.data;
    } catch (error: any) {
      console.error(
        `GET /projects/${projectId}/notes failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  addProjectNote: async (
    projectId: string,
    note: string
  ): Promise<ProjectNote> => {
    try {
      const response = await api.post(`/projects/${projectId}/notes`, { note });
      return response.data.note;
    } catch (error: any) {
      console.error(
        `POST /projects/${projectId}/notes failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  createProject: async (data: {
    customer_id: string;
    quotation_id: string;
    project_status: string;
    progress_percentage: number;
    start_date?: string | null;
    expected_completion?: string | null;
  }): Promise<{ message: string; project: Project }> => {
    try {
      const response = await api.post('/projects', data);
      return response.data;
    } catch (error: any) {
      console.error(
        "POST /projects failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  editProject: async (
    id: string,
    data: {
      customer_id?: string;
      quotation_id?: string;
      project_status?: string;
      progress_percentage?: number;
      start_date?: string | null;
      expected_completion?: string | null;
    }
  ): Promise<{ message: string; project: Project }> => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(
        `PUT /projects/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `DELETE /projects/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  restoreProject: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/projects/${id}/restore`);
      return response.data;
    } catch (error: any) {
      console.error(
        `PUT /projects/${id}/restore failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};


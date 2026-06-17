import { api } from './api';

export interface Lead {
  id: string;
  customer_id?: string | null;
  name: string;
  email: string;
  phone: string;
  requirements?: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  created_at: string;
  updated_at?: string;
}

export interface LeadsListResponse {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  items: Lead[];
}

export const leadService = {
  getLeads: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    name?: string;
    email?: string;
  }): Promise<LeadsListResponse> => {
    try {
      const response = await api.get('/leads', { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "GET /leads failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getLeadDetails: async (id: string): Promise<Lead> => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `GET /leads/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  createLead: async (data: {
    name: string;
    email: string;
    phone: string;
    requirements?: string;
  }): Promise<{ message: string; lead: Lead }> => {
    try {
      const response = await api.post('/leads', data);
      return response.data;
    } catch (error: any) {
      console.error(
        "POST /leads failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  updateLeadStatus: async (
    id: string,
    status: 'new' | 'contacted' | 'qualified' | 'lost'
  ): Promise<{ message: string; lead: { id: string; status: string } }> => {
    try {
      const response = await api.put(`/leads/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error(
        `PUT /leads/${id}/status failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `DELETE /leads/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  restoreLead: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/leads/${id}/restore`);
      return response.data;
    } catch (error: any) {
      console.error(
        `PUT /leads/${id}/restore failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};

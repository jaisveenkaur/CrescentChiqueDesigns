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

// Memory-based local mock lead store to simulate database state updates
let mockLeads: Lead[] = [
  {
    id: 'lead-1',
    customer_id: 'customer-id-456',
    name: 'Jaisveen Kaur',
    email: 'jaisveen@gmail.com',
    phone: '+1 (555) 019-2834',
    requirements: 'Modern modular kitchen with gold accents and smart storage containers.',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    customer_id: null,
    name: 'Sarah Connor',
    email: 'sarah@terminator.com',
    phone: '+1 (555) 012-3456',
    requirements: 'Minimalist glassmorphic loft penthouse dining room and bar layout.',
    status: 'contacted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'lead-3',
    customer_id: 'customer-id-789',
    name: 'Robert Downey',
    email: 'robert@stark.com',
    phone: '+1 (555) 014-9999',
    requirements: 'Custom home automation study room, dark wood finishes, and recessed gold trim.',
    status: 'qualified',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  }
];

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
    } catch (error) {
      console.warn('Leads API failed, returning mock leads list', error);
      
      let filtered = [...mockLeads];
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter(l => l.status === params.status);
      }
      if (params?.name) {
        filtered = filtered.filter(l => l.name.toLowerCase().includes(params.name!.toLowerCase()));
      }
      if (params?.email) {
        filtered = filtered.filter(l => l.email.toLowerCase().includes(params.email!.toLowerCase()));
      }

      const page = params?.page || 1;
      const per_page = params?.per_page || 10;
      const start = (page - 1) * per_page;
      const items = filtered.slice(start, start + per_page);

      return {
        page,
        per_page,
        total: filtered.length,
        pages: Math.ceil(filtered.length / per_page),
        items,
      };
    }
  },

  getLeadDetails: async (id: string): Promise<Lead> => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Lead details API for ${id} failed, returning mock`, error);
      const lead = mockLeads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');
      return lead;
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
    } catch (error) {
      console.warn('Create lead API failed, performing mock addition', error);
      const newLead: Lead = {
        id: 'lead-' + Math.random().toString(36).substr(2, 9),
        customer_id: typeof window !== 'undefined' ? localStorage.getItem('user_id') : null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        requirements: data.requirements || '',
        status: 'new',
        created_at: new Date().toISOString(),
      };
      mockLeads = [newLead, ...mockLeads];
      return {
        message: 'Lead created successfully (mock fallback)',
        lead: newLead,
      };
    }
  },

  updateLeadStatus: async (
    id: string,
    status: 'new' | 'contacted' | 'qualified' | 'lost'
  ): Promise<{ message: string; lead: { id: string; status: string } }> => {
    try {
      const response = await api.put(`/leads/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn(`Update lead status API for ${id} failed, applying mock`, error);
      const leadIndex = mockLeads.findIndex(l => l.id === id);
      if (leadIndex === -1) throw new Error('Lead not found');
      mockLeads[leadIndex].status = status;
      return {
        message: 'Lead status updated successfully (mock fallback)',
        lead: { id, status },
      };
    }
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete lead API for ${id} failed, performing mock delete`, error);
      mockLeads = mockLeads.filter(l => l.id !== id);
      return { message: 'Lead deleted successfully (mock fallback)' };
    }
  },

  restoreLead: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/leads/${id}/restore`);
      return response.data;
    } catch (error) {
      console.warn(`Restore lead API for ${id} failed, returning mock status`, error);
      return { message: 'Lead restored successfully (mock fallback)' };
    }
  },
};

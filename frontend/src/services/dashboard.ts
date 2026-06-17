import { api } from './api';

export interface AdminDashboardMetrics {
  total_leads: number;
  total_customers: number;
  total_projects: number;
  average_progress_percentage: number;
  total_quotations: number;
  recent_activities: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    user_name?: string;
  }>;
}

export interface CustomerDashboardMetrics {
  total_appointments: number;
  total_quotations: number;
  total_files: number;
  active_project?: {
    id: string;
    project_status: string;
    progress_percentage: number;
    expected_completion?: string | null;
  } | null;
  recent_notifications: Array<{
    id: string;
    title: string;
    message: string;
    created_at: string;
  }>;
}

export interface TimelineEvent {
  type: 'lead' | 'appointment' | 'quotation' | 'project' | 'file' | 'notification';
  title: string;
  description: string;
  created_at: string;
}

export interface TimelineResponse {
  total_events: number;
  items: TimelineEvent[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: string | null;
  timestamp: string;
  user_name?: string;
}

export interface AuditLogsResponse {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  items: AuditLog[];
}

export const dashboardService = {
  getAdminDashboard: async (): Promise<AdminDashboardMetrics> => {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      console.warn('Admin Dashboard API failed, returning mock analytics', error);
      return {
        total_leads: 124,
        total_customers: 48,
        total_projects: 12,
        average_progress_percentage: 42.5,
        total_quotations: 86,
        recent_activities: [
          {
            id: 'act-1',
            action: 'Lead Created',
            details: 'Lead ID lead-1 created for customer Jaisveen Kaur',
            timestamp: new Date().toISOString(),
            user_name: 'Jaisveen Kaur',
          },
          {
            id: 'act-2',
            action: 'Project Progress Updated',
            details: 'Project ID proj-1 updated progress to 65%',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            user_name: 'Senior Architect',
          },
          {
            id: 'act-3',
            action: 'PDF Generated',
            details: 'PDF generated for Quotation ID quote-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            user_name: 'Jaisveen Kaur',
          },
          {
            id: 'act-4',
            action: 'File Uploaded',
            details: 'File ID file-2 uploaded. Filename: living_room_inspiration.jpg',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            user_name: 'Jaisveen Kaur',
          }
        ]
      };
    }
  },

  getCustomerDashboard: async (): Promise<CustomerDashboardMetrics> => {
    try {
      const response = await api.get('/dashboard/customer');
      return response.data;
    } catch (error) {
      console.warn('Customer Dashboard API failed, returning mock analytics', error);
      return {
        total_appointments: 2,
        total_quotations: 1,
        total_files: 2,
        active_project: {
          id: 'proj-1',
          project_status: 'Execution',
          progress_percentage: 65,
          expected_completion: '2026-08-15',
        },
        recent_notifications: [
          {
            id: 'n-1',
            title: 'Appointment Confirmed',
            message: 'Your interior design consultation is confirmed for June 20th at 10:00 AM.',
            created_at: new Date().toISOString(),
          },
          {
            id: 'n-2',
            title: 'New Project Note Added',
            message: 'The Senior Architect added a note to your Living Room design project.',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          }
        ]
      };
    }
  },

  getCustomerTimeline: async (): Promise<TimelineResponse> => {
    try {
      const response = await api.get('/timeline');
      return response.data;
    } catch (error) {
      console.warn('Customer Timeline API failed, generating mock chronological events', error);
      const events: TimelineEvent[] = [
        {
          type: 'lead',
          title: 'Lead Inquiry Submitted',
          description: 'Interested in modern kitchen remodeling and luxury Japandi details.',
          created_at: '2026-05-18T10:00:00Z',
        },
        {
          type: 'appointment',
          title: 'Consultation Scheduled',
          description: 'Consultation slot booked for June 20th, 2026 at 10:00 AM.',
          created_at: '2026-05-19T11:30:00Z',
        },
        {
          type: 'quotation',
          title: 'Quotation Generated',
          description: 'First quotation quote-1 with total cost $376,125 generated.',
          created_at: '2026-05-20T09:45:00Z',
        },
        {
          type: 'project',
          title: 'Project Initialized',
          description: 'Project proj-1 kicked off. Status set to Design Phase.',
          created_at: '2026-06-01T10:00:00Z',
        },
        {
          type: 'file',
          title: 'Floor Plan Uploaded',
          description: 'File kitchen_layout_draft.pdf uploaded to project workspace.',
          created_at: '2026-06-14T12:00:00Z',
        },
        {
          type: 'project',
          title: 'Project Progress Updated',
          description: 'Project status transitioned to Execution. Completion status: 65%.',
          created_at: '2026-06-15T09:30:00Z',
        }
      ];
      return {
        total_events: events.length,
        items: events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      };
    }
  },

  getAuditLogs: async (params?: {
    page?: number;
    per_page?: number;
    action?: string;
    user_id?: string;
  }): Promise<AuditLogsResponse> => {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.warn('Audit Logs API failed, returning mock audit history stream', error);
      let items: AuditLog[] = [
        {
          id: 'log-1',
          user_id: 'customer-id-456',
          action: 'User Login',
          details: 'User jaisveen@gmail.com logged in from IP 127.0.0.1',
          timestamp: new Date().toISOString(),
          user_name: 'Jaisveen Kaur',
        },
        {
          id: 'log-2',
          user_id: 'admin-id-123',
          user_name: 'Senior Architect',
          action: 'Project Progress Updated',
          details: 'Project ID proj-1 progress updated to 65%',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: 'log-3',
          user_id: 'customer-id-456',
          user_name: 'Jaisveen Kaur',
          action: 'PDF Generated',
          details: 'PDF generated for Quotation ID quote-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 'log-4',
          user_id: 'customer-id-456',
          user_name: 'Jaisveen Kaur',
          action: 'File Uploaded',
          details: 'File ID file-2 uploaded. Filename: living_room_inspiration.jpg',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
        {
          id: 'log-5',
          user_id: 'admin-id-123',
          user_name: 'Senior Architect',
          action: 'Project Note Added',
          details: 'Note added to Project ID proj-1: Custom natural oak paneling ordered...',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        }
      ];

      if (params?.action && params.action !== 'all') {
        items = items.filter(i => i.action === params.action);
      }
      if (params?.user_id) {
        items = items.filter(i => i.user_id === params.user_id);
      }

      const page = params?.page || 1;
      const per_page = params?.per_page || 10;
      const start = (page - 1) * per_page;

      return {
        page,
        per_page,
        total: items.length,
        pages: Math.ceil(items.length / per_page),
        items: items.slice(start, start + per_page),
      };
    }
  },
};

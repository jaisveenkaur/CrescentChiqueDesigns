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
      console.log('[DASHBOARD API SUCCESS] Loaded admin stats');
      return response.data;
    } catch (error: any) {
      console.error(
        "[DASHBOARD API FAILED] GET /dashboard/admin failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getCustomerDashboard: async (): Promise<CustomerDashboardMetrics> => {
    try {
      const response = await api.get('/dashboard/customer');
      console.log('[DASHBOARD API SUCCESS] Loaded customer stats');
      return response.data;
    } catch (error: any) {
      console.error(
        "[DASHBOARD API FAILED] GET /dashboard/customer failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getCustomerTimeline: async (): Promise<TimelineResponse> => {
    try {
      const response = await api.get('/timeline');
      return response.data;
    } catch (error: any) {
      console.error(
        "GET /timeline failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
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
    } catch (error: any) {
      console.error(
        "GET /audit-logs failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};

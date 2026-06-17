import { api } from './api';

export interface Appointment {
  id: string;
  customer_id: string;
  customer_name?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  requirements?: string | null;
  floor_plan_url?: string | null;
}

export interface AppointmentsListResponse {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  items: Appointment[];
}

export const appointmentService = {
  getAppointments: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    appointment_date?: string;
  }): Promise<AppointmentsListResponse> => {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "GET /appointments failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  createAppointment: async (data: {
    appointment_date: string;
    appointment_time: string;
    requirements?: string;
    floor_plan_url?: string;
  }): Promise<{ message: string; appointment: Appointment }> => {
    try {
      const response = await api.post('/appointments', data);
      return response.data;
    } catch (error: any) {
      console.error(
        "POST /appointments failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  updateAppointmentStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<{ message: string; appointment: { id: string; status: string } }> => {
    try {
      const response = await api.put(`/appointments/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error(
        `PUT /appointments/${id}/status failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  cancelAppointment: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `DELETE /appointments/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};

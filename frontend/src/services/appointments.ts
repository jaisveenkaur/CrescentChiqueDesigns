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

let mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    customer_id: 'customer-id-456',
    customer_name: 'Jaisveen Kaur',
    appointment_date: '2026-06-20',
    appointment_time: '10:00:00',
    status: 'confirmed',
    requirements: 'Need to discuss kitchen remodeling layout and material grades.',
    floor_plan_url: null,
  },
  {
    id: 'appt-2',
    customer_id: 'customer-id-456',
    customer_name: 'Jaisveen Kaur',
    appointment_date: '2026-06-28',
    appointment_time: '14:30:00',
    status: 'pending',
    requirements: 'Living room layout and furniture selection consultation.',
    floor_plan_url: null,
  },
  {
    id: 'appt-3',
    customer_id: 'customer-id-789',
    customer_name: 'Robert Downey',
    appointment_date: '2026-06-18',
    appointment_time: '11:00:00',
    status: 'completed',
    requirements: 'Home theater acoustics and leather seating layout discussion.',
    floor_plan_url: 'https://example.com/floorplans/robert_penthouse.pdf',
  }
];

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
    } catch (error) {
      console.warn('Appointments API failed, returning mock list', error);
      let items = [...mockAppointments];

      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role');
        const customerId = localStorage.getItem('user_id');
        if (role === 'customer' && customerId) {
          items = items.filter(a => a.customer_id === customerId);
        }
      }

      if (params?.status && params.status !== 'all') {
        items = items.filter(a => a.status === params.status);
      }
      if (params?.appointment_date) {
        items = items.filter(a => a.appointment_date === params.appointment_date);
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

  createAppointment: async (data: {
    appointment_date: string;
    appointment_time: string;
    requirements?: string;
    floor_plan_url?: string;
  }): Promise<{ message: string; appointment: Appointment }> => {
    try {
      const response = await api.post('/appointments', data);
      return response.data;
    } catch (error) {
      console.warn('Create appointment API failed, writing mock item', error);
      const newAppt: Appointment = {
        id: 'appt-' + Math.random().toString(36).substr(2, 9),
        customer_id: (typeof window !== 'undefined' && localStorage.getItem('user_id')) || 'customer-id-456',
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time + ':00',
        status: 'pending',
        requirements: data.requirements || '',
        floor_plan_url: data.floor_plan_url || null,
      };
      mockAppointments = [newAppt, ...mockAppointments];
      return {
        message: 'Appointment scheduled successfully (mock fallback)',
        appointment: newAppt,
      };
    }
  },

  updateAppointmentStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<{ message: string; appointment: { id: string; status: string } }> => {
    try {
      const response = await api.put(`/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn(`Update appointment status for ${id} failed, applying mock`, error);
      const idx = mockAppointments.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockAppointments[idx].status = status;
      }
      return {
        message: 'Appointment status modified successfully (mock fallback)',
        appointment: { id, status },
      };
    }
  },

  cancelAppointment: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Cancel appointment API for ${id} failed, canceling in mock`, error);
      const idx = mockAppointments.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockAppointments[idx].status = 'cancelled';
      }
      return { message: 'Appointment cancelled successfully (mock fallback)' };
    }
  },
};

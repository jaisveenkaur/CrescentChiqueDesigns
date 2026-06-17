import { api } from './api';

export interface Notification {
  id: string;
  customer_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

let mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    customer_id: 'customer-id-456',
    title: 'Appointment Confirmed',
    message: 'Your interior design consultation is confirmed for June 20th at 10:00 AM.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif-2',
    customer_id: 'customer-id-456',
    title: 'Quotation Generated',
    message: 'A detailed pricing quotation for Modern Japandi Living Room has been generated.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-3',
    customer_id: 'customer-id-456',
    title: 'New Project Note Added',
    message: 'The Senior Architect added a note to your Living Room design project.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  }
];

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.warn('Notifications API failed, returning mock list', error);
      return mockNotifications;
    }
  },

  getNotificationDetails: async (id: string): Promise<Notification> => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Notification details API for ${id} failed, returning mock`, error);
      const notif = mockNotifications.find(n => n.id === id);
      if (!notif) throw new Error('Notification not found');
      return notif;
    }
  },

  markNotificationRead: async (
    id: string
  ): Promise<{ message: string; notification: { id: string; is_read: boolean } }> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.warn(`Mark notification read API for ${id} failed, applying mock`, error);
      const index = mockNotifications.findIndex(n => n.id === id);
      if (index !== -1) {
        mockNotifications[index].is_read = true;
      }
      return {
        message: 'Notification marked as read successfully (mock fallback)',
        notification: { id, is_read: true },
      };
    }
  },
};

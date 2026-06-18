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

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.warn(
        "GET /notifications failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getNotificationDetails: async (id: string): Promise<Notification> => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `GET /notifications/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  markNotificationRead: async (
    id: string
  ): Promise<{ message: string; notification: { id: string; is_read: boolean } }> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `PUT /notifications/${id}/read failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  broadcastNotification: async (data: { customer_id: string; title: string; message: string }): Promise<any> => {
    try {
      const response = await api.post('/notifications', data);
      return response.data;
    } catch (error: any) {
      console.warn(
        "POST /notifications failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  }
};

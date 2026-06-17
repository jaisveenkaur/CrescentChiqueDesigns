import { api } from './api';

export interface DesignImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Design {
  id: string;
  title: string;
  description: string;
  room_type: string;
  style: string;
  price_per_sqft: number;
  image_url: string;
  images?: DesignImage[];
}

export const designService = {
  getDesigns: async (): Promise<Design[]> => {
    try {
      const response = await api.get('/designs');
      // If server returned an array, use it
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error(
        "GET /designs failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getDesignDetails: async (id: string): Promise<Design> => {
    try {
      const response = await api.get(`/designs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `GET /designs/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  }
};

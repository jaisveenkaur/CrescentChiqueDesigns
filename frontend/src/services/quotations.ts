import { api } from './api';

export interface Quotation {
  id: string;
  customer_id: string;
  design_id?: string | null;
  area_sqft: number;
  material_grade: 'Economy' | 'Premium' | 'Luxury';
  material_cost: number;
  labour_cost: number;
  design_cost: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export interface QuotationEstimation {
  material_cost: number;
  labour_cost: number;
  design_cost: number;
  tax_amount: number;
  total_amount: number;
}

export const quotationService = {
  generateEstimation: async (data: {
    design_id: string;
    area_sqft: number;
    material_grade: 'Economy' | 'Premium' | 'Luxury';
  }): Promise<QuotationEstimation> => {
    try {
      const response = await api.post('/quotations/generate', data);
      return response.data;
    } catch (error: any) {
      console.warn(
        "POST /quotations/generate failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  saveQuotation: async (data: {
    design_id: string;
    area_sqft: number;
    material_grade: 'Economy' | 'Premium' | 'Luxury';
    customer_id?: string;
    status?: 'pending' | 'accepted' | 'rejected';
  }): Promise<Quotation> => {
    try {
      const response = await api.post('/quotations', data);
      return response.data;
    } catch (error: any) {
      console.warn(
        "POST /quotations failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  editQuotation: async (
    id: string,
    data: {
      design_id?: string;
      area_sqft?: number;
      material_grade?: 'Economy' | 'Premium' | 'Luxury';
      customer_id?: string;
      status?: 'pending' | 'accepted' | 'rejected';
    }
  ): Promise<{ message: string; quotation: Quotation }> => {
    try {
      const response = await api.put(`/quotations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.warn(
        `PUT /quotations/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },


  getQuotations: async (params?: {
    page?: number;
    per_page?: number;
    material_grade?: string;
    min_amount?: number;
    max_amount?: number;
  }): Promise<{ page: number; per_page: number; total: number; pages: number; items: Quotation[] }> => {
    try {
      const response = await api.get('/quotations', { params });
      return response.data;
    } catch (error: any) {
      console.warn(
        "GET /quotations failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getQuotationDetails: async (id: string): Promise<Quotation> => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `GET /quotations/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteQuotation: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/quotations/${id}`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `DELETE /quotations/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  restoreQuotation: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/quotations/${id}/restore`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `PUT /quotations/${id}/restore failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getQuotationPdfBlob: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.warn(
        `GET /quotations/${id}/pdf failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};

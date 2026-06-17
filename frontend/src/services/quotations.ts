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

let mockQuotations: Quotation[] = [
  {
    id: 'quote-1',
    customer_id: 'customer-id-456',
    design_id: 'design-1',
    area_sqft: 850,
    material_grade: 'Premium',
    material_cost: 102000,
    labour_cost: 63750,
    design_cost: 153000,
    tax_amount: 57375,
    total_amount: 376125,
    created_at: '2026-05-20T09:45:00Z',
  },
  {
    id: 'quote-2',
    customer_id: 'customer-id-789',
    design_id: 'design-3',
    area_sqft: 1200,
    material_grade: 'Luxury',
    material_cost: 211200,
    labour_cost: 132000,
    design_cost: 264000,
    tax_amount: 109296,
    total_amount: 716496,
    created_at: '2026-06-01T14:15:00Z',
  }
];

// Replicate cost calculation logic
const calculateMockCosts = (
  designId: string,
  areaSqft: number,
  materialGrade: 'Economy' | 'Premium' | 'Luxury'
): QuotationEstimation => {
  // Base cost depends on design. If not found, default to $150/sqft
  let pricePerSqft = 150;
  if (designId === 'design-1') pricePerSqft = 180;
  else if (designId === 'design-2') pricePerSqft = 150;
  else if (designId === 'design-3') pricePerSqft = 220;
  else if (designId === 'design-4') pricePerSqft = 140;
  else if (designId === 'design-5') pricePerSqft = 250;

  const design_cost = pricePerSqft * areaSqft;
  
  let gradeMultiplier = 1.0;
  if (materialGrade === 'Premium') gradeMultiplier = 1.5;
  if (materialGrade === 'Luxury') gradeMultiplier = 2.2;

  const material_cost = areaSqft * 80 * gradeMultiplier;
  const labour_cost = areaSqft * 50 * gradeMultiplier;
  
  const subtotal = material_cost + labour_cost + design_cost;
  const tax_amount = subtotal * 0.18; // 18% GST
  const total_amount = subtotal + tax_amount;

  return {
    material_cost,
    labour_cost,
    design_cost,
    tax_amount,
    total_amount,
  };
};

export const quotationService = {
  generateEstimation: async (data: {
    design_id: string;
    area_sqft: number;
    material_grade: 'Economy' | 'Premium' | 'Luxury';
  }): Promise<QuotationEstimation> => {
    try {
      const response = await api.post('/quotations/generate', data);
      return response.data;
    } catch (error) {
      console.warn('Generate quotation estimation API failed, calculating local mock', error);
      return calculateMockCosts(data.design_id, data.area_sqft, data.material_grade);
    }
  },

  saveQuotation: async (data: {
    design_id: string;
    area_sqft: number;
    material_grade: 'Economy' | 'Premium' | 'Luxury';
  }): Promise<Quotation> => {
    try {
      const response = await api.post('/quotations', data);
      return response.data;
    } catch (error) {
      console.warn('Save quotation API failed, creating mock record', error);
      const calculated = calculateMockCosts(data.design_id, data.area_sqft, data.material_grade);
      const newQuotation: Quotation = {
        id: 'quote-' + Math.random().toString(36).substr(2, 9),
        customer_id: (typeof window !== 'undefined' && localStorage.getItem('user_id')) || 'customer-id-456',
        design_id: data.design_id,
        area_sqft: data.area_sqft,
        material_grade: data.material_grade,
        ...calculated,
        created_at: new Date().toISOString(),
      };
      mockQuotations = [newQuotation, ...mockQuotations];
      return newQuotation;
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
    } catch (error) {
      console.warn('Get quotations list API failed, returning mocks', error);
      let items = [...mockQuotations];
      
      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role');
        const customerId = localStorage.getItem('user_id');
        if (role === 'customer' && customerId) {
          items = items.filter(q => q.customer_id === customerId);
        }
      }

      if (params?.material_grade && params.material_grade !== 'all') {
        items = items.filter(q => q.material_grade === params.material_grade);
      }
      if (params?.min_amount) {
        items = items.filter(q => q.total_amount >= params.min_amount!);
      }
      if (params?.max_amount) {
        items = items.filter(q => q.total_amount <= params.max_amount!);
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

  getQuotationDetails: async (id: string): Promise<Quotation> => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Get quotation details API for ${id} failed, returning mock`, error);
      const quote = mockQuotations.find(q => q.id === id);
      if (!quote) throw new Error('Quotation not found');
      return quote;
    }
  },

  deleteQuotation: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete quotation API for ${id} failed, performing mock delete`, error);
      mockQuotations = mockQuotations.filter(q => q.id !== id);
      return { message: 'Quotation deleted successfully (mock fallback)' };
    }
  },

  restoreQuotation: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/quotations/${id}/restore`);
      return response.data;
    } catch (error) {
      console.warn(`Restore quotation API for ${id} failed, returning mock status`, error);
      return { message: 'Quotation restored successfully (mock fallback)' };
    }
  },

  getQuotationPdfBlob: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.warn(`Quotation PDF download API for ${id} failed, creating mock dummy PDF blob`, error);
      // Create a dummy PDF text blob
      return new Blob(['%PDF-1.4 Mock Quotation Content for ID ' + id], { type: 'application/pdf' });
    }
  },
};

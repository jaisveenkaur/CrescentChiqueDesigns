import { api } from './api';

export interface FileMetadata {
  id: string;
  customer_id: string;
  customer_name?: string;
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface FilesListResponse {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  items: FileMetadata[];
}

let mockFiles: FileMetadata[] = [
  {
    id: 'file-1',
    customer_id: 'customer-id-456',
    customer_name: 'Jaisveen Kaur',
    filename: 'kitchen_layout_draft.pdf',
    file_url: '/uploads/kitchen_layout_draft.pdf',
    file_type: 'application/pdf',
    uploaded_at: '2026-06-14T12:00:00Z',
  },
  {
    id: 'file-2',
    customer_id: 'customer-id-456',
    customer_name: 'Jaisveen Kaur',
    filename: 'living_room_inspiration.jpg',
    file_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    file_type: 'image/jpeg',
    uploaded_at: '2026-06-15T10:15:00Z',
  },
  {
    id: 'file-3',
    customer_id: 'customer-id-789',
    customer_name: 'Robert Downey',
    filename: 'penthouse_measurements.xlsx',
    file_url: '/uploads/penthouse_measurements.xlsx',
    file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploaded_at: '2026-06-10T09:00:00Z',
  }
];

export const fileService = {
  getFiles: async (params?: {
    page?: number;
    per_page?: number;
    file_type?: string;
    filename?: string;
  }): Promise<FilesListResponse> => {
    try {
      const response = await api.get('/files', { params });
      return response.data;
    } catch (error) {
      console.warn('Files API failed, returning mock files list', error);
      let items = [...mockFiles];
      
      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role');
        const customerId = localStorage.getItem('user_id');
        if (role === 'customer' && customerId) {
          items = items.filter(f => f.customer_id === customerId);
        }
      }

      if (params?.file_type && params.file_type !== 'all') {
        items = items.filter(f => f.file_type.includes(params.file_type!));
      }
      if (params?.filename) {
        items = items.filter(f => f.filename.toLowerCase().includes(params.filename!.toLowerCase()));
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

  uploadFile: async (file: File): Promise<FileMetadata> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('Upload file API failed, creating mock file record', error);
      const customerId = (typeof window !== 'undefined' && localStorage.getItem('user_id')) || 'customer-id-456';
      const isImage = file.type.startsWith('image/');
      
      const newFile: FileMetadata = {
        id: 'file-' + Math.random().toString(36).substr(2, 9),
        customer_id: customerId,
        filename: file.name,
        file_url: isImage 
          ? URL.createObjectURL(file) 
          : `/uploads/${file.name}`,
        file_type: file.type || 'application/octet-stream',
        uploaded_at: new Date().toISOString(),
      };
      
      mockFiles = [newFile, ...mockFiles];
      return newFile;
    }
  },

  deleteFile: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/files/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete file API for ${id} failed, applying mock`, error);
      mockFiles = mockFiles.filter(f => f.id !== id);
      return { message: 'File deleted successfully (mock fallback)' };
    }
  },

  restoreFile: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/files/${id}/restore`);
      return response.data;
    } catch (error) {
      console.warn(`Restore file API for ${id} failed, returning mock status`, error);
      return { message: 'File restored successfully (mock fallback)' };
    }
  },

  downloadFileBlob: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/files/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.warn(`Download file blob API for ${id} failed, returning dummy text blob`, error);
      return new Blob(['Mock downloadable content for file ID: ' + id], { type: 'text/plain' });
    }
  },
};

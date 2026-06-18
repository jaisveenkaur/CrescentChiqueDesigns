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
    } catch (error: any) {
      console.warn(
        "GET /files failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
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
    } catch (error: any) {
      console.warn(
        "POST /files/upload failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteFile: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/files/${id}`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `DELETE /files/${id} failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  restoreFile: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/files/${id}/restore`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `PUT /files/${id}/restore failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  downloadFileBlob: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/files/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.warn(
        `GET /files/${id}/download failed`,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};

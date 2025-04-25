import {
  Business,
  CreateBusinessDto,
  UpdateBusinessDto,
} from '../models/Business';
import { AuthService } from './auth.service';

const API_URL = `${process.env.REACT_APP_API_URL}/businesses`;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const BusinessService = {
  async getAllBusinesses(): Promise<ApiResponse<Business[]>> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    return response.json();
  },

  async getBusinessesByStatus(status: string): Promise<ApiResponse<Business[]>> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    return response.json();
  },

  async getUserBusinesses(): Promise<ApiResponse<Business[]>> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    return response.json();
  },

  async getBusinessById(id: string): Promise<ApiResponse<Business>> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch business');
    }
    return response.json();
  },

  async createBusiness(
    data: CreateBusinessDto & { image?: File }
  ): Promise<Business> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (
        key === 'image' &&
        value &&
        typeof value === 'object' &&
        'name' in value
      ) {
        formData.append('image', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create business');
    }
    return response.json();
  },

  async updateBusiness(
    id: string,
    data: UpdateBusinessDto & { image?: File }
  ): Promise<Business> {
    const formData = new FormData();

    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    Object.entries(data).forEach(([key, value]) => {
      if (
        key === 'image' &&
        value &&
        typeof value === 'object' &&
        'name' in value
      ) {
        formData.append('image', value);
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update business');
    }
    return response.json();
  },

  async deleteBusiness(id: string): Promise<void> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete business');
    }
  },

  async changeStatus(id: string, status: string): Promise<Business> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/change-status/${id}/${status}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change status');
    }

    return response.json();
  },
};

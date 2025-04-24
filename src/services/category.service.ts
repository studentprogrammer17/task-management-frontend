import axios from 'axios';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../models/Category';
import { Task } from '../models/Task';
import { AuthService } from './auth.service';

const API_URL = `${process.env.REACT_APP_API_URL}/categories`;

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    const response = await axios.get<Category[]>(API_URL);
    return response.data;
  }

  static async getTasksByCategoryId(id: string): Promise<Task[]> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.get<Task[]>(`${API_URL}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async getCategoryById(id: string): Promise<Category> {
    const response = await axios.get<Category>(`${API_URL}/${id}`);
    return response.data;
  }

  static async createCategory(category: CreateCategoryDto): Promise<Category> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.post<Category>(API_URL, category, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async updateCategory(
    id: string,
    category: UpdateCategoryDto
  ): Promise<Category> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.put<Category>(`${API_URL}/${id}`, category, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

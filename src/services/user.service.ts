import axios from 'axios';
import { AuthService } from './auth.service';
import {
  CreateUserByAdminDto,
  CreateUserDto,
  UpdateUserDto,
  User,
} from '../models/User';

const API_URL = `${process.env.REACT_APP_API_URL}/users`;

export class UserService {
  static async getAllUsers(
    search: string = '',
    page: number = 1,
    limit: number = 5
  ): Promise<{ edges: User[]; pageInfo: any }> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const params: Record<string, any> = {
      page,
      limit,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get<{ edges: User[]; pageInfo: any }>(
      API_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );

    return response.data;
  }

  static async getUserById(id: string): Promise<User> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.get<User>(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async createUser(task: CreateUserByAdminDto): Promise<User> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.post<User>(API_URL, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async updateUser(id: string, user: UpdateUserDto): Promise<User> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.put<User>(`${API_URL}/${id}`, user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
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

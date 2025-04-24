import axios from 'axios';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  User,
} from '../models/User';

const API_URL = `${process.env.REACT_APP_API_URL}/auth`;

export class AuthService {
  static async register(userData: CreateUserDto): Promise<void> {
    await axios.post(`${API_URL}/register`, userData);
  }

  static async login(userData: LoginDto): Promise<string> {
    const response = await axios.post<{ token: string }>(
      `${API_URL}/login`,
      userData
    );
    const token = response.data.token;
    localStorage.setItem('token', token);
    return token;
  }

  static async changePassword(
    changePassDto: ChangePasswordDto
  ): Promise<string> {
    const token = this.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.post<{ message: string }>(
      `${API_URL}/changePassword`,
      changePassDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const msg = response.data.message;
    return msg;
  }

  static logout(): void {
    localStorage.removeItem('token');
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static async getMe(): Promise<User> {
    const token = this.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.get<User>(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = AuthService.getToken();

    if (!token) {
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/verify-token`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

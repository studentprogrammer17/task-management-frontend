import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/Task';
import { AuthService } from './auth.service';

const API_URL = `${process.env.REACT_APP_API_URL}/tasks`;

export class TaskService {
  static async getAllTasks(): Promise<Task[]> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.get<Task[]>(`${API_URL}/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async getTaskById(id: string): Promise<Task> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.get<Task>(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async createTask(task: CreateTaskDto): Promise<Task> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.post<Task>(API_URL, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async updateTask(id: string, task: UpdateTaskDto): Promise<Task> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.put<Task>(`${API_URL}/${id}`, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async deleteTask(id: string): Promise<void> {
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

  static async addSubtask(
    parentId: string,
    subtask: CreateTaskDto
  ): Promise<Task> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await axios.post<Task>(
      `${API_URL}/${parentId}/subtasks`,
      subtask,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
}

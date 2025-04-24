import { Comment } from "./Comment";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  subtasks?: Task[];
  lat?: number;
  lng?: number;
  endTime?: string;
  createdAt: string;
  categoryId?: string;
  categoryName?: string;
  parentId?: string;
  comments?: Comment[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
  endTime?: string;
  lat?: number;
  lng?: number;
  categoryId?: string;
  subtasks?: CreateTaskDto[];
  parentId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  endTime?: string;
  categoryId?: string;
  status?: TaskStatus;
  subtasks?: CreateTaskDto[];
}

import axios from "axios";
import { Comment, CreateCommentDto, UpdateCommentDto } from "../models/Comment";

const API_URL = `${process.env.REACT_APP_API_URL}/comments`;

export class CommentService {
  static async getAllComments(): Promise<Comment[]> {
    const response = await axios.get<Comment[]>(API_URL);
    return response.data;
  }

  
  static async getCommentsByTaskId(id: string): Promise<Comment[]> {
    const response = await axios.get<Comment[]>(`${API_URL}/byTaskId/${id}`);
    return response.data;
  }

  static async getCommentById(id: string): Promise<Comment> {
    const response = await axios.get<Comment>(`${API_URL}/${id}`);
    return response.data;
  }

  static async createComment(comment: CreateCommentDto): Promise<Comment> {
    const response = await axios.post<Comment>(API_URL, comment);
    return response.data;
  }

  static async updateComment(
    id: string,
    comment: UpdateCommentDto
  ): Promise<Comment> {
    const response = await axios.put<Comment>(`${API_URL}/${id}`, comment);
    return response.data;
  }

  static async deleteComment(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }
}

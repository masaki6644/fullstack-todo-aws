import axios from "axios";
import { Task } from "../types/task";

//const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_BASE="https://d35kq53ogrg17t.cloudfront.net";

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await axios.get(`${API_BASE}/tasks/`);
  return res.data;
};

export const addTask = async (title: string): Promise<Task> => {
  const res = await axios.post(`${API_BASE}/tasks/`, { title, completed: false });
  return res.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/tasks/${id}/`);
};


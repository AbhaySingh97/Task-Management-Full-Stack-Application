import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const loginUser = (formData) => API.post('/auth/login', formData);
export const registerUser = (formData) => API.post('/auth/register', formData);

export const fetchTasks = (workspaceId) => API.get(`/tasks${workspaceId ? `?workspaceId=${workspaceId}` : ''}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const fetchWorkspaces = () => API.get('/workspaces');
export const createWorkspace = (data) => API.post('/workspaces', data);
export const addWorkspaceMember = (data) => API.post('/workspaces/add-member', data);

export const fetchComments = (taskId) => API.get(`/comments/${taskId}`);
export const createComment = (data) => API.post('/comments', data);

export default API;

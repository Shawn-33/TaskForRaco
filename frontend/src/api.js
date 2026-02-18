import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Admin endpoints
export const adminAPI = {
  getUsers: (skip = 0, limit = 100) => api.get('/admin/users', { params: { skip, limit } }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  assignRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  deactivateUser: (userId) => api.post(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),
};

// Buyer endpoints
export const buyerAPI = {
  createProject: (data) => api.post('/buyer/projects', data),
  getProjects: (skip = 0, limit = 100) => api.get('/buyer/projects', { params: { skip, limit } }),
  getProject: (projectId) => api.get(`/buyer/projects/${projectId}`),
  updateProject: (projectId, data) => api.patch(`/buyer/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/buyer/projects/${projectId}`),
  getProjectRequests: (projectId) => api.get(`/buyer/projects/${projectId}/requests`),
  assignSolver: (projectId, problemSolverId) => 
    api.post(`/buyer/projects/${projectId}/assign`, { problem_solver_id: problemSolverId }),
};

// Problem Solver endpoints
export const solverAPI = {
  browseProjects: (skip = 0, limit = 100) => api.get('/solver/projects', { params: { skip, limit } }),
  getProject: (projectId) => api.get(`/solver/projects/${projectId}`),
  requestProject: (projectId) => api.post(`/solver/projects/${projectId}/request`),
  getAssignments: () => api.get('/solver/my-assignments'),
  createTask: (data) => api.post('/solver/tasks', data),
  getTasks: () => api.get('/solver/tasks'),
  getTask: (taskId) => api.get(`/solver/tasks/${taskId}`),
  updateTask: (taskId, data) => api.patch(`/solver/tasks/${taskId}`, data),
  submitTask: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/solver/tasks/${taskId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Submission endpoints
export const submissionAPI = {
  getProjectSubmissions: (projectId) => api.get(`/submissions/projects/${projectId}`),
  getSubmission: (submissionId) => api.get(`/submissions/${submissionId}`),
  reviewSubmission: (submissionId, data) => api.post(`/submissions/${submissionId}/review`, data),
  downloadSubmission: (submissionId) => api.get(`/submissions/${submissionId}/download`, {
    responseType: 'blob',
  }),
};

export default api;

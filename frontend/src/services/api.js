// frontend/src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Projects
  getProjects: () => request('/projects'),

  // Tasks
  getTasks: (projectId = 1) => request(`/projects/${projectId}/tasks`),
  
  createTask: (projectId, taskData) =>
    request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  updateTask: (taskId, taskData) =>
    request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  moveTask: (taskId, { status, position }) =>
    request(`/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position }),
    }),

  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  addAssignee: (taskId, userId) =>
    request(`/tasks/${taskId}/assignees`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  removeAssignee: (taskId, userId) =>
    request(`/tasks/${taskId}/assignees/${userId}`, {
      method: 'DELETE',
    }),

  // Users
  getUsers: () => request('/users'),

  createUser: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  deleteUser: (userId) =>
    request(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

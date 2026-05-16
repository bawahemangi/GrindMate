import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ----- Auth -----
export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
}

// ----- Groups -----
export const groupsApi = {
  list: () => api.get('/auth/groups/'),
  create: (data) => api.post('/auth/groups/', data),
  get: (id) => api.get(`/auth/groups/${id}/`),
  update: (id, data) => api.patch(`/auth/groups/${id}/`, data),
  join: (invite_code) => api.post('/auth/groups/join/', { invite_code }),
  leave: (id) => api.post(`/auth/groups/${id}/leave/`),
  leaderboard: (id) => api.get(`/auth/groups/${id}/leaderboard/`),
}

// ----- Tasks -----
export const tasksApi = {
  list: (params) => api.get('/tasks/', { params }),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.patch(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  markComplete: (id, data) => api.post(`/tasks/${id}/complete/`, data || {}),
  unmarkComplete: (id) => api.delete(`/tasks/${id}/uncomplete/`),
  todayStats: (params) => api.get('/tasks/today/stats/', { params }),
  history: (params) => api.get('/tasks/history/', { params }),
  seedDefaults: (groupId) => api.post(`/tasks/groups/${groupId}/seed/`),
}

// ----- Notifications -----
export const notificationsApi = {
  testWhatsapp: () => api.post('/notifications/test-whatsapp/'),
}

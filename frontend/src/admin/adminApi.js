import axios from 'axios'

const adminApi = axios.create({
  baseURL: 'https://baizona-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Ongeza token kwenye kila ombi
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('baizona_admin_token')
  if (token) {
    config.headers['X-Admin-Token'] = token
  }
  return config
})

// Admin Auth
export const adminSetup = (data) => adminApi.post('/admin/setup', data).then(r => r.data)
export const adminLogin = (data) => adminApi.post('/admin/login', data).then(r => r.data)
export const adminGetMe = () => adminApi.get('/admin/me').then(r => r.data)

// Shops
export const getShops = () => adminApi.get('/shops').then(r => r.data)
export const getShop = (id) => adminApi.get(`/shops/${id}`).then(r => r.data)
export const createShop = (data) => adminApi.post('/shops', data).then(r => r.data)
export const updateShop = (id, data) => adminApi.put(`/shops/${id}`, data).then(r => r.data)
export const deleteShop = (id) => adminApi.delete(`/shops/${id}`).then(r => r.data)

// Auth helpers
export const saveAdminToken = (token, admin) => {
  localStorage.setItem('baizona_admin_token', token)
  localStorage.setItem('baizona_admin', JSON.stringify(admin))
}

export const getAdminToken = () => localStorage.getItem('baizona_admin_token')
export const getAdminData = () => {
  const data = localStorage.getItem('baizona_admin')
  return data ? JSON.parse(data) : null
}

export const clearAdminAuth = () => {
  localStorage.removeItem('baizona_admin_token')
  localStorage.removeItem('baizona_admin')
}

export const isAdminLoggedIn = () => !!getAdminToken()

export default adminApi

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
})

export const getProducts = () => api.get('/products').then(r => r.data)
export const createProduct = (data) => api.post('/products', data).then(r => r.data)
export const getProduct = (id) => api.get(`/products/${id}`).then(r => r.data)

export const getSales = () => api.get('/sales').then(r => r.data)
export const createSale = (data) => api.post('/sales', data).then(r => r.data)
export const getTodaySales = () => api.get('/sales/today').then(r => r.data)

export const getCustomers = () => api.get('/customers').then(r => r.data)
export const createCustomer = (data) => api.post('/customers', data).then(r => r.data)

export const createPayment = (data) => api.post('/payments', data).then(r => r.data)
export const getPayments = (customerId) => api.get(`/payments?customer_id=${customerId}`).then(r => r.data)

export default api

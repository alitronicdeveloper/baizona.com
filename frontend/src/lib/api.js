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

export const getSuppliers = () => api.get('/suppliers').then(r => r.data)
export const createSupplier = (data) => api.post('/suppliers', data).then(r => r.data)
export const getSupplier = (id) => api.get(`/suppliers/${id}`).then(r => r.data)
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data).then(r => r.data)

export const getSupplierProducts = (supplierId) => api.get(`/suppliers/${supplierId}/products`).then(r => r.data)
export const addSupplierProduct = (supplierId, data) => api.post(`/suppliers/${supplierId}/products`, data).then(r => r.data)
export const removeSupplierProduct = (supplierId, productId) => api.delete(`/suppliers/${supplierId}/products/${productId}`).then(r => r.data)
export const updateSupplierProductPrice = (supplierId, productId, price) => api.put(`/suppliers/${supplierId}/products/${productId}`, { supplier_price: price }).then(r => r.data)

export const getPurchases = () => api.get('/purchases').then(r => r.data)
export const createPurchase = (data) => api.post('/purchases', data).then(r => r.data)
export const getPurchasesBySupplier = (supplierId) => api.get(`/suppliers/${supplierId}/purchases`).then(r => r.data)

export const createSupplierPayment = (data) => api.post('/supplier-payments', data).then(r => r.data)
export const getSupplierPaymentsApi = (supplierId) => api.get(`/suppliers/${supplierId}/payments`).then(r => r.data)

export const getReturns = () => api.get('/returns').then(r => r.data)
export const createReturn = (data) => api.post('/returns', data).then(r => r.data)

export const getExpenses = () => api.get('/expenses').then(r => r.data)
export const createExpense = (data) => api.post('/expenses', data).then(r => r.data)

export const createDeposit = (data) => api.post('/deposits', data).then(r => r.data)
export const getDeposits = (customerId) => api.get(`/customers/${customerId}/deposits`).then(r => r.data)


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('baizona_user_token')
  if (token) {
    config.headers['X-User-Token'] = token
  }
  const shopId = localStorage.getItem('baizona_shop_id')
  if (shopId) {
    config.params = { ...config.params, shop_id: shopId }
  }
  return config
})

import { db, countUnsynced } from './dexie'
import api from '../lib/api'

export function isOnline() {
  return navigator.onLine
}

async function syncProducts() {
  const unsynced = await db.products.filter(p => !p.synced_at).toArray()

  for (const product of unsynced) {
    try {
      const result = await api.post('/products', {
        name: product.name,
        category: product.category,
        unit: product.unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        stock: product.stock,
        reorder_level: product.reorder_level,
      })

      await db.products.update(product.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync product error:', err)
    }
  }
}

async function syncCustomers() {
  const unsynced = await db.customers.filter(c => !c.synced_at).toArray()

  for (const customer of unsynced) {
    try {
      const result = await api.post('/customers', {
        name: customer.name,
        phone: customer.phone,
      })

      await db.customers.update(customer.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync customer error:', err)
    }
  }
}

async function syncSales() {
  const unsynced = await db.sales.filter(s => !s.synced_at).toArray()

  for (const sale of unsynced) {
    try {
      const items = await db.sale_items.where('sale_id').equals(sale.local_id).toArray()

      let customerRemoteId = null
      if (sale.customer_local_id) {
        const customer = await db.customers.get(sale.customer_local_id)
        if (customer?.remote_id) customerRemoteId = customer.remote_id
      }

      const itemsWithRemote = []
      for (const item of items) {
        const product = await db.products.get(item.product_local_id)
        if (product?.remote_id) {
          itemsWithRemote.push({
            product_id: product.remote_id,
            quantity: item.quantity,
          })
        }
      }

      if (itemsWithRemote.length === 0) {
        console.log('⚠️ Sale skipped (hakuna items zilizosync):', sale.local_id)
        continue
      }

      const payload = {
        payment_method: sale.payment_method,
        amount_paid: Number(sale.amount_paid) || 0,
        items: itemsWithRemote,
      }

      // Ongeza customer_id TU kama ipo
      if (customerRemoteId) {
        payload.customer_id = customerRemoteId
      }

      console.log('📤 Tuma mauzo kwa server:', JSON.stringify(payload, null, 2))

      const result = await api.post('/sales', payload)

      await db.sales.update(sale.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync sale error:', err)
    }
  }
}

async function syncPayments() {
  const unsynced = await db.payments.filter(p => !p.synced_at).toArray()

  for (const payment of unsynced) {
    try {
      const customer = await db.customers.get(payment.customer_local_id)
      if (!customer?.remote_id) continue

      const result = await api.post('/payments', {
        customer_id: customer.remote_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        notes: payment.notes,
      })

      await db.payments.update(payment.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync payment error:', err)
    }
  }
}

export async function syncAll() {
  if (!isOnline()) {
    return { success: false, message: 'Hakuna intaneti' }
  }

  try {
    await syncProducts()
    await syncCustomers()
    await syncSuppliers()
    await syncSupplierPayments()
    await syncSupplierProducts()
    await syncSales()
    await syncReturns()
    await syncExpenses()
    await syncDeposits()
    await syncPurchases()
    await syncPayments()

    const remaining = await countUnsynced()
    return {
      success: true,
      message: remaining === 0 ? 'Imesawazishwa kikamilifu' : `Zimesalia ${remaining}`,
      remaining,
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export function startAutoSync() {
  setInterval(async () => {
    if (isOnline()) {
      await syncAll()
    }
  }, 30000)
}


// =====================================================
// SUPPLIERS
// =====================================================
async function syncSuppliers() {
  const unsynced = await db.suppliers.filter(s => !s.synced_at).toArray()

  for (const supplier of unsynced) {
    try {
      const result = await api.post('/suppliers', {
        name: supplier.name,
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      })

      await db.suppliers.update(supplier.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync supplier error:', err)
    }
  }
}


// =====================================================
// SUPPLIER PRODUCTS
// =====================================================
async function syncSupplierProducts() {
  const unsynced = await db.supplier_products.filter(sp => !sp.synced_at).toArray()

  for (const sp of unsynced) {
    try {
      const supplier = await db.suppliers.get(sp.supplier_local_id)
      if (!supplier?.remote_id) continue

      const product = await db.products.get(sp.product_local_id)
      if (!product?.remote_id) continue

      const result = await api.post(`/suppliers/${supplier.remote_id}/products`, {
        product_id: product.remote_id,
        supplier_price: sp.supplier_price,
      })

      await db.supplier_products.update(sp.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync supplier product error:', err)
    }
  }
}


// =====================================================
// PURCHASES
// =====================================================
async function syncPurchases() {
  const unsynced = await db.purchases.filter(p => !p.synced_at).toArray()

  for (const purchase of unsynced) {
    try {
      const items = await db.purchase_items.where('purchase_id').equals(purchase.local_id).toArray()

      let supplierRemoteId = null
      if (purchase.supplier_local_id) {
        const supplier = await db.suppliers.get(purchase.supplier_local_id)
        if (supplier?.remote_id) supplierRemoteId = supplier.remote_id
      }

      const itemsWithRemote = []
      for (const item of items) {
        const product = await db.products.get(item.product_local_id)
        if (product?.remote_id) {
          itemsWithRemote.push({
            product_id: product.remote_id,
            product_name: item.product_name,
            quantity: item.quantity,
            cost_price: item.cost_price,
          })
        }
      }

      if (itemsWithRemote.length === 0) continue

      const payload = {
        amount_paid: Number(purchase.amount_paid) || 0,
        notes: purchase.notes || '',
        items: itemsWithRemote,
      }

      if (supplierRemoteId) payload.supplier_id = supplierRemoteId

      const result = await api.post('/purchases', payload)

      await db.purchases.update(purchase.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync purchase error:', err)
    }
  }
}


// =====================================================
// SUPPLIER PAYMENTS
// =====================================================
async function syncSupplierPayments() {
  const unsynced = await db.supplier_payments.filter(p => !p.synced_at).toArray()

  for (const payment of unsynced) {
    try {
      const supplier = await db.suppliers.get(payment.supplier_local_id)
      if (!supplier?.remote_id) continue

      const result = await api.post('/supplier-payments', {
        supplier_id: supplier.remote_id,
        amount: Number(payment.amount),
        payment_method: payment.payment_method,
        notes: payment.notes || '',
      })

      await db.supplier_payments.update(payment.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync supplier payment error:', err)
    }
  }
}


// =====================================================
// RETURNS
// =====================================================
async function syncReturns() {
  const unsynced = await db.returns.filter(r => !r.synced_at).toArray()

  for (const ret of unsynced) {
    try {
      const items = await db.return_items.where('return_id').equals(ret.local_id).toArray()

      let saleRemoteId = null
      if (ret.sale_id) {
        const sale = await db.sales.get(ret.sale_id)
        if (sale?.remote_id) saleRemoteId = sale.remote_id
      }

      let customerRemoteId = null
      if (ret.customer_local_id) {
        const customer = await db.customers.get(ret.customer_local_id)
        if (customer?.remote_id) customerRemoteId = customer.remote_id
      }

      const itemsWithRemote = []
      for (const item of items) {
        const product = await db.products.get(item.product_local_id)
        if (product?.remote_id) {
          itemsWithRemote.push({
            product_id: product.remote_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            cost_price: item.cost_price || 0,
          })
        }
      }

      if (itemsWithRemote.length === 0) continue

      const payload = {
        refund_method: ret.refund_method,
        reason: ret.reason || '',
        items: itemsWithRemote,
      }

      if (saleRemoteId) payload.sale_id = saleRemoteId
      if (customerRemoteId) payload.customer_id = customerRemoteId

      const result = await api.post('/returns', payload)

      await db.returns.update(ret.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync return error:', err)
    }
  }
}


// =====================================================
// EXPENSES
// =====================================================
async function syncExpenses() {
  const unsynced = await db.expenses.filter(e => !e.synced_at).toArray()

  for (const exp of unsynced) {
    try {
      const result = await api.post('/expenses', {
        category: exp.category,
        description: exp.description || '',
        amount: Number(exp.amount),
      })

      await db.expenses.update(exp.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync expense error:', err)
    }
  }
}


// =====================================================
// DEPOSITS
// =====================================================
async function syncDeposits() {
  const unsynced = await db.deposits.filter(d => !d.synced_at).toArray()

  for (const dep of unsynced) {
    try {
      const customer = await db.customers.get(dep.customer_local_id)
      if (!customer?.remote_id) continue

      const result = await api.post('/deposits', {
        customer_id: customer.remote_id,
        amount: Number(dep.amount),
        deposit_type: dep.deposit_type,
        notes: dep.notes || '',
      })

      await db.deposits.update(dep.local_id, {
        remote_id: result.data.id,
        synced_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Sync deposit error:', err)
    }
  }
}

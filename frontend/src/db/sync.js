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
    await syncSales()
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

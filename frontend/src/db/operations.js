import { db, generateLocalId } from './dexie'
import { syncAll, isOnline } from './sync'

export async function getAllProducts() {
  const local = await db.products.toArray()

  if (isOnline()) {
    try {
      const api = (await import('../lib/api')).default
      const res = await api.get('/products')
      const remote = res.data

      for (const r of remote) {
        const existingById = await db.products.where('remote_id').equals(r.id).first()
        if (existingById) {
          await db.products.update(existingById.local_id, {
            ...r,
            remote_id: r.id,
            synced_at: new Date().toISOString(),
          })
          continue
        }

        const localMatch = await db.products
          .filter(p => !p.remote_id && p.name === r.name)
          .first()

        if (localMatch) {
          await db.products.update(localMatch.local_id, {
            remote_id: r.id,
            synced_at: new Date().toISOString(),
          })
          continue
        }

        await db.products.add({
          local_id: generateLocalId(),
          remote_id: r.id,
          ...r,
          synced_at: new Date().toISOString(),
        })
      }

      const all = await db.products.toArray()
      const seen = new Set()
      const unique = []
      for (const p of all) {
        const key = p.name
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(p)
        } else {
          await db.products.delete(p.local_id)
        }
      }
      return unique
    } catch (err) {
      console.error('Fetch products online error:', err)
      return local
    }
  }

  return local
}

export async function createProductLocal(data) {
  const existing = await db.products
    .filter(p => p.name.toLowerCase() === data.name.toLowerCase())
    .first()

  if (existing) {
    throw new Error('Bidhaa yenye jina hili ipo tayari')
  }

  const local_id = generateLocalId()

  await db.products.add({
    local_id,
    remote_id: null,
    name: data.name,
    category: data.category,
    unit: data.unit,
    cost_price: data.cost_price,
    selling_price: data.selling_price,
    stock: data.stock,
    reorder_level: data.reorder_level,
    is_active: true,
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  if (isOnline()) {
    await syncAll()
  }

  return await db.products.get(local_id)
}

export async function getProductById(localId) {
  return await db.products.get(localId)
}

export async function getAllCustomers() {
  const local = await db.customers.toArray()

  if (isOnline()) {
    try {
      const api = (await import('../lib/api')).default
      const res = await api.get('/customers')
      const remote = res.data

      for (const r of remote) {
        const existingById = await db.customers.where('remote_id').equals(r.id).first()
        if (existingById) {
          await db.customers.update(existingById.local_id, {
            ...r,
            remote_id: r.id,
            synced_at: new Date().toISOString(),
          })
          continue
        }

        const localMatch = await db.customers
          .filter(c => !c.remote_id && c.name === r.name)
          .first()

        if (localMatch) {
          await db.customers.update(localMatch.local_id, {
            remote_id: r.id,
            synced_at: new Date().toISOString(),
          })
          continue
        }

        await db.customers.add({
          local_id: generateLocalId(),
          remote_id: r.id,
          ...r,
          synced_at: new Date().toISOString(),
        })
      }

      const all = await db.customers.toArray()
      const seen = new Set()
      const unique = []
      for (const c of all) {
        const key = c.name
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(c)
        } else {
          await db.customers.delete(c.local_id)
        }
      }
      return unique
    } catch (err) {
      console.error('Fetch customers online error:', err)
      return local
    }
  }

  return local
}

export async function createCustomerLocal(data) {
  const existing = await db.customers
    .filter(c => c.name.toLowerCase() === data.name.toLowerCase())
    .first()

  // Kama mteja yupo tayari — rudisha yeye
  if (existing) {
    return existing
  }

  const local_id = generateLocalId()

  await db.customers.add({
    local_id,
    remote_id: null,
    name: data.name,
    phone: data.phone,
    balance: 0,
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed, will retry later:', e.message)
    }
  }

  return await db.customers.get(local_id)
}

export async function getCustomerById(localId) {
  return await db.customers.get(localId)
}

export async function createSaleLocal(data) {
  const saleLocalId = generateLocalId()

  await db.sales.add({
    local_id: saleLocalId,
    remote_id: null,
    customer_local_id: data.customer_local_id || null,
    payment_method: data.payment_method,
    amount_paid: data.amount_paid,
    total_amount: data.total_amount,
    profit: data.profit,
    sale_date: new Date().toISOString(),
    synced_at: null,
  })

  for (const item of data.items) {
    await db.sale_items.add({
      local_id: generateLocalId(),
      remote_id: null,
      sale_id: saleLocalId,
      product_local_id: item.product_local_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: item.cost_price,
      subtotal: item.subtotal,
      profit: item.profit,
      synced_at: null,
    })

    const product = await db.products.get(item.product_local_id)
    if (product) {
      await db.products.update(item.product_local_id, {
        stock: Number(product.stock) - Number(item.quantity),
      })

      // Rekodi stock movement
      await db.stock_movements.add({
        local_id: generateLocalId(),
        remote_id: null,
        product_local_id: item.product_local_id,
        product_name: item.product_name,
        movement_type: 'out',
        quantity: item.quantity,
        reference_type: 'sale',
        reference_id: saleLocalId,
        notes: `Mauzo ya ${item.quantity} ${product.unit || ''}`,
        created_at: new Date().toISOString(),
        synced_at: null,
      })
    }
  }

  if (data.payment_method === 'credit' && data.customer_local_id) {
    const customer = await db.customers.get(data.customer_local_id)
    if (customer) {
      const now = new Date().toISOString()
      const updates = {
        balance: Number(customer.balance) + Number(data.total_amount),
        last_credit_date: now,
      }
      if (!customer.oldest_credit_date) {
        updates.oldest_credit_date = now
      }
      await db.customers.update(data.customer_local_id, updates)
    }
  }

  if (isOnline()) {
    await syncAll()
  }

  return await db.sales.get(saleLocalId)
}

export async function getAllSales() {
  return await db.sales.orderBy('sale_date').reverse().toArray()
}

export async function getAllSalesWithFetch() {
  const local = await db.sales.toArray()

  if (isOnline()) {
    try {
      const api = (await import('../lib/api')).default
      const res = await api.get('/sales')
      const remote = res.data

      for (const r of remote) {
        const existing = await db.sales.where('remote_id').equals(r.id).first()
        if (!existing) {
          await db.sales.add({
            local_id: generateLocalId(),
            remote_id: r.id,
            customer_local_id: null,
            payment_method: r.payment_method,
            amount_paid: r.amount_paid,
            total_amount: r.total_amount,
            profit: r.profit,
            sale_date: r.sale_date,
            synced_at: new Date().toISOString(),
          })
        }
      }

      return await db.sales.orderBy('sale_date').reverse().toArray()
    } catch (err) {
      return local
    }
  }
  return local
}

export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const allSales = await db.sales.toArray()
  const todaySales = allSales.filter(s => s.sale_date?.startsWith(today))

  const total_sales = todaySales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const total_profit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0)
  const total_count = todaySales.length

  return { total_sales, total_profit, total_count }
}

export async function createPaymentLocal(data) {
  const local_id = generateLocalId()

  await db.payments.add({
    local_id,
    remote_id: null,
    customer_local_id: data.customer_local_id,
    amount: data.amount,
    payment_method: data.payment_method,
    notes: data.notes,
    payment_date: new Date().toISOString(),
    synced_at: null,
  })

  const customer = await db.customers.get(data.customer_local_id)
  if (customer) {
    const newBalance = Number(customer.balance) - Number(data.amount)
    const updates = {
      balance: newBalance < 0 ? 0 : newBalance,
    }
    // Kama deni limeisha kabisa, ondoa tarehe za deni
    if (newBalance <= 0) {
      updates.oldest_credit_date = null
      updates.last_credit_date = null
    }
    await db.customers.update(data.customer_local_id, updates)
  }

  if (isOnline()) {
    await syncAll()
  }

  return await db.payments.get(local_id)
}

export async function getPaymentsByCustomer(customerLocalId) {
  return await db.payments
    .where('customer_local_id').equals(customerLocalId)
    .reverse()
    .sortBy('payment_date')
}

// =====================================================
// STOCK MOVEMENTS
// =====================================================

export async function getStockMovements(productLocalId) {
  const items = await db.stock_movements
    .where('product_local_id').equals(productLocalId)
    .reverse()
    .sortBy('created_at')
  return items
}

export async function recordStockMovement(data) {
  const local_id = generateLocalId()

  await db.stock_movements.add({
    local_id,
    remote_id: null,
    product_local_id: data.product_local_id,
    product_name: data.product_name,
    movement_type: data.movement_type, // 'in', 'out', 'adjustment'
    quantity: data.quantity,
    reference_type: data.reference_type, // 'sale', 'purchase', 'manual'
    reference_id: data.reference_id || null,
    notes: data.notes || '',
    created_at: new Date().toISOString(),
    synced_at: null,
  })

  return await db.stock_movements.get(local_id)
}

// =====================================================
// EXPENSES (Gharama)
// =====================================================

export async function getAllExpenses() {
  return await db.expenses.orderBy('expense_date').reverse().toArray()
}

export async function createExpenseLocal(data) {
  const local_id = generateLocalId()

  await db.expenses.add({
    local_id,
    remote_id: null,
    category: data.category,
    description: data.description || '',
    amount: Number(data.amount),
    expense_date: data.expense_date || new Date().toISOString(),
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed:', e.message)
    }
  }

  return await db.expenses.get(local_id)
}

export async function getExpensesStats() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const all = await db.expenses.toArray()

  const todayTotal = all
    .filter(e => e.expense_date?.startsWith(today))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0)

  const weekTotal = all
    .filter(e => e.expense_date >= weekAgo)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0)

  const monthTotal = all
    .filter(e => e.expense_date >= monthAgo)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0)

  const allTotal = all.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  return { todayTotal, weekTotal, monthTotal, allTotal, count: all.length }
}

// =====================================================
// DEPOSITS (Amana)
// =====================================================

export async function getDepositsByCustomer(customerLocalId) {
  return await db.deposits
    .where('customer_local_id').equals(customerLocalId)
    .reverse()
    .sortBy('deposit_date')
}

export async function createDepositLocal(data) {
  // data: { customer_local_id, amount, deposit_type, notes }
  // deposit_type: 'in' (weka), 'out' (tumia), 'refund' (rudisha)

  const local_id = generateLocalId()

  await db.deposits.add({
    local_id,
    remote_id: null,
    customer_local_id: data.customer_local_id,
    amount: Number(data.amount),
    deposit_type: data.deposit_type,
    notes: data.notes || '',
    deposit_date: new Date().toISOString(),
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  // Sasisha salio la mteja
  const customer = await db.customers.get(data.customer_local_id)
  if (customer) {
    const currentDeposit = Number(customer.deposit || 0)
    const currentBalance = Number(customer.balance || 0)

    if (data.deposit_type === 'in') {
      // Mteja anaweka amana
      const amount = Number(data.amount)
      let newDeposit = currentDeposit + amount
      let newBalance = currentBalance

      // Kama ana deni — lipa deni kwanza
      if (currentBalance > 0) {
        if (newDeposit >= currentBalance) {
          // Amana inatosha kulipa deni lote
          newDeposit = newDeposit - currentBalance
          newBalance = 0
        } else {
          // Amana haitoshi — inapunguza deni
          newBalance = currentBalance - newDeposit
          newDeposit = 0
        }
      }

      await db.customers.update(data.customer_local_id, {
        deposit: newDeposit,
        balance: newBalance,
      })
    } else if (data.deposit_type === 'out' || data.deposit_type === 'refund') {
      // Kutumia au kurudisha amana
      let newDeposit = currentDeposit - Number(data.amount)
      if (newDeposit < 0) newDeposit = 0

      await db.customers.update(data.customer_local_id, {
        deposit: newDeposit,
      })
    }
  }

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed:', e.message)
    }
  }

  return await db.deposits.get(local_id)
}

// Hesabu jinsi amana itakavyogawanywa
export function calculateDepositSplit(customer, amount) {
  const currentDeposit = Number(customer?.deposit || 0)
  const currentBalance = Number(customer?.balance || 0)
  const newAmount = Number(amount || 0)

  let toPayDebt = 0
  let toDeposit = 0

  if (currentBalance > 0) {
    if (newAmount >= currentBalance) {
      toPayDebt = currentBalance
      toDeposit = newAmount - currentBalance
    } else {
      toPayDebt = newAmount
      toDeposit = 0
    }
  } else {
    toPayDebt = 0
    toDeposit = newAmount
  }

  return {
    toPayDebt,
    toDeposit,
    newBalance: currentBalance - toPayDebt,
    newDeposit: currentDeposit + toDeposit,
  }
}

export async function getCustomerDepositBalance(customerLocalId) {
  const customer = await db.customers.get(customerLocalId)
  return Number(customer?.deposit || 0)
}

// =====================================================
// SUPPLIERS (Wasambazaji)
// =====================================================

export async function getAllSuppliers() {
  return await db.suppliers.orderBy('name').toArray()
}

export async function getSupplierById(localId) {
  return await db.suppliers.get(localId)
}

export async function createSupplierLocal(data) {
  const existing = await db.suppliers
    .filter(s => s.name.toLowerCase() === data.name.toLowerCase())
    .first()

  if (existing) {
    return existing
  }

  const local_id = generateLocalId()

  await db.suppliers.add({
    local_id,
    remote_id: null,
    name: data.name,
    phone: data.phone || '',
    address: data.address || '',
    notes: data.notes || '',
    balance: 0,
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed:', e.message)
    }
  }

  return await db.suppliers.get(local_id)
}

export async function updateSupplierLocal(localId, data) {
  await db.suppliers.update(localId, {
    ...data,
    synced_at: null,
  })
}

// =====================================================
// PURCHASES (Manunuzi)
// =====================================================

export async function getAllPurchases() {
  return await db.purchases.orderBy('purchase_date').reverse().toArray()
}

export async function getPurchasesBySupplier(supplierLocalId) {
  return await db.purchases
    .where('supplier_local_id').equals(supplierLocalId)
    .reverse()
    .sortBy('purchase_date')
}

export async function createPurchaseLocal(data) {
  // data: { supplier_local_id, items: [{product_local_id, quantity, cost_price}], amount_paid, notes }

  const purchaseLocalId = generateLocalId()
  let totalAmount = 0

  // 1. Unda purchase
  await db.purchases.add({
    local_id: purchaseLocalId,
    remote_id: null,
    supplier_local_id: data.supplier_local_id,
    total_amount: 0, // itaongezwa baadaye
    amount_paid: Number(data.amount_paid || 0),
    balance: 0,
    notes: data.notes || '',
    purchase_date: new Date().toISOString(),
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  // 2. Unda purchase items + ongeza stock
  for (const item of data.items) {
    const subtotal = Number(item.cost_price) * Number(item.quantity)
    totalAmount += subtotal

    await db.purchase_items.add({
      local_id: generateLocalId(),
      remote_id: null,
      purchase_id: purchaseLocalId,
      product_local_id: item.product_local_id,
      product_name: item.product_name || '',
      quantity: Number(item.quantity),
      cost_price: Number(item.cost_price),
      subtotal: subtotal,
      synced_at: null,
    })

    // Ongeza stock
    const product = await db.products.get(item.product_local_id)
    if (product) {
      await db.products.update(item.product_local_id, {
        stock: Number(product.stock) + Number(item.quantity),
        cost_price: Number(item.cost_price), // sasisha bei ya kununua
      })

      // Rekodi stock movement
      await db.stock_movements.add({
        local_id: generateLocalId(),
        remote_id: null,
        product_local_id: item.product_local_id,
        product_name: product.name,
        movement_type: 'in',
        quantity: Number(item.quantity),
        reference_type: 'purchase',
        reference_id: purchaseLocalId,
        notes: `Manunuzi kutoka supplier`,
        created_at: new Date().toISOString(),
        synced_at: null,
      })
    }
  }

  // 3. Sasisha purchase na totals
  const balance = totalAmount - Number(data.amount_paid || 0)

  await db.purchases.update(purchaseLocalId, {
    total_amount: totalAmount,
    balance: balance,
  })

  // 4. Sasisha deni la supplier
  if (data.supplier_local_id) {
    const supplier = await db.suppliers.get(data.supplier_local_id)
    if (supplier) {
      await db.suppliers.update(data.supplier_local_id, {
        balance: Number(supplier.balance || 0) + balance,
      })
    }
  }

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed:', e.message)
    }
  }

  return await db.purchases.get(purchaseLocalId)
}

// =====================================================
// SUPPLIER PAYMENTS (Malipo kwa Supplier)
// =====================================================

export async function createSupplierPaymentLocal(data) {
  // data: { supplier_local_id, amount, payment_method, notes }

  const local_id = generateLocalId()

  await db.supplier_payments.add({
    local_id,
    remote_id: null,
    supplier_local_id: data.supplier_local_id,
    amount: Number(data.amount),
    payment_method: data.payment_method || 'cash',
    notes: data.notes || '',
    payment_date: new Date().toISOString(),
    synced_at: null,
    created_at: new Date().toISOString(),
  })

  // Punguza deni la supplier
  const supplier = await db.suppliers.get(data.supplier_local_id)
  if (supplier) {
    const newBalance = Number(supplier.balance || 0) - Number(data.amount)
    await db.suppliers.update(data.supplier_local_id, {
      balance: newBalance < 0 ? 0 : newBalance,
    })
  }

  if (isOnline()) {
    try {
      await syncAll()
    } catch (e) {
      console.log('Sync failed:', e.message)
    }
  }

  return await db.supplier_payments.get(local_id)
}

export async function getSupplierPayments(supplierLocalId) {
  return await db.supplier_payments
    .where('supplier_local_id').equals(supplierLocalId)
    .reverse()
    .sortBy('payment_date')
}

export async function getSupplierStats() {
  const suppliers = await db.suppliers.toArray()
  const totalDebt = suppliers.reduce((sum, s) => sum + Number(s.balance || 0), 0)
  const withDebt = suppliers.filter(s => Number(s.balance) > 0).length

  return {
    total: suppliers.length,
    withDebt,
    totalDebt,
  }
}

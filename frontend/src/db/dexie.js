import Dexie from 'dexie'

export const db = new Dexie('baizona_local')

db.version(8).stores({
  products: 'local_id, remote_id, name, category, unit, stock, synced_at',
  customers: 'local_id, remote_id, name, phone, balance, deposit, oldest_credit_date, last_credit_date, synced_at',
  sales: 'local_id, remote_id, customer_local_id, payment_method, sale_date, synced_at',
  sale_items: 'local_id, remote_id, sale_id, product_local_id, synced_at',
  payments: 'local_id, remote_id, customer_local_id, payment_date, synced_at',
  stock_movements: 'local_id, remote_id, product_local_id, movement_type, reference_type, created_at, synced_at',
  expenses: 'local_id, remote_id, category, expense_date, synced_at',
  deposits: 'local_id, remote_id, customer_local_id, deposit_type, deposit_date, synced_at',
  suppliers: 'local_id, remote_id, name, phone, balance, synced_at',
  purchases: 'local_id, remote_id, supplier_local_id, purchase_date, synced_at',
  purchase_items: 'local_id, remote_id, purchase_id, product_local_id, synced_at',
  supplier_payments: 'local_id, remote_id, supplier_local_id, payment_date, synced_at',
  returns: 'local_id, remote_id, sale_id, customer_local_id, refund_method, return_date, synced_at',
  return_items: 'local_id, remote_id, return_id, product_local_id, synced_at',
  supplier_products: 'local_id, remote_id, supplier_local_id, product_local_id, synced_at',
})

export function generateLocalId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export async function countUnsynced() {
  const products = await db.products.filter(p => !p.synced_at).count()
  const customers = await db.customers.filter(c => !c.synced_at).count()
  const sales = await db.sales.filter(s => !s.synced_at).count()
  const payments = await db.payments.filter(p => !p.synced_at).count()
  return products + customers + sales + payments
}

export default db

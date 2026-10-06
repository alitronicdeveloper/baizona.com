import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import adminApi from './adminApi'

function AdminSupplierDetail() {
  const { id } = useParams()
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [addForm, setAddForm] = useState({ product_id: '', supplier_price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.get(`/admin/suppliers/${id}`).then(r => r.data),
      adminApi.get(`/admin/suppliers/${id}/products`).then(r => r.data),
      adminApi.get('/products').then(r => r.data),
    ])
      .then(([sup, prods, allProds]) => {
        setSupplier(sup)
        setProducts(prods)
        setAllProducts(allProds)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!addForm.product_id) {
      alert('Chagua bidhaa')
      return
    }
    setSaving(true)
    try {
      await adminApi.post(`/admin/suppliers/${id}/products`, {
        product_id: addForm.product_id,
        supplier_price: Number(addForm.supplier_price || 0),
      })
      setAddForm({ product_id: '', supplier_price: '' })
      setShowAddForm(false)
      // Reload products
      const prods = await adminApi.get(`/admin/suppliers/${id}/products`).then(r => r.data)
      setProducts(prods)
    } catch (err) {
      alert('Imeshindwa kuongeza bidhaa')
    } finally {
      setSaving(false)
    }
  }

  const availableProducts = allProducts.filter(
    p => !products.some(sp => sp.product_id === p.id)
  )

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  if (loading) return <div className="empty">Inapakia...</div>
  if (!supplier) return <div className="empty">Supplier haipatikani</div>

  return (
    <div className="admin-supplier-detail">
      <Link to="/admin/suppliers" className="back-link">← Rudi kwa Wasambazaji</Link>

      <div className="detail-header">
        <div className="detail-avatar">{supplier.name.charAt(0).toUpperCase()}</div>
        <div className="detail-info">
          <h1 className="detail-name">{supplier.name}</h1>
          <div className="detail-sub">
            {supplier.phone || 'Hakuna simu'}
            {supplier.address ? ` · ${supplier.address}` : ''}
          </div>
          {supplier.region && (
            <div className="detail-location">
              📍 {supplier.region}{supplier.district ? `, ${supplier.district}` : ''}
            </div>
          )}
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat-card">
          <div className="stat-label">Bidhaa</div>
          <div className="stat-value">{products.length}</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header-row">
          <div className="section-title">BIDHAA ZA SUPPLIER</div>
          <button className="btn-add" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕' : '+ Ongeza Bidhaa'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProduct} className="add-form">
            <label className="form-label">Bidhaa</label>
            <select
              value={addForm.product_id}
              onChange={e => {
                const prod = allProducts.find(p => p.id === e.target.value)
                setAddForm({
                  product_id: e.target.value,
                  supplier_price: prod ? prod.cost_price : '',
                })
              }}
              className="form-input"
              required
            >
              <option value="">-- Chagua Bidhaa --</option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="form-label">Bei ya Supplier</label>
            <input
              type="number"
              value={addForm.supplier_price}
              onChange={e => setAddForm({ ...addForm, supplier_price: e.target.value })}
              className="form-input"
              placeholder="0"
              inputMode="numeric"
            />

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'INAHIFADHI...' : 'HIFADHI'}
            </button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="empty-small">Hakuna bidhaa bado</div>
        ) : (
          <div className="products-list">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-main">
                  <div className="product-name">{p.name}</div>
                  <div className="product-sub">{p.category} · {p.unit}</div>
                </div>
                <div className="product-price">{formatTZS(p.supplier_price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-supplier-detail { width: 100%; }
        .back-link { color: #F97316; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
        .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .detail-avatar { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .detail-name { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .detail-sub { font-size: 13px; color: #9CA3AF; }
        .detail-location { font-size: 12px; color: #71717a; margin-top: 4px; }
        .detail-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .stat-card { background: #141414; border-radius: 14px; padding: 18px; border: 1px solid rgba(255,255,255,0.05); }
        .stat-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
        .stat-value { font-size: 22px; font-weight: 800; color: #fff; }
        .stat-value.debt { color: #FCA5A5; }
        .stat-value.clean { color: #86EFAC; }
        .section { margin-bottom: 24px; }
        .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .btn-add { padding: 8px 16px; background: rgba(249,115,22,0.15); color: #FDBA74; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .add-form { background: #141414; border-radius: 14px; padding: 16px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; margin-top: 12px; }
        .form-label:first-child { margin-top: 0; }
        .form-input { width: 100%; padding: 13px 14px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: #F97316; }
        .btn-save { width: 100%; padding: 14px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 16px; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .section-title { font-size: 11px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .products-list { display: flex; flex-direction: column; gap: 8px; }
        .product-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .product-main { flex: 1; min-width: 0; }
        .product-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .product-sub { font-size: 11px; color: #9CA3AF; }
        .product-price { font-size: 15px; font-weight: 800; color: #F97316; flex-shrink: 0; }
        .empty { padding: 40px; text-align: center; color: #9CA3AF; }
        .empty-small { padding: 40px 20px; text-align: center; color: #71717a; font-size: 13px; background: #141414; border-radius: 14px; }
      `}</style>
    </div>
  )
}

export default AdminSupplierDetail

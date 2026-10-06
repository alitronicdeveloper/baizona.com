import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSupplierById,
  getPurchasesBySupplier,
  getSupplierPayments,
  createSupplierPaymentLocal,
  getAllProducts,
  createPurchaseLocal,
  getSupplierProducts,
  addSupplierProduct,
  removeSupplierProduct,
} from '../db/operations'

function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [payments, setPayments] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [supplierProducts, setSupplierProducts] = useState([])
  const [activeTab, setActiveTab] = useState('products')

  const [showPayForm, setShowPayForm] = useState(false)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)

  const [payForm, setPayForm] = useState({ amount: '', payment_method: 'cash', notes: '' })
  const [purchaseForm, setPurchaseForm] = useState({ product_local_id: '', quantity: '', cost_price: '', amount_paid: '', notes: '' })
  const [addProductForm, setAddProductForm] = useState({ product_local_id: '', supplier_price: '' })

  const load = async () => {
    const s = await getSupplierById(id)
    setSupplier(s)
    const p = await getPurchasesBySupplier(id)
    setPurchases(p)
    const pay = await getSupplierPayments(id)
    setPayments(pay)
    const prods = await getAllProducts()
    setAllProducts(prods)
    const sp = await getSupplierProducts(id)
    setSupplierProducts(sp)
  }

  useEffect(() => { load() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payForm.amount || Number(payForm.amount) <= 0) { alert('Weka kiasi sahihi'); return }
    try {
      await createSupplierPaymentLocal({ supplier_local_id: id, amount: Number(payForm.amount), payment_method: payForm.payment_method, notes: payForm.notes })
      setPayForm({ amount: '', payment_method: 'cash', notes: '' })
      setShowPayForm(false)
      load()
    } catch (err) { alert('Kosa: ' + err.message) }
  }

  const handlePurchase = async (e) => {
    e.preventDefault()
    const product = allProducts.find(p => p.local_id === purchaseForm.product_local_id)
    if (!product) { alert('Chagua bidhaa'); return }
    if (!purchaseForm.quantity || Number(purchaseForm.quantity) <= 0) { alert('Weka kiasi sahihi'); return }
    if (!purchaseForm.cost_price || Number(purchaseForm.cost_price) <= 0) { alert('Weka bei ya kununua'); return }
    try {
      await createPurchaseLocal({
        supplier_local_id: id,
        items: [{ product_local_id: product.local_id, product_name: product.name, quantity: Number(purchaseForm.quantity), cost_price: Number(purchaseForm.cost_price) }],
        amount_paid: Number(purchaseForm.amount_paid || 0),
        notes: purchaseForm.notes,
      })
      setPurchaseForm({ product_local_id: '', quantity: '', cost_price: '', amount_paid: '', notes: '' })
      setShowPurchaseForm(false)
      load()
    } catch (err) { alert('Kosa: ' + err.message) }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!addProductForm.product_local_id) { alert('Chagua bidhaa'); return }
    try {
      await addSupplierProduct({ supplier_local_id: id, product_local_id: addProductForm.product_local_id, supplier_price: Number(addProductForm.supplier_price || 0) })
      setAddProductForm({ product_local_id: '', supplier_price: '' })
      setShowAddProduct(false)
      load()
    } catch (err) { alert('Kosa: ' + err.message) }
  }

  const handleRemoveProduct = async (productLocalId) => {
    if (!window.confirm('Ondoa bidhaa hii kwa supplier?')) return
    await removeSupplierProduct(id, productLocalId)
    load()
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })

  if (!supplier) return <div style={{ padding: '20px', color: '#9CA3AF' }}>Inapakia...</div>

  const balance = Number(supplier.balance || 0)
  const hasDebt = balance > 0
  const hasOwed = balance < 0
  const availableProducts = allProducts.filter(p => !supplierProducts.some(sp => sp.product_local_id === p.local_id))

  return (
    <div className="supplier-detail">
      {/* HERO — RAHISI */}
      <div className="hero">
        <div className="hero-top">
          <button className="hero-back" onClick={() => navigate(-1)}>←</button>
          <div className="hero-avatar">{supplier.name.charAt(0).toUpperCase()}</div>
          <div className="hero-info">
            <div className="hero-name">{supplier.name}</div>
            <div className="hero-sub">{supplier.phone || 'Hakuna simu'}{supplier.address ? ` · ${supplier.address}` : ''}</div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{supplierProducts.length}</div>
            <div className="hero-stat-label">Bidhaa</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className={`hero-stat-value ${hasDebt ? 'danger' : 'success'}`}>
              {formatTZS(hasDebt ? balance : 0)}
            </div>
            <div className="hero-stat-label">Wanatudai</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className={`hero-stat-value ${hasOwed ? 'success' : ''}`}>
              {formatTZS(hasOwed ? Math.abs(balance) : 0)}
            </div>
            <div className="hero-stat-label">Tunawadai</div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="hero-btn primary" onClick={() => setShowPurchaseForm(!showPurchaseForm)}>
            + Manunuzi
          </button>
          {hasDebt && (
            <button className="hero-btn secondary" onClick={() => setShowPayForm(!showPayForm)}>
              Lipa Deni
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* PAY FORM */}
        {showPayForm && (
          <form onSubmit={handlePayment} className="form-card">
            <div className="form-title">Lipa Deni</div>
            <label className="form-label">Kiasi *</label>
            <input type="number" placeholder="0" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="form-input" inputMode="numeric" autoFocus required />
            <label className="form-label">Njia ya Malipo</label>
            <select value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })} className="form-input">
              <option value="cash">Taslimu</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Benki</option>
            </select>
            <label className="form-label">Maelezo</label>
            <input type="text" placeholder="Maelezo (si lazima)" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} className="form-input" />
            <button type="submit" className="form-btn">HIFADHI MALIPO</button>
          </form>
        )}

        {/* PURCHASE FORM */}
        {showPurchaseForm && (
          <form onSubmit={handlePurchase} className="form-card">
            <div className="form-title">Manunuzi Mapya</div>
            {supplierProducts.length === 0 ? (
              <div className="empty-small">Ongeza bidhaa kwa supplier huyu kwanza.</div>
            ) : (
              <>
                <label className="form-label">Bidhaa *</label>
                <select value={purchaseForm.product_local_id} onChange={e => { const sp = supplierProducts.find(x => x.product_local_id === e.target.value); setPurchaseForm({ ...purchaseForm, product_local_id: e.target.value, cost_price: sp ? sp.supplier_price : '' }) }} className="form-input" required>
                  <option value="">-- Chagua Bidhaa --</option>
                  {supplierProducts.map(sp => { const prod = allProducts.find(p => p.local_id === sp.product_local_id); return (<option key={sp.local_id} value={sp.product_local_id}>{prod?.name || 'Bidhaa'}</option>) })}
                </select>
                <label className="form-label">Kiasi *</label>
                <input type="number" placeholder="0" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} className="form-input" inputMode="numeric" required />
                <label className="form-label">Bei ya Kununua *</label>
                <input type="number" placeholder="0" value={purchaseForm.cost_price} onChange={e => setPurchaseForm({ ...purchaseForm, cost_price: e.target.value })} className="form-input" inputMode="numeric" required />
                <label className="form-label">Malipo ya Awali</label>
                <input type="number" placeholder="0 (kama umelipa)" value={purchaseForm.amount_paid} onChange={e => setPurchaseForm({ ...purchaseForm, amount_paid: e.target.value })} className="form-input" inputMode="numeric" />
                {purchaseForm.quantity && purchaseForm.cost_price && (
                  <div className="calc-box"><span>Jumla:</span><span className="calc-value">{formatTZS(Number(purchaseForm.quantity) * Number(purchaseForm.cost_price))}</span></div>
                )}
                <button type="submit" className="form-btn">HIFADHI MANUNUZI</button>
              </>
            )}
          </form>
        )}

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            Bidhaa ({supplierProducts.length})
          </button>
          <button className={`tab ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
            Manunuzi ({purchases.length})
          </button>
          <button className={`tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            Malipo ({payments.length})
          </button>
        </div>

        {/* TAB: PRODUCTS */}
        {activeTab === 'products' && (
          <>
            <button className="add-btn" onClick={() => setShowAddProduct(!showAddProduct)}>
              {showAddProduct ? '✕ Ghairi' : '+ Ongeza Bidhaa'}
            </button>

            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="form-card">
                <label className="form-label">Bidhaa *</label>
                <select value={addProductForm.product_local_id} onChange={e => setAddProductForm({ ...addProductForm, product_local_id: e.target.value })} className="form-input" required>
                  <option value="">-- Chagua Bidhaa --</option>
                  {availableProducts.map(p => (<option key={p.local_id} value={p.local_id}>{p.name}</option>))}
                </select>
                <label className="form-label">Bei ya Supplier</label>
                <input type="number" placeholder="0" value={addProductForm.supplier_price} onChange={e => setAddProductForm({ ...addProductForm, supplier_price: e.target.value })} className="form-input" inputMode="numeric" />
                <button type="submit" className="form-btn">HIFADHI</button>
              </form>
            )}

            {supplierProducts.length === 0 ? (
              <div className="empty-small">Hakuna bidhaa bado</div>
            ) : (
              <div className="card-list">
                {supplierProducts.map(sp => {
                  const prod = allProducts.find(p => p.local_id === sp.product_local_id)
                  return (
                    <div key={sp.local_id} className="card">
                      <div className="card-main">
                        <div className="card-name">{prod?.name || 'Bidhaa'}</div>
                        <div className="card-sub">Bei: {formatTZS(sp.supplier_price)}</div>
                      </div>
                      <button className="btn-remove" onClick={() => handleRemoveProduct(sp.product_local_id)}>✕</button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* TAB: PURCHASES */}
        {activeTab === 'purchases' && (
          purchases.length === 0 ? (
            <div className="empty-small">Hakuna manunuzi bado</div>
          ) : (
            <div className="card-list">
              {purchases.map(p => (
                <div key={p.local_id} className="card-column">
                  <div className="card-row-top">
                    <div className="card-name">{formatDate(p.purchase_date)}</div>
                    <div className={`card-value ${Number(p.balance) > 0 ? 'debt' : 'clean'}`}>{formatTZS(p.total_amount)}</div>
                  </div>
                  {p.items && p.items.length > 0 && (
                    <div className="card-items">
                      {p.items.map((item, i) => (
                        <div key={i} className="card-item-line">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">{item.quantity} × {formatTZS(item.cost_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {Number(p.balance) > 0 && <div className="card-debt-label">Deni: {formatTZS(p.balance)}</div>}
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB: PAYMENTS */}
        {activeTab === 'payments' && (
          payments.length === 0 ? (
            <div className="empty-small">Hakuna malipo bado</div>
          ) : (
            <div className="card-list">
              {payments.map(p => (
                <div key={p.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">{formatTZS(p.amount)}</div>
                    <div className="card-sub">{formatDate(p.payment_date)} · {p.payment_method === 'cash' ? 'Taslimu' : p.payment_method === 'mpesa' ? 'M-Pesa' : 'Benki'}</div>
                  </div>
                  <div className="card-value clean">-</div>
                </div>
              ))}
            </div>
          )
        )}

      </div>

      <style>{`
        .supplier-detail { width: 100%; min-height: 100vh; background: #0A0A0A; }

        /* HERO */
        .hero { background: linear-gradient(135deg, #0C4A6E 0%, #0369A1 100%); padding: 14px 16px 16px; color: #fff; }
        .hero-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .hero-back { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 34px; height: 34px; border-radius: 10px; font-size: 16px; cursor: pointer; flex-shrink: 0; }
        .hero-avatar { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; }
        .hero-info { flex: 1; min-width: 0; }
        .hero-name { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
        .hero-sub { font-size: 11px; color: rgba(255,255,255,0.8); }

        .hero-stats { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .hero-stat { flex: 1; text-align: center; }
        .hero-stat-value { font-size: 18px; font-weight: 800; }
        .hero-stat-value.danger { color: #FCA5A5; }
        .hero-stat-value.success { color: #86EFAC; }
        .hero-stat-label { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.4px; }
        .hero-stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }

        .hero-actions { display: flex; gap: 8px; }
        .hero-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; }
        .hero-btn.primary { background: #fff; color: #0369A1; }
        .hero-btn.secondary { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); }

        /* CONTENT */
        .content { padding: 16px 0; }

        /* TABS */
        .tabs { display: flex; gap: 6px; margin-bottom: 14px; background: #1A1A1A; padding: 5px; border-radius: 12px; }
        .tab { flex: 1; padding: 9px; background: transparent; border: none; border-radius: 8px; color: #9CA3AF; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .tab.active { background: #0369A1; color: #fff; }

        /* ADD BUTTON */
        .add-btn { width: 100%; padding: 12px; background: rgba(3, 105, 161, 0.15); border: 1px dashed rgba(3, 105, 161, 0.4); color: #38BDF8; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; margin-bottom: 12px; }

        /* FORM */
        .form-card { background: #1A1A1A; border-radius: 16px; padding: 16px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .form-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; margin-top: 10px; }
        .form-input { width: 100%; padding: 13px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #0284C7; }
        .form-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #0369A1 0%, #075985 100%); color: #fff; border: none; border-radius: 11px; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 14px; }
        .calc-box { display: flex; justify-content: space-between; align-items: center; background: rgba(3,105,161,0.15); border: 1px solid rgba(3,105,161,0.3); border-radius: 10px; padding: 10px 14px; margin-top: 10px; font-size: 13px; color: #7DD3FC; }
        .calc-value { font-size: 15px; font-weight: 800; color: #38BDF8; }

        /* CARDS */
        .card-list { display: flex; flex-direction: column; gap: 6px; }
        .card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #1A1A1A; border-radius: 13px; border: 1px solid rgba(255,255,255,0.05); }
        .card-column { background: #1A1A1A; border-radius: 13px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.05); }
        .card-row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .card-main { flex: 1; min-width: 0; }
        .card-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .card-sub { font-size: 11px; color: #9CA3AF; }
        .card-items { border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
        .card-item-line { display: flex; justify-content: space-between; font-size: 12px; color: #D1D5DB; }
        .item-name { font-weight: 600; }
        .item-qty { color: #9CA3AF; }
        .card-debt-label { margin-top: 8px; font-size: 11px; color: #FCA5A5; font-weight: 700; }
        .card-value { font-size: 12px; font-weight: 700; flex-shrink: 0; padding: 4px 10px; border-radius: 8px; }
        .card-value.debt { color: #EF4444; background: rgba(239,68,68,0.12); }
        .card-value.clean { color: #10B981; background: rgba(16,185,129,0.12); }
        .btn-remove { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; width: 32px; height: 32px; border-radius: 8px; font-size: 14px; cursor: pointer; }
        .empty-small { padding: 30px 20px; text-align: center; color: #6B7280; font-size: 13px; background: #1A1A1A; border-radius: 13px; border: 1px solid rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}

export default SupplierDetail

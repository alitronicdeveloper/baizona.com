import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSupplierById,
  getPurchasesBySupplier,
  getSupplierPayments,
  createSupplierPaymentLocal,
  getAllProducts,
  createPurchaseLocal,
} from '../db/operations'

function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [payments, setPayments] = useState([])
  const [products, setProducts] = useState([])

  const [showPayForm, setShowPayForm] = useState(false)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)

  const [payForm, setPayForm] = useState({
    amount: '',
    payment_method: 'cash',
    notes: '',
  })

  const [purchaseForm, setPurchaseForm] = useState({
    product_local_id: '',
    quantity: '',
    cost_price: '',
    amount_paid: '',
    notes: '',
  })

  const load = async () => {
    const s = await getSupplierById(id)
    setSupplier(s)

    const p = await getPurchasesBySupplier(id)
    setPurchases(p)

    const pay = await getSupplierPayments(id)
    setPayments(pay)

    const prods = await getAllProducts()
    setProducts(prods)
  }

  useEffect(() => { load() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      alert('Weka kiasi sahihi')
      return
    }

    try {
      await createSupplierPaymentLocal({
        supplier_local_id: id,
        amount: Number(payForm.amount),
        payment_method: payForm.payment_method,
        notes: payForm.notes,
      })

      setPayForm({ amount: '', payment_method: 'cash', notes: '' })
      setShowPayForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const handlePurchase = async (e) => {
    e.preventDefault()

    const product = products.find(p => p.local_id === purchaseForm.product_local_id)
    if (!product) {
      alert('Chagua bidhaa')
      return
    }

    if (!purchaseForm.quantity || Number(purchaseForm.quantity) <= 0) {
      alert('Weka kiasi sahihi')
      return
    }

    if (!purchaseForm.cost_price || Number(purchaseForm.cost_price) <= 0) {
      alert('Weka bei ya kununua')
      return
    }

    try {
      await createPurchaseLocal({
        supplier_local_id: id,
        items: [{
          product_local_id: product.local_id,
          product_name: product.name,
          quantity: Number(purchaseForm.quantity),
          cost_price: Number(purchaseForm.cost_price),
        }],
        amount_paid: Number(purchaseForm.amount_paid || 0),
        notes: purchaseForm.notes,
      })

      setPurchaseForm({
        product_local_id: '',
        quantity: '',
        cost_price: '',
        amount_paid: '',
        notes: '',
      })
      setShowPurchaseForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('sw-TZ', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (!supplier) {
    return <div style={{ padding: '20px', color: '#9CA3AF' }}>Inapakia...</div>
  }

  const balance = Number(supplier.balance || 0)
  const hasDebt = balance > 0

  return (
    <div className="supplier-detail">
      {/* HERO */}
      <div className="hero">
        <button className="hero-back" onClick={() => navigate(-1)}>
          ← Rudi
        </button>

        <div className="hero-header">
          <div className="hero-avatar">
            {supplier.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="hero-name">{supplier.name}</div>
            <div className="hero-sub">
              {supplier.phone || 'Hakuna simu'}
              {supplier.address ? ` · ${supplier.address}` : ''}
            </div>
          </div>
        </div>

        <div className="hero-debt">
          <div className="hero-debt-label">
            {hasDebt ? 'WANATUDAI' : 'HATUNA DENI'}
          </div>
          <div className={`hero-debt-value ${hasDebt ? 'debt' : 'clean'}`}>
            {formatTZS(balance)}
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="hero-action hero-action-primary"
            onClick={() => setShowPurchaseForm(!showPurchaseForm)}
          >
            + Manunuzi
          </button>
          {hasDebt && (
            <button
              className="hero-action hero-action-secondary"
              onClick={() => setShowPayForm(!showPayForm)}
            >
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
            <input
              type="number"
              placeholder="0"
              value={payForm.amount}
              onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
              className="form-input"
              inputMode="numeric"
              autoFocus
              required
            />

            <label className="form-label">Njia ya Malipo</label>
            <select
              value={payForm.payment_method}
              onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}
              className="form-input"
            >
              <option value="cash">Taslimu</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Benki</option>
            </select>

            <label className="form-label">Maelezo</label>
            <input
              type="text"
              placeholder="Maelezo (si lazima)"
              value={payForm.notes}
              onChange={e => setPayForm({ ...payForm, notes: e.target.value })}
              className="form-input"
            />

            <button type="submit" className="form-btn">
              HIFADHI MALIPO
            </button>
          </form>
        )}

        {/* PURCHASE FORM */}
        {showPurchaseForm && (
          <form onSubmit={handlePurchase} className="form-card">
            <div className="form-title">Manunuzi Mapya</div>

            <label className="form-label">Bidhaa *</label>
            <select
              value={purchaseForm.product_local_id}
              onChange={e => {
                const prod = products.find(p => p.local_id === e.target.value)
                setPurchaseForm({
                  ...purchaseForm,
                  product_local_id: e.target.value,
                  cost_price: prod ? prod.cost_price : '',
                })
              }}
              className="form-input"
              required
            >
              <option value="">-- Chagua Bidhaa --</option>
              {products.map(p => (
                <option key={p.local_id} value={p.local_id}>
                  {p.name}
                </option>
              ))}
            </select>

            <label className="form-label">Kiasi *</label>
            <input
              type="number"
              placeholder="0"
              value={purchaseForm.quantity}
              onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
              className="form-input"
              inputMode="numeric"
              required
            />

            <label className="form-label">Bei ya Kununua *</label>
            <input
              type="number"
              placeholder="0"
              value={purchaseForm.cost_price}
              onChange={e => setPurchaseForm({ ...purchaseForm, cost_price: e.target.value })}
              className="form-input"
              inputMode="numeric"
              required
            />

            <label className="form-label">Malipo ya Awali</label>
            <input
              type="number"
              placeholder="0 (kama umelipa)"
              value={purchaseForm.amount_paid}
              onChange={e => setPurchaseForm({ ...purchaseForm, amount_paid: e.target.value })}
              className="form-input"
              inputMode="numeric"
            />

            <label className="form-label">Maelezo</label>
            <input
              type="text"
              placeholder="Maelezo (si lazima)"
              value={purchaseForm.notes}
              onChange={e => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
              className="form-input"
            />

            {purchaseForm.quantity && purchaseForm.cost_price && (
              <div className="calc-box">
                <span>Jumla:</span>
                <span className="calc-value">
                  {formatTZS(Number(purchaseForm.quantity) * Number(purchaseForm.cost_price))}
                </span>
              </div>
            )}

            <button type="submit" className="form-btn">
              HIFADHI MANUNUZI
            </button>
          </form>
        )}

        {/* PURCHASES */}
        <div className="section-header">
          <div className="section-label">MANUNUZI</div>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-small">Hakuna manunuzi bado</div>
        ) : (
          <div className="card-list">
            {purchases.map(p => (
              <div key={p.local_id} className="card">
                <div className="card-main">
                  <div className="card-name">{formatTZS(p.total_amount)}</div>
                  <div className="card-sub">
                    {formatDate(p.purchase_date)}
                    {Number(p.balance) > 0 && (
                      <span className="debt-label">
                        {' · '}Deni: {formatTZS(p.balance)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`card-value ${Number(p.balance) > 0 ? 'debt' : 'clean'}`}>
                  {Number(p.balance) > 0 ? 'Deni' : '✓'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAYMENTS */}
        <div className="section-header">
          <div className="section-label">MALIPO</div>
        </div>

        {payments.length === 0 ? (
          <div className="empty-small">Hakuna malipo bado</div>
        ) : (
          <div className="card-list">
            {payments.map(p => (
              <div key={p.local_id} className="card">
                <div className="card-main">
                  <div className="card-name">{formatTZS(p.amount)}</div>
                  <div className="card-sub">
                    {formatDate(p.payment_date)}
                    {' · '}
                    {p.payment_method === 'cash' ? 'Taslimu' :
                     p.payment_method === 'mpesa' ? 'M-Pesa' : 'Benki'}
                  </div>
                </div>
                <div className="card-value clean">-</div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        .supplier-detail {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%);
          border-radius: 16px 16px 28px 28px;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-back {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .hero-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .hero-avatar {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .hero-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .hero-debt {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .hero-debt-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .hero-debt-value {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .hero-debt-value.debt {
          color: #FCA5A5;
        }

        .hero-debt-value.clean {
          color: #86EFAC;
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .hero-action {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }

        .hero-action:active {
          transform: scale(0.97);
        }

        .hero-action-primary {
          background: #fff;
          color: #0369A1;
        }

        .hero-action-secondary {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
        }

        .section-header {
          margin-bottom: 10px;
          margin-top: 16px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
        }

        /* FORM */
        .form-card {
          background: #1A1A1A;
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .form-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 14px;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 6px;
          margin-top: 10px;
        }

        .form-input {
          width: 100%;
          padding: 14px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #0284C7; }

        .form-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0369A1 0%, #075985 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
          margin-top: 16px;
        }

        .form-btn:active { transform: scale(0.98); }

        .calc-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(3, 105, 161, 0.15);
          border: 1px solid rgba(3, 105, 161, 0.3);
          border-radius: 10px;
          padding: 10px 14px;
          margin-top: 12px;
          font-size: 13px;
          color: #7DD3FC;
        }

        .calc-value {
          font-size: 16px;
          font-weight: 800;
          color: #38BDF8;
        }

        /* CARD LIST */
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #1A1A1A;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-main {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 3px;
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
        }

        .debt-label {
          color: #FCA5A5;
        }

        .card-value {
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .card-value.debt {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
        }

        .card-value.clean {
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
        }

        .empty-small {
          padding: 20px;
          text-align: center;
          color: #6B7280;
          font-size: 13px;
          background: #1A1A1A;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
}

export default SupplierDetail

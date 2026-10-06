import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCustomerById,
  getPaymentsByCustomer,
  createPaymentLocal,
  getAllSales,
  getDepositsByCustomer,
  createDepositLocal,
} from '../db/operations'
import { db } from '../db/dexie'

function MtejaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [payments, setPayments] = useState([])
  const [sales, setSales] = useState([])
  const [deposits, setDeposits] = useState([])
  const [activeTab, setActiveTab] = useState('mauzo')

  const [showPayForm, setShowPayForm] = useState(false)
  const [showDepositForm, setShowDepositForm] = useState(false)

  const [payForm, setPayForm] = useState({ amount: '', payment_method: 'cash', notes: '' })
  const [depositForm, setDepositForm] = useState({ amount: '', deposit_type: 'in', notes: '' })

  const load = async () => {
    const c = await getCustomerById(id)
    setCustomer(c)

    const p = await getPaymentsByCustomer(id)
    setPayments(p)

    const allSales = await getAllSales()
    const mySales = []
    for (const s of allSales) {
      if (s.customer_local_id === id) {
        const items = await db.sale_items.where('sale_id').equals(s.local_id).toArray()
        s.items = items
        s.first_item_name = items[0]?.product_name || 'Mauzo'
        mySales.push(s)
      }
    }
    setSales(mySales)

    const d = await getDepositsByCustomer(id)
    setDeposits(d)
  }

  useEffect(() => { load() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      return alert('Weka kiasi sahihi')
    }
    try {
      await createPaymentLocal({
        customer_local_id: id,
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

  const handleDeposit = async (e) => {
    e.preventDefault()
    if (!depositForm.amount || Number(depositForm.amount) <= 0) {
      return alert('Weka kiasi sahihi')
    }
    try {
      await createDepositLocal({
        customer_local_id: id,
        amount: Number(depositForm.amount),
        deposit_type: depositForm.deposit_type,
        notes: depositForm.notes,
      })
      setDepositForm({ amount: '', deposit_type: 'in', notes: '' })
      setShowDepositForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })

  if (!customer) return <div style={{ padding: '20px', color: '#9CA3AF' }}>Inapakia...</div>

  const balance = Number(customer.balance || 0)
  const deposit = Number(customer.deposit || 0)
  const hasDebt = balance > 0
  const hasDeposit = deposit > 0

  return (
    <div className="mteja-detail">
      {/* HERO */}
      <div className="hero">
        <div className="hero-top">
          <button className="hero-back" onClick={() => navigate(-1)}>←</button>
          <div className="hero-avatar">{customer.name.charAt(0).toUpperCase()}</div>
          <div className="hero-info">
            <div className="hero-name">{customer.name}</div>
            <div className="hero-sub">{customer.phone || 'Hakuna simu'}</div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className={`hero-stat-value ${hasDebt ? 'danger' : 'success'}`}>
              {formatTZS(hasDebt ? balance : 0)}
            </div>
            <div className="hero-stat-label">{hasDebt ? 'Anadaiwa' : 'Hana Deni'}</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className={`hero-stat-value ${hasDeposit ? 'warning' : ''}`}>
              {formatTZS(hasDeposit ? deposit : 0)}
            </div>
            <div className="hero-stat-label">Amana</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{sales.length}</div>
            <div className="hero-stat-label">Mauzo</div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="hero-btn primary" onClick={() => setShowPayForm(!showPayForm)}>
            + Malipo
          </button>
          <button className="hero-btn secondary" onClick={() => setShowDepositForm(!showDepositForm)}>
            + Amana
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* PAY FORM */}
        {showPayForm && (
          <form onSubmit={handlePayment} className="form-card">
            <div className="form-title">Rekodi Malipo</div>
            <label className="form-label">Kiasi *</label>
            <input type="number" placeholder="0" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="form-input" inputMode="numeric" autoFocus required />
            <label className="form-label">Njia ya Malipo</label>
            <select value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })} className="form-input">
              <option value="cash">Taslimu</option>
              <option value="mpesa">M-Pesa</option>
            </select>
            <label className="form-label">Maelezo</label>
            <input type="text" placeholder="Maelezo (si lazima)" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} className="form-input" />
            <button type="submit" className="form-btn">HIFADHI MALIPO</button>
          </form>
        )}

        {/* DEPOSIT FORM */}
        {showDepositForm && (
          <form onSubmit={handleDeposit} className="form-card">
            <div className="form-title">Amana</div>
            <label className="form-label">Kiasi *</label>
            <input type="number" placeholder="0" value={depositForm.amount} onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })} className="form-input" inputMode="numeric" autoFocus required />
            <label className="form-label">Aina</label>
            <select value={depositForm.deposit_type} onChange={e => setDepositForm({ ...depositForm, deposit_type: e.target.value })} className="form-input">
              <option value="in">Weka Amana</option>
              <option value="out">Tumia Amana</option>
              <option value="refund">Rudisha Amana</option>
            </select>
            <label className="form-label">Maelezo</label>
            <input type="text" placeholder="Maelezo (si lazima)" value={depositForm.notes} onChange={e => setDepositForm({ ...depositForm, notes: e.target.value })} className="form-input" />
            <button type="submit" className="form-btn">HIFADHI AMANA</button>
          </form>
        )}

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'mauzo' ? 'active' : ''}`} onClick={() => setActiveTab('mauzo')}>
            Mauzo ({sales.length})
          </button>
          <button className={`tab ${activeTab === 'malipo' ? 'active' : ''}`} onClick={() => setActiveTab('malipo')}>
            Malipo ({payments.length})
          </button>
          <button className={`tab ${activeTab === 'amana' ? 'active' : ''}`} onClick={() => setActiveTab('amana')}>
            Amana ({deposits.length})
          </button>
        </div>

        {/* TAB: MAUZO */}
        {activeTab === 'mauzo' && (
          sales.length === 0 ? (
            <div className="empty-small">Hakuna mauzo bado</div>
          ) : (
            <div className="card-list">
              {sales.map(s => (
                <div key={s.local_id} className="card-column">
                  <div className="card-row-top">
                    <div className="card-name">{formatDate(s.sale_date)}</div>
                    <div className={`card-value ${s.payment_method === 'credit' ? 'debt' : 'clean'}`}>
                      {formatTZS(s.total_amount)}
                    </div>
                  </div>
                  {s.items && s.items.length > 0 && (
                    <div className="card-items">
                      {s.items.map((item, i) => (
                        <div key={i} className="card-item-line">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">{item.quantity} × {formatTZS(item.unit_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB: MALIPO */}
        {activeTab === 'malipo' && (
          payments.length === 0 ? (
            <div className="empty-small">Hakuna malipo bado</div>
          ) : (
            <div className="card-list">
              {payments.map(p => (
                <div key={p.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">{formatTZS(p.amount)}</div>
                    <div className="card-sub">
                      {formatDate(p.payment_date)} · {p.payment_method === 'cash' ? 'Taslimu' : 'M-Pesa'}
                    </div>
                    {p.notes && <div className="card-sub">{p.notes}</div>}
                  </div>
                  <div className="card-value clean">-</div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB: AMANA */}
        {activeTab === 'amana' && (
          deposits.length === 0 ? (
            <div className="empty-small">Hakuna amana bado</div>
          ) : (
            <div className="card-list">
              {deposits.map(d => (
                <div key={d.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">{formatTZS(d.amount)}</div>
                    <div className="card-sub">
                      {formatDate(d.deposit_date)} · {d.deposit_type === 'in' ? 'Weka' : d.deposit_type === 'out' ? 'Tumia' : 'Rudisha'}
                    </div>
                    {d.notes && <div className="card-sub">{d.notes}</div>}
                  </div>
                  <div className={`card-value ${d.deposit_type === 'in' ? 'clean' : 'debt'}`}>
                    {d.deposit_type === 'in' ? '+' : '-'}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>

      <style>{`
        .mteja-detail { width: 100%; min-height: 100vh; background: #0A0A0A; }
        .hero { background: linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%); border-radius: 16px 16px 28px 28px; padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 12px 32px rgba(194, 65, 12, 0.4); }
        .hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); }
        .hero-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; position: relative; z-index: 1; }
        .hero-back { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 34px; height: 34px; border-radius: 10px; font-size: 16px; cursor: pointer; flex-shrink: 0; }
        .hero-avatar { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; }
        .hero-info { flex: 1; min-width: 0; }
        .hero-name { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
        .hero-sub { font-size: 11px; color: rgba(255,255,255,0.8); }
        .hero-stats { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; position: relative; z-index: 1; }
        .hero-stat { flex: 1; text-align: center; }
        .hero-stat-value { font-size: 15px; font-weight: 800; }
        .hero-stat-value.danger { color: #FCA5A5; }
        .hero-stat-value.success { color: #86EFAC; }
        .hero-stat-value.warning { color: #FCD34D; }
        .hero-stat-label { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.4px; }
        .hero-stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }
        .hero-actions { display: flex; gap: 8px; position: relative; z-index: 1; }
        .hero-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; }
        .hero-btn.primary { background: #fff; color: #C2410C; }
        .hero-btn.secondary { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); }
        .content { padding: 16px 0; }
        .tabs { display: flex; gap: 6px; margin-bottom: 14px; background: #1A1A1A; padding: 5px; border-radius: 12px; }
        .tab { flex: 1; padding: 9px; background: transparent; border: none; border-radius: 8px; color: #9CA3AF; font-size: 12px; font-weight: 700; cursor: pointer; }
        .tab.active { background: #C2410C; color: #fff; }
        .form-card { background: #1A1A1A; border-radius: 16px; padding: 16px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .form-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; margin-top: 10px; }
        .form-input { width: 100%; padding: 13px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #F97316; }
        .form-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #C2410C 0%, #EA580C 100%); color: #fff; border: none; border-radius: 11px; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 14px; }
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
        .card-value { font-size: 12px; font-weight: 700; flex-shrink: 0; padding: 4px 10px; border-radius: 8px; }
        .card-value.debt { color: #EF4444; background: rgba(239,68,68,0.12); }
        .card-value.clean { color: #10B981; background: rgba(16,185,129,0.12); }
        .empty-small { padding: 30px 20px; text-align: center; color: #6B7280; font-size: 13px; background: #1A1A1A; border-radius: 13px; border: 1px solid rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}

export default MtejaDetail

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCustomers, createCustomerLocal, getDepositsByCustomer, createDepositLocal, calculateDepositSplit } from '../db/operations'
import { db } from '../db/dexie'

function Amana() {
  const [customers, setCustomers] = useState([])
  const [allDeposits, setAllDeposits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    customer_local_id: '',
    amount: '',
    notes: '',
  })

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  })

  const [isNewCustomer, setIsNewCustomer] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getAllCustomers()
    // Chuja wale wenye amana au wote (kwa chagua)
    setCustomers(data)

    // Pata deposits zote
    const deposits = await db.deposits
      .orderBy('deposit_date')
      .reverse()
      .toArray()

    // Ongeza jina la mteja
    for (const d of deposits) {
      const cust = data.find(c => c.local_id === d.customer_local_id)
      d.customer_name = cust?.name || 'Mteja'
      d.customer_phone = cust?.phone || ''
    }

    setAllDeposits(deposits)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.amount || Number(form.amount) <= 0) {
      alert('Weka kiasi sahihi')
      return
    }

    let customerId = form.customer_local_id

    // Kama ni mteja mpya — mwunde kwanza
    if (isNewCustomer) {
      if (!newCustomer.name.trim()) {
        alert('Weka jina la mteja')
        return
      }

      try {
        const created = await createCustomerLocal({
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
        })
        customerId = created.local_id
      } catch (err) {
        alert('Kosa: ' + err.message)
        return
      }
    }

    if (!customerId) {
      alert('Chagua mteja')
      return
    }

    try {
      await createDepositLocal({
        customer_local_id: customerId,
        amount: Number(form.amount),
        deposit_type: 'in',
        notes: form.notes,
      })

      setForm({ customer_local_id: '', amount: '', notes: '' })
      setNewCustomer({ name: '', phone: '' })
      setIsNewCustomer(false)
      setShowForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  // Mteja aliyechaguliwa
  const selectedCustomer = customers.find(c => c.local_id === form.customer_local_id)

  // Hesabu ya amana
  const depositSplit = selectedCustomer && form.amount
    ? calculateDepositSplit(selectedCustomer, form.amount)
    : null

  // Wateja wenye amana
  const customersWithDeposit = customers.filter(c => Number(c.deposit) > 0)
  const totalDeposit = customersWithDeposit.reduce((sum, c) => sum + Number(c.deposit || 0), 0)

  // Amana za leo
  const today = new Date().toISOString().split('T')[0]
  const todayDeposits = allDeposits.filter(d =>
    d.deposit_date?.startsWith(today) && d.deposit_type === 'in'
  )
  const todayTotal = todayDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  return (
    <div className="amana">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Amana</div>
            <div className="hero-sub">Pesa za wateja dukani</div>
          </div>
          <button className="hero-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕' : '+'}
          </button>
        </div>

        <div className="hero-label">JUMLA YA AMANA</div>
        <div className="hero-value-row">
          <span className="hero-value">{formatTZS(totalDeposit)}</span>
          <span className="hero-count">{customersWithDeposit.length} wateja</span>
        </div>

        <div className="hero-today">
          <span className="hero-today-label">Leo:</span>
          <span className="hero-today-value">+{formatTZS(todayTotal)}</span>
          <span className="hero-today-count">({todayDeposits.length})</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} className="form-card">
            <div className="form-title">Weka Amana</div>

            {/* Chagua: Mteja aliyepo au Mpya */}
            <div className="toggle-row">
              <button
                type="button"
                className={`toggle-btn ${!isNewCustomer ? 'active' : ''}`}
                onClick={() => setIsNewCustomer(false)}
              >
                Mteja Aliyepo
              </button>
              <button
                type="button"
                className={`toggle-btn ${isNewCustomer ? 'active' : ''}`}
                onClick={() => setIsNewCustomer(true)}
              >
                Mteja Mpya
              </button>
            </div>

            {!isNewCustomer ? (
              <>
                <label className="form-label">Chagua Mteja</label>
                <select
                  value={form.customer_local_id}
                  onChange={e => setForm({ ...form, customer_local_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Chagua Mteja --</option>
                  {customers.map(c => (
                    <option key={c.local_id} value={c.local_id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                      {Number(c.deposit) > 0 ? ` — Amana: ${formatTZS(c.deposit)}` : ''}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label className="form-label">Jina la Mteja *</label>
                <input
                  type="text"
                  placeholder="Mfano: Juma Contractor"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="form-input"
                />

                <label className="form-label">Simu</label>
                <input
                  type="tel"
                  placeholder="Mfano: 0712345678"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="form-input"
                  inputMode="tel"
                />
              </>
            )}

            <label className="form-label">Kiasi (TZS) *</label>
            <input
              type="number"
              placeholder="Mfano: 500000"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="form-input"
              inputMode="numeric"
              required
            />

            <label className="form-label">Maelezo (si lazima)</label>
            <input
              type="text"
              placeholder="Mfano: Mradi wa nyumba"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="form-input"
            />

            {depositSplit && selectedCustomer && (
              <div className="split-box">
                {Number(selectedCustomer.balance) > 0 && (
                  <div className="split-row split-warn">
                    <span>⚠️ Ana Deni</span>
                    <span>{formatTZS(selectedCustomer.balance)}</span>
                  </div>
                )}

                {depositSplit.toPayDebt > 0 && (
                  <div className="split-row">
                    <span>Deni litakalolipwa</span>
                    <span className="split-debt">{formatTZS(depositSplit.toPayDebt)}</span>
                  </div>
                )}

                {depositSplit.toDeposit > 0 && (
                  <div className="split-row">
                    <span>Amana itakayobaki</span>
                    <span className="split-deposit">{formatTZS(depositSplit.toDeposit)}</span>
                  </div>
                )}

                {depositSplit.newBalance > 0 && (
                  <div className="split-row split-final-warn">
                    <span>Deni litakalobaki</span>
                    <span>{formatTZS(depositSplit.newBalance)}</span>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="form-btn">
              HIFADHI AMANA
            </button>
          </form>
        )}

        {/* ORODHA YA WATEJA WENYE AMANA */}
        <div className="section-header">
          <div className="section-label">WATEJA WENYE AMANA</div>
        </div>

        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : customersWithDeposit.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-title">Hakuna amana</div>
            <div className="empty-sub">Bonyeza + kuongeza amana</div>
          </div>
        ) : (
          <div className="card-list">
            {customersWithDeposit.map(c => (
              <Link
                key={c.local_id}
                to={`/wateja/${c.local_id}`}
                className="card"
              >
                <div className="card-avatar">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="card-main">
                  <div className="card-name">{c.name}</div>
                  <div className="card-sub">{c.phone || 'Hakuna simu'}</div>
                </div>
                <div className="card-value card-value-amana">
                  {formatTZS(c.deposit)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* HISTORIA */}
        {allDeposits.length > 0 && (
          <>
            <div className="section-header">
              <div className="section-label">HISTORIA YA AMANA</div>
            </div>

            <div className="card-list">
              {allDeposits.slice(0, 20).map(d => {
                const isIn = d.deposit_type === 'in'
                const isOut = d.deposit_type === 'out'
                const isRefund = d.deposit_type === 'refund'

                let label = 'Weka'
                let className = 'deposit-in'

                if (isOut) {
                  label = 'Tumia'
                  className = 'deposit-out'
                } else if (isRefund) {
                  label = 'Rudisha'
                  className = 'deposit-refund'
                }

                return (
                  <div key={d.local_id} className="card">
                    <div className={`card-dot ${className}`}></div>
                    <div className="card-main">
                      <div className="card-name">{d.customer_name}</div>
                      <div className="card-sub">
                        {label}
                        {d.notes ? ` · ${d.notes}` : ''}
                        {' · '}
                        {new Date(d.deposit_date).toLocaleDateString('sw-TZ', {
                          day: 'numeric', month: 'short'
                        })}
                      </div>
                    </div>
                    <div className={`card-value card-value-${className}`}>
                      {isIn ? '+' : '-'}{formatTZS(d.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>

      <style>{`
        .amana {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #78350F 0%, #D97706 50%, #F59E0B 100%);
          border-radius: 16px 16px 28px 28px;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(217, 119, 6, 0.4);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .hero-add {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-add:active {
          transform: scale(0.92);
        }

        .hero-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
        }

        .hero-value-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .hero-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1;
          color: #fff;
        }

        .hero-count {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }

        .hero-today {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          background: rgba(0, 0, 0, 0.2);
          padding: 6px 12px;
          border-radius: 10px;
          position: relative;
          z-index: 1;
        }

        .hero-today-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-today-value {
          font-size: 14px;
          font-weight: 800;
          color: #86EFAC;
        }

        .hero-today-count {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
          margin-top: 8px;
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
          margin-bottom: 4px;
        }

        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #F59E0B; }

        .form-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #D97706 0%, #92400E 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
          margin-top: 16px;
        }

        .split-box {
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 12px;
        }

        .split-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding: 6px 0;
        }

        .split-row span:first-child {
          color: #9CA3AF;
        }

        .split-row span:last-child {
          font-weight: 700;
        }

        .split-warn {
          background: rgba(239, 68, 68, 0.1);
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 4px;
        }

        .split-warn span {
          color: #FCA5A5 !important;
          font-weight: 700 !important;
        }

        .split-debt {
          color: #86EFAC;
        }

        .split-deposit {
          color: #FBBF24;
        }

        .split-final-warn {
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          margin-top: 6px;
          padding-top: 8px;
        }

        .split-final-warn span:first-child {
          color: #FCA5A5;
        }

        .split-final-warn span:last-child {
          color: #EF4444;
        }

        .form-btn:active {
          transform: scale(0.98);
        }

        /* TOGGLE */
        .toggle-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 12px;
        }

        .toggle-btn {
          padding: 12px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }

        .toggle-btn.active {
          background: #D97706;
          border-color: #D97706;
          color: #fff;
        }

        /* CARD LIST */
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #1A1A1A;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.15s;
        }

        .card:active {
          transform: scale(0.98);
          background: #232323;
        }

        .card-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D97706, #92400E);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          color: #fff;
          flex-shrink: 0;
        }

        .card-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .card-dot.deposit-in {
          background: #86EFAC;
        }

        .card-dot.deposit-out {
          background: #60A5FA;
        }

        .card-dot.deposit-refund {
          background: #FCA5A5;
        }

        .card-main {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-value {
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .card-value-amana {
          color: #FBBF24;
          background: rgba(251, 191, 36, 0.12);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .card-value-deposit-in {
          color: #86EFAC;
        }

        .card-value-deposit-out {
          color: #60A5FA;
        }

        .card-value-deposit-refund {
          color: #FCA5A5;
        }

        /* EMPTY */
        .empty {
          padding: 40px 20px;
          text-align: center;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-icon {
          font-size: 36px;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .empty-sub {
          font-size: 12px;
          color: #9CA3AF;
        }
      `}</style>
    </div>
  )
}

export default Amana

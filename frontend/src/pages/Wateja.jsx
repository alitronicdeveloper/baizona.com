import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCustomers, createCustomerLocal } from '../db/operations'

function Wateja() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '' })

  const load = async () => {
    setLoading(true)
    const data = await getAllCustomers()
    setCustomers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createCustomerLocal(form)
      setForm({ name: '', phone: '' })
      setShowForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                       (c.phone && c.phone.includes(search))
    let matchFilter = true
    if (filter === 'debt') matchFilter = Number(c.balance) > 0
    if (filter === 'clean') matchFilter = Number(c.balance) <= 0
    return matchSearch && matchFilter
  })

  const totalDebt = customers.reduce((sum, c) => sum + Number(c.balance || 0), 0)
  const debtorsCount = customers.filter(c => Number(c.balance) > 0).length
  const cleanCount = customers.filter(c => Number(c.balance) <= 0).length

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  return (
    <div className="wateja">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Wateja</div>
            <div className="hero-sub">Usimamizi wa wateja wako</div>
          </div>
          <div className="hero-actions">
            <Link to="/uza" className="hero-uza">+ Uza</Link>
            <button
              className="hero-add"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕' : '+'}
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{customers.length}</div>
            <div className="hero-stat-label">Wote</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value hero-stat-value-warn">{debtorsCount}</div>
            <div className="hero-stat-label">Wanaodaiwa</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value hero-stat-value-success">{cleanCount}</div>
            <div className="hero-stat-label">Wasio na Deni</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-title">Ongeza Mteja Mpya</div>

            <input
              placeholder="Jina *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="form-input"
              autoFocus
            />
            <input
              placeholder="Simu"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="form-input"
            />

            <button type="submit" className="form-btn">
              HIFADHI MTEJA
            </button>
          </form>
        )}

        {/* SEARCH */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tafuta kwa jina au simu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* FILTERS */}
        <div className="filters">
          {[
            { id: 'all', label: 'Wote' },
            { id: 'debt', label: 'Wanaodaiwa' },
            { id: 'clean', label: 'Wasio na Deni' },
          ].map(f => (
            <button
              key={f.id}
              className={`filter ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <div className="empty-title">
              {search ? 'Hakuna mteja anayelingana' : 'Hakuna wateja bado'}
            </div>
            <div className="empty-sub">
              {search ? 'Jaribu jina lingine' : 'Ongeza mteja wa kwanza'}
            </div>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(c => {
              const balance = Number(c.balance)
              const deposit = Number(c.deposit || 0)
              const isDebt = balance > 0
              const isDeposit = deposit > 0 && !isDebt
              return (
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
                    <div className="card-sub">
                      {c.phone || 'Hakuna simu'}
                    </div>
                  </div>
                  <div className={`card-value ${isDebt ? 'card-value-deni' : isDeposit ? 'card-value-amana' : 'card-value-clean'}`}>
                    {isDebt ? formatTZS(balance) : isDeposit ? `Amana: ${formatTZS(deposit)}` : '✓'}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .wateja {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #1920A7 0%, #3047CD 50%, #232CC9 100%);
          border-radius: 16px 16px 28px 28px;
          margin: 0;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(25, 32, 167, 0.4);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -50px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
        }

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
          color: #fff;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }

        .hero-uza {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 14px;
          border-radius: 10px;
          background: #F97316;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .hero-uza:active {
          transform: scale(0.95);
          background: #EA580C;
        }

        .hero-add {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .hero-add:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .hero-stat {
          flex: 1;
          min-width: 0;
          text-align: center;
        }

        .hero-stat-value {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-stat-value-warn {
          color: #FBBF24;
        }

        .hero-stat-value-success {
          color: #86EFAC;
        }

        .hero-stat-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
          white-space: nowrap;
        }

        .hero-stat-divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
          background: #0A0A0A;
        }

        /* FORM */
        .form {
          margin: 0 0 10px;
          background: #1A1A1A;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .form-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 10px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .form-input::placeholder {
          color: #6B7280;
        }

        .form-input:focus {
          border-color: #F97316;
          background: #0F0F0F;
        }

        .form-btn {
          width: 100%;
          padding: 14px;
          background: #F97316;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.2s;
        }

        .form-btn:active {
          transform: scale(0.98);
          background: #EA580C;
        }

        /* SEARCH */
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 10px;
          padding: 16px 18px;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }

        .search-wrap:focus-within {
          border-color: #F97316;
        }

        .search-icon {
          font-size: 14px;
          opacity: 0.6;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
          min-width: 0;
        }

        .search-input::placeholder {
          color: #6B7280;
        }

        .search-clear {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          color: #9CA3AF;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* FILTERS */
        .filters {
          display: flex;
          gap: 6px;
          margin: 0 0 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filters::-webkit-scrollbar { display: none; }

        .filter {
          flex: 1;
          padding: 12px 8px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          text-align: center;
        }

        .filter.active {
          background: #F97316;
          border-color: #F97316;
          color: #fff;
        }

        /* CARD LIST */
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          background: #1A1A1A;
          border-radius: 16px;
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
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F97316, #EA580C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          color: #fff;
          flex-shrink: 0;
        }

        .card-main {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
        }

        .card-value {
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .card-value-deni {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
        }

        .card-value-clean {
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
        }

        .card-value-amana {
          color: #FBBF24;
          background: rgba(251, 191, 36, 0.12);
        }

        /* EMPTY */
        .empty {
          margin: 0;
          padding: 40px 20px;
          text-align: center;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-icon {
          font-size: 36px;
          margin-bottom: 8px;
          opacity: 0.6;
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

export default Wateja

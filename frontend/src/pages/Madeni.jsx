import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCustomers } from '../db/operations'

function Madeni() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('amount')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getAllCustomers()
      setCustomers(data.filter(c => Number(c.balance) > 0))
      setLoading(false)
    }
    load()
  }, [])

  const daysSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('sw-TZ', {
      day: 'numeric', month: 'short'
    })
  }

  const filtered = customers
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    )
    .sort((a, b) => {
      if (sortBy === 'amount') return Number(b.balance) - Number(a.balance)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'newest') {
        const aDate = a.last_credit_date || a.created_at || 0
        const bDate = b.last_credit_date || b.created_at || 0
        return new Date(bDate) - new Date(aDate)
      }
      if (sortBy === 'oldest') {
        const aDate = a.oldest_credit_date || a.created_at || '9999'
        const bDate = b.oldest_credit_date || b.created_at || '9999'
        return new Date(aDate) - new Date(bDate)
      }
      return 0
    })

  const total = customers.reduce((sum, c) => sum + Number(c.balance), 0)
  const avg = customers.length > 0 ? total / customers.length : 0

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  return (
    <div className="madeni">
      {/* HERO — RED GRADIENT */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Madeni</div>
            <div className="hero-sub">Wateja wanaodaiwa</div>
          </div>
          <div className="hero-actions">
            <Link to="/uza" className="hero-uza">+ Uza</Link>
          </div>
        </div>

        <div className="hero-label">JUMLA YA MADENI</div>
        <div className="hero-value-row">
          <span className="hero-value">{formatTZS(total)}</span>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{customers.length}</div>
            <div className="hero-stat-label">Wanaodaiwa</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{formatTZS(avg)}</div>
            <div className="hero-stat-label">Wastani</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* SEARCH */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tafuta mteja..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* SORT */}
        <div className="filters">
          {[
            { id: 'amount', label: 'Deni kubwa' },
            { id: 'oldest', label: 'Zamani' },
            { id: 'newest', label: 'Jipya' },
            { id: 'name', label: 'Jina' },
          ].map(f => (
            <button
              key={f.id}
              className={`filter ${sortBy === f.id ? 'active' : ''}`}
              onClick={() => setSortBy(f.id)}
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
            <div className="empty-icon">🎉</div>
            <div className="empty-title">
              {search ? 'Hakuna mteja anayelingana' : 'Hakuna madeni!'}
            </div>
            <div className="empty-sub">
              {search ? 'Jaribu jina lingine' : 'Wateja wote wamelipa'}
            </div>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map((c, idx) => {
              const days = daysSince(c.last_credit_date || c.created_at)
              const isOld = days !== null && days > 30
              return (
                <Link
                  key={c.local_id}
                  to={`/wateja/${c.local_id}`}
                  className={`card ${isOld ? 'card-old' : ''}`}
                >
                  <div className="card-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="card-main">
                    <div className="card-name">{c.name}</div>
                    <div className="card-sub">
                      {c.phone || 'Hakuna simu'}
                      {days !== null && (
                        <span className={`days ${isOld ? 'days-old' : 'days-fresh'}`}>
                          {days === 0 ? ' Leo' : days === 1 ? ' Jana' : ` Siku ${days}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-value">
                    {formatTZS(c.balance)}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .madeni {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO — RED GRADIENT */
        .hero {
          background: linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #EF4444 100%);
          border-radius: 16px 16px 28px 28px;
          margin: 0;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(220, 38, 38, 0.4);
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
          color: rgba(255, 255, 255, 0.8);
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
          background: #fff;
          color: #DC2626;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .hero-uza:active {
          transform: scale(0.95);
          background: #FEE2E2;
        }

        .hero-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-value-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .hero-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
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
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
        }

        .hero-stat-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.75);
          margin-top: 2px;
          white-space: nowrap;
        }

        .hero-stat-divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
          background: #0A0A0A;
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
          border-color: #EF4444;
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
          background: #EF4444;
          border-color: #EF4444;
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

        .card.card-old {
          border-left: 3px solid #EF4444;
        }

        .card-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #DC2626, #991B1B);
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

        .days {
          font-weight: 700;
        }

        .days-fresh {
          color: #86EFAC;
        }

        .days-old {
          color: #FCA5A5;
        }

        .card-value {
          font-size: 14px;
          font-weight: 700;
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
          padding: 5px 10px;
          border-radius: 8px;
          flex-shrink: 0;
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

export default Madeni

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSuppliers, createSupplierLocal, getSupplierStats } from '../db/operations'

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    oweCount: 0,     // Tunadaiwa (tuna deni kwao)
    oweTotal: 0,
    owedCount: 0,    // Tunaowadai (wana deni kwetu)
    owedTotal: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    region: '',
    district: '',
    notes: '',
  })

  const load = async () => {
    setLoading(true)
    const data = await getAllSuppliers()
    setSuppliers(data)
    const suppliers = await getAllSuppliers()
    const owe = suppliers.filter(s => Number(s.balance || 0) > 0)
    const owed = suppliers.filter(s => Number(s.balance || 0) < 0)

    setStats({
      total: suppliers.length,
      oweCount: owe.length,
      oweTotal: owe.reduce((sum, s) => sum + Number(s.balance || 0), 0),
      owedCount: owed.length,
      owedTotal: owed.reduce((sum, s) => sum + Math.abs(Number(s.balance || 0)), 0),
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Weka jina la supplier')
      return
    }

    try {
      await createSupplierLocal(form)
      setForm({ name: '', phone: '', address: '', region: '', district: '', notes: '' })
      setShowForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  )

  return (
    <div className="suppliers">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Wasambazaji</div>
            <div className="hero-sub">Wanaokuuzia bidhaa</div>
          </div>
          <button className="hero-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕' : '+'}
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{stats.total}</div>
            <div className="hero-stat-label">WASAMBAZAJI</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value hero-stat-danger">{stats.oweCount}</div>
            <div className="hero-stat-label">WANAOTUDAI</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value hero-stat-success">{stats.owedCount}</div>
            <div className="hero-stat-label">TUNAOWADAI</div>
          </div>
        </div>

        <div className="hero-totals">
          <div className="hero-total-item">
            <span className="hero-total-label">JUMLA TUNAYOWADAI</span>
            <span className="hero-total-value danger">{formatTZS(stats.oweTotal)}</span>
          </div>
          <div className="hero-total-item">
            <span className="hero-total-label">JUMLA WANAYOTUDAI</span>
            <span className="hero-total-value success">{formatTZS(stats.owedTotal)}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} className="form-card">
            <div className="form-title">Ongeza Supplier</div>

            <label className="form-label">Jina *</label>
            <input
              type="text"
              placeholder="Mfano: Twiga Cement"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="form-input"
              autoFocus
              required
            />

            <label className="form-label">Simu</label>
            <input
              type="tel"
              placeholder="Mfano: 0712345678"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="form-input"
              inputMode="tel"
            />

            <label className="form-label">Anwani</label>
            <input
              type="text"
              placeholder="Mfano: Kariakoo"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="form-input"
            />

            <div className="form-row">
              <div>
                <label className="form-label">Mkoa</label>
                <input
                  type="text"
                  placeholder="Mfano: Dar es Salaam"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Wilaya</label>
                <input
                  type="text"
                  placeholder="Mfano: Ilala"
                  value={form.district}
                  onChange={e => setForm({ ...form, district: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <label className="form-label">Maelezo</label>
            <input
              type="text"
              placeholder="Maelezo ya ziada (si lazima)"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="form-input"
            />

            <button type="submit" className="form-btn">
              HIFADHI SUPPLIER
            </button>
          </form>
        )}

        {/* SEARCH */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tafuta supplier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏭</div>
            <div className="empty-title">
              {search ? 'Hakuna supplier anayelingana' : 'Hakuna wasambazaji bado'}
            </div>
            <div className="empty-sub">
              {search ? 'Jaribu jina lingine' : 'Bonyeza + kuongeza'}
            </div>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(s => {
              const balance = Number(s.balance || 0)
              return (
                <Link
                  key={s.local_id}
                  to={`/suppliers/${s.local_id}`}
                  className="card"
                >
                  <div className="card-avatar">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="card-main">
                    <div className="card-name">{s.name}</div>
                    <div className="card-sub">
                      {s.phone || 'Hakuna simu'}
                      {s.address ? ` · ${s.address}` : ''}
                    </div>
                  </div>
                  {balance > 0 ? (
                    <div className="card-value card-value-deni">
                      Wanatudai: {formatTZS(balance)}
                    </div>
                  ) : balance < 0 ? (
                    <div className="card-value card-value-clean">
                      Tunaowadai: {formatTZS(Math.abs(balance))}
                    </div>
                  ) : (
                    <div className="card-value card-value-clean">✓</div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .suppliers {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%);
          border-radius: 16px 16px 28px 28px;
          margin: 0;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(3, 105, 161, 0.4);
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

        .hero-add:active { transform: scale(0.92); }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .hero-stat {
          flex: 1;
          text-align: center;
        }

        .hero-stat-value {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-stat-warn {
          color: #FBBF24;
        }

        .hero-stat-danger {
          color: #FCA5A5;
        }

        .hero-stat-success {
          color: #86EFAC;
        }

        .hero-totals {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          z-index: 1;
        }

        .hero-total-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .hero-total-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-total-value {
          font-weight: 800;
          font-size: 13px;
        }

        .hero-total-value.danger {
          color: #FCA5A5;
        }

        .hero-total-value.success {
          color: #86EFAC;
        }

        .hero-stat-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }

        .hero-stat-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
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

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .form-row .form-input { margin-bottom: 0; }
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

        /* SEARCH */
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 16px 18px;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .search-wrap:focus-within {
          border-color: #0284C7;
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

        .search-input::placeholder { color: #6B7280; }

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
          background: linear-gradient(135deg, #0369A1, #075985);
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

export default Suppliers

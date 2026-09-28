import { useEffect, useState } from 'react'
import { getAllExpenses, createExpenseLocal, getExpensesStats } from '../db/operations'

const CATEGORIES = [
  { id: 'kodi', label: 'Kodi', icon: '🏠' },
  { id: 'umeme', label: 'Umeme', icon: '💡' },
  { id: 'maji', label: 'Maji', icon: '💧' },
  { id: 'usafiri', label: 'Usafiri', icon: '🚗' },
  { id: 'mshahara', label: 'Mshahara', icon: '👥' },
  { id: 'chakula', label: 'Chakula', icon: '🍽️' },
  { id: 'matengenezo', label: 'Matengenezo', icon: '🔧' },
  { id: 'nyingine', label: 'Nyingine', icon: '📝' },
]

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState({ todayTotal: 0, weekTotal: 0, monthTotal: 0, allTotal: 0, count: 0 })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('month')

  const [form, setForm] = useState({
    category: 'kodi',
    description: '',
    amount: '',
  })

  const load = async () => {
    setLoading(true)
    const data = await getAllExpenses()
    setExpenses(data)
    const s = await getExpensesStats()
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) {
      alert('Weka kiasi sahihi')
      return
    }

    try {
      await createExpenseLocal({
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        expense_date: new Date().toISOString(),
      })

      setForm({ category: 'kodi', description: '', amount: '' })
      setShowForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const getCategoryInfo = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || { label: catId, icon: '📝' }
  }

  // Filter
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const filtered = expenses.filter(e => {
    if (filter === 'today') return e.expense_date?.startsWith(today)
    if (filter === 'week') return e.expense_date >= weekAgo
    if (filter === 'month') return e.expense_date >= monthAgo
    return true
  })

  const filteredTotal = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  return (
    <div className="expenses">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Gharama</div>
            <div className="hero-sub">Gharama za duka lako</div>
          </div>
          <button className="hero-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕' : '+'}
          </button>
        </div>

        <div className="hero-label">JUMLA YA GHARAMA</div>
        <div className="hero-value-row">
          <span className="hero-value">{formatTZS(stats.monthTotal)}</span>
          <span className="hero-count">{stats.count} gharama</span>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{formatTZS(stats.todayTotal)}</div>
            <div className="hero-stat-label">Leo</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{formatTZS(stats.weekTotal)}</div>
            <div className="hero-stat-label">Wiki</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{formatTZS(stats.monthTotal)}</div>
            <div className="hero-stat-label">Mwezi</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} className="form-card">
            <div className="form-title">Ongeza Gharama</div>

            <div className="form-label">Aina ya Gharama</div>
            <div className="cat-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-btn ${form.category === cat.id ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, category: cat.id })}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Maelezo (si lazima)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="form-input"
            />

            <input
              type="number"
              placeholder="Kiasi (TZS)"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="form-input"
              inputMode="numeric"
              required
            />

            <button type="submit" className="form-btn">
              HIFADHI GHARAMA
            </button>
          </form>
        )}

        {/* FILTERS */}
        <div className="filters">
          {[
            { id: 'today', label: 'Leo' },
            { id: 'week', label: 'Wiki' },
            { id: 'month', label: 'Mwezi' },
            { id: 'all', label: 'Zote' },
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

        {/* TOTAL */}
        {filtered.length > 0 && (
          <div className="total-bar">
            <span className="total-label">Jumla</span>
            <span className="total-value">{formatTZS(filteredTotal)}</span>
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-title">Hakuna gharama</div>
            <div className="empty-sub">Bonyeza + kuongeza</div>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(e => {
              const cat = getCategoryInfo(e.category)
              return (
                <div key={e.local_id} className="card">
                  <div className="card-icon">{cat.icon}</div>
                  <div className="card-main">
                    <div className="card-name">{cat.label}</div>
                    <div className="card-sub">
                      {e.description || 'Hakuna maelezo'}
                      {' · '}
                      {new Date(e.expense_date).toLocaleDateString('sw-TZ', {
                        day: 'numeric', month: 'short'
                      })}
                    </div>
                  </div>
                  <div className="card-value">
                    {formatTZS(e.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .expenses {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
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
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .hero-value {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1;
          color: #fff;
        }

        .hero-count {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }

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
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #fff;
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
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 14px;
        }

        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 14px;
        }

        .cat-btn {
          padding: 10px 4px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.15s;
        }

        .cat-btn.active {
          background: #DC2626;
          border-color: #DC2626;
        }

        .cat-icon {
          font-size: 18px;
        }

        .cat-label {
          font-size: 10px;
          font-weight: 600;
          color: #9CA3AF;
        }

        .cat-btn.active .cat-label {
          color: #fff;
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
          margin-bottom: 10px;
        }

        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #DC2626; }

        .form-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
        }

        .form-btn:active {
          transform: scale(0.98);
        }

        /* FILTERS */
        .filters {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }

        .filter {
          flex: 1;
          padding: 10px 6px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .filter.active {
          background: #DC2626;
          border-color: #DC2626;
          color: #fff;
        }

        /* TOTAL */
        .total-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.25);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .total-label {
          font-size: 12px;
          font-weight: 700;
          color: #FCA5A5;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .total-value {
          font-size: 16px;
          font-weight: 800;
          color: #EF4444;
        }

        /* CARDS */
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

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(220, 38, 38, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
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
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-value {
          font-size: 14px;
          font-weight: 700;
          color: #EF4444;
          flex-shrink: 0;
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

export default Expenses

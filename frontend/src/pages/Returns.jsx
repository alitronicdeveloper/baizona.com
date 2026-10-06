import { useEffect, useState } from 'react'
import { getAllReturns, getReturnsStats } from '../db/operations'

function Returns() {
  const [returns, setReturns] = useState([])
  const [stats, setStats] = useState({ todayTotal: 0, monthTotal: 0, allTotal: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getAllReturns()
      setReturns(data)
      const s = await getReturnsStats()
      setStats(s)
      setLoading(false)
    }
    load()
  }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('sw-TZ', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="returns">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Returns</div>
            <div className="hero-sub">Bidhaa zilizorudishwa</div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{stats.count}</div>
            <div className="hero-stat-label">Jumla</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{formatTZS(stats.todayTotal)}</div>
            <div className="hero-stat-label">Leo</div>
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
        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : returns.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">↩️</div>
            <div className="empty-title">Hakuna returns</div>
            <div className="empty-sub">Returns zitaonekana hapa</div>
          </div>
        ) : (
          <div className="card-list">
            {returns.map(r => (
              <div key={r.local_id} className="card">
                <div className="card-main">
                  <div className="card-name">{r.reason || 'Return'}</div>
                  <div className="card-sub">
                    {formatDate(r.return_date)} · {r.refund_method === 'cash' ? 'Taslimu' : r.refund_method === 'credit' ? 'Deni' : r.refund_method}
                  </div>
                </div>
                <div className="card-value">{formatTZS(r.total_amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .returns { width: 100%; min-height: 100vh; background: #0A0A0A; }
        .hero { background: linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%); border-radius: 16px 16px 28px 28px; padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 12px 32px rgba(194, 65, 12, 0.4); }
        .hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); }
        .hero-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; position: relative; z-index: 1; }
        .hero-hello { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 2px; }
        .hero-sub { font-size: 12px; color: rgba(255, 255, 255, 0.8); }
        .hero-stats { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
        .hero-stat { flex: 1; text-align: center; }
        .hero-stat-value { font-size: 16px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hero-stat-label { font-size: 10px; color: rgba(255, 255, 255, 0.7); margin-top: 2px; }
        .hero-stat-divider { width: 1px; height: 24px; background: rgba(255, 255, 255, 0.2); }
        .content { padding: 16px 0; }
        .card-list { display: flex; flex-direction: column; gap: 6px; }
        .card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #1A1A1A; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .card-main { flex: 1; min-width: 0; }
        .card-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-sub { font-size: 11px; color: #9CA3AF; }
        .card-value { font-size: 14px; font-weight: 700; color: #F97316; flex-shrink: 0; }
        .empty { padding: 40px 20px; text-align: center; background: #1A1A1A; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.5; }
        .empty-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .empty-sub { font-size: 12px; color: #9CA3AF; }
      `}</style>
    </div>
  )
}

export default Returns

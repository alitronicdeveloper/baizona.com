import { useEffect, useState } from 'react'
import { getShops } from './adminApi'

function AdminAnalytics() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalShops = shops.length
  const activeShops = shops.filter(s => s.status === 'active').length
  const pendingShops = shops.filter(s => s.status === 'pending').length
  const suspendedShops = shops.filter(s => s.status === 'suspended').length

  const hardwareShops = shops.filter(s => s.shop_type === 'hardware').length
  const generalShops = shops.filter(s => s.shop_type === 'general').length

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  return (
    <div className="admin-analytics">
      <h1 className="page-title">Analytics</h1>
      <p className="page-sub">Muhtasari wa platform</p>

      {loading ? (
        <div className="empty">Inapakia...</div>
      ) : (
        <>
          {/* Maduka */}
          <div className="section">
            <div className="section-title">MADUKA</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏪</div>
                <div className="stat-value">{totalShops}</div>
                <div className="stat-label">Yote</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{activeShops}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{pendingShops}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-value">{suspendedShops}</div>
                <div className="stat-label">Suspended</div>
              </div>
            </div>
          </div>

          {/* Aina za Maduka */}
          <div className="section">
            <div className="section-title">AINA ZA MADUKA</div>
            <div className="types-list">
              <div className="type-card">
                <div className="type-icon">🔨</div>
                <div className="type-info">
                  <div className="type-name">Hardware</div>
                  <div className="type-desc">Maduka ya vifaa vya ujenzi</div>
                </div>
                <div className="type-value">{hardwareShops}</div>
              </div>
              <div className="type-card">
                <div className="type-icon">🏪</div>
                <div className="type-info">
                  <div className="type-name">Duka la Jumla</div>
                  <div className="type-desc">Maduka ya bidhaa mchanganyiko</div>
                </div>
                <div className="type-value">{generalShops}</div>
              </div>
            </div>
          </div>

          {/* Orodha ya Maduka */}
          <div className="section">
            <div className="section-title">MADUKA YOTE</div>
            {shops.length === 0 ? (
              <div className="empty">Hakuna maduka bado</div>
            ) : (
              <div className="shops-table">
                <div className="table-header">
                  <div className="th">Jina</div>
                  <div className="th">Mmiliki</div>
                  <div className="th">Aina</div>
                  <div className="th">Status</div>
                </div>
                {shops.map(s => (
                  <div key={s.id} className="table-row">
                    <div className="td td-name">{s.name}</div>
                    <div className="td">{s.owner_name || '—'}</div>
                    <div className="td">
                      {s.shop_type === 'hardware' ? '🔨 Hardware' : '🏪 Jumla'}
                    </div>
                    <div className="td">
                      <span className={`status-badge status-${s.status}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .admin-analytics { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 24px; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 11px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
        .stat-card { background: #141414; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px; }
        .stat-icon { font-size: 22px; margin-bottom: 10px; }
        .stat-value { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .stat-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; }
        .types-list { display: flex; flex-direction: column; gap: 8px; }
        .type-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .type-icon { font-size: 24px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(249,115,22,0.1); border-radius: 12px; flex-shrink: 0; }
        .type-info { flex: 1; min-width: 0; }
        .type-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .type-desc { font-size: 11px; color: #9CA3AF; }
        .type-value { font-size: 24px; font-weight: 800; color: #F97316; }
        .shops-table { background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; gap: 12px; padding: 12px 18px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .th { font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; gap: 12px; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .table-row:last-child { border-bottom: none; }
        .td { font-size: 13px; color: #d1d5db; display: flex; align-items: center; }
        .td-name { font-weight: 700; color: #fff; }
        .status-badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
        .status-active { background: rgba(16,185,129,0.15); color: #86EFAC; }
        .status-pending { background: rgba(251,191,36,0.15); color: #FCD34D; }
        .status-suspended { background: rgba(239,68,68,0.15); color: #FCA5A5; }
        .empty { padding: 40px 20px; text-align: center; background: #141414; border-radius: 16px; color: #9CA3AF; font-size: 13px; }
      `}</style>
    </div>
  )
}

export default AdminAnalytics

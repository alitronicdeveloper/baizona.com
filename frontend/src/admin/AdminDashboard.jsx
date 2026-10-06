import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getShops } from './adminApi'

function AdminDashboard() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeShops = shops.filter(s => s.status === 'active')
  const pendingShops = shops.filter(s => s.status === 'pending')
  const suspendedShops = shops.filter(s => s.status === 'suspended')

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Muhtasari wa platform</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{shops.length}</div>
          <div className="stat-label">Maduka Yote</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{activeShops.length}</div>
          <div className="stat-label">Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingShops.length}</div>
          <div className="stat-label">Pending</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{suspendedShops.length}</div>
          <div className="stat-label">Suspended</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Maduka</div>
          <Link to="/admin/shops" className="section-link">Ona yote →</Link>
        </div>

        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : shops.length === 0 ? (
          <div className="empty">Hakuna maduka bado</div>
        ) : (
          <div className="shops-list">
            {shops.slice(0, 5).map(shop => (
              <Link
                key={shop.id}
                to={`/admin/shops/${shop.id}`}
                className="shop-card"
              >
                <div className="shop-avatar">
                  {shop.name.charAt(0).toUpperCase()}
                </div>
                <div className="shop-main">
                  <div className="shop-name">{shop.name}</div>
                  <div className="shop-sub">
                    {shop.owner_name || 'Hakuna mmiliki'} · {shop.phone || 'Hakuna simu'}
                  </div>
                </div>
                <div className={`shop-status status-${shop.status}`}>
                  {shop.status}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 32px; }
        .stat-card { background: #141414; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; }
        .stat-icon { font-size: 24px; margin-bottom: 12px; }
        .stat-value { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; }
        .section { margin-bottom: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .section-title { font-size: 16px; font-weight: 700; color: #fff; }
        .section-link { font-size: 13px; color: #F97316; text-decoration: none; font-weight: 600; }
        .shops-list { display: flex; flex-direction: column; gap: 8px; }
        .shop-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; transition: all 0.15s; }
        .shop-card:hover { border-color: rgba(249,115,22,0.3); }
        .shop-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .shop-main { flex: 1; min-width: 0; }
        .shop-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .shop-sub { font-size: 12px; color: #9CA3AF; }
        .shop-status { font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.4px; flex-shrink: 0; }
        .status-active { background: rgba(16,185,129,0.15); color: #86EFAC; }
        .status-pending { background: rgba(251,191,36,0.15); color: #FCD34D; }
        .status-suspended { background: rgba(239,68,68,0.15); color: #FCA5A5; }
        .empty { padding: 40px 20px; text-align: center; background: #141414; border-radius: 16px; color: #9CA3AF; font-size: 13px; }
      `}</style>
    </div>
  )
}

export default AdminDashboard

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getShops } from './adminApi'

function AdminShops() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  )

  return (
    <div className="admin-shops">
      <h1 className="page-title">Maduka Yote</h1>
      <p className="page-sub">Maduka yote kwenye platform</p>

      <input
        type="text"
        placeholder="Tafuta duka kwa jina, mmiliki, au simu..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <div className="empty">Inapakia...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Hakuna maduka yanayolingana</div>
      ) : (
        <div className="shops-grid">
          {filtered.map(shop => (
            <Link key={shop.id} to={`/admin/shops/${shop.id}`} className="shop-card">
              <div className="shop-avatar">{shop.name.charAt(0).toUpperCase()}</div>
              <div className="shop-main">
                <div className="shop-name">{shop.name}</div>
                <div className="shop-sub">{shop.owner_name || 'Hakuna mmiliki'} · {shop.phone || 'Hakuna simu'}</div>
              </div>
              <div className={`shop-status status-${shop.status}`}>{shop.status}</div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .admin-shops { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
        .search-input { width: 100%; padding: 14px; background: #141414; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: #fff; font-size: 14px; outline: none; margin-bottom: 20px; box-sizing: border-box; }
        .search-input:focus { border-color: #F97316; }
        .shops-grid { display: flex; flex-direction: column; gap: 8px; }
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

export default AdminShops

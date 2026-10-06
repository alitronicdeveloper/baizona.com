import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getShop, updateShop, deleteShop } from './adminApi'

function AdminShopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    getShop(id)
      .then(setShop)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Badilisha status kuwa ${newStatus}?`)) return
    setSaving(true)
    try {
      const updated = await updateShop(id, { ...shop, status: newStatus })
      setShop(updated)
    } catch (err) {
      alert('Imeshindwa kubadilisha status')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Una uhakika unataka kufuta duka hili? Haiwezi kurudishwa.')) return
    try {
      await deleteShop(id)
      navigate('/admin/shops')
    } catch (err) {
      alert('Imeshindwa kufuta duka')
    }
  }

  if (loading) return <div className="empty">Inapakia...</div>
  if (!shop) return <div className="empty">Duka haipatikani</div>

  return (
    <div className="admin-shop-detail">
      <Link to="/admin/shops" className="back-link">← Rudi kwa Maduka</Link>

      <div className="detail-header">
        <div className="detail-avatar">{shop.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="detail-name">{shop.name}</h1>
          <div className="detail-sub">{shop.owner_name || 'Hakuna mmiliki'} · {shop.phone || 'Hakuna simu'}</div>
        </div>
        <div className={`detail-status status-${shop.status}`}>{shop.status}</div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-label">ID</div>
          <div className="detail-value detail-value-small">{shop.id}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Jina</div>
          <div className="detail-value">{shop.name}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Mmiliki</div>
          <div className="detail-value">{shop.owner_name || '—'}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Simu</div>
          <div className="detail-value">{shop.phone || '—'}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Aina ya Duka</div>
          <div className="detail-value">{shop.shop_type === 'hardware' ? '🔨 Hardware' : '🏪 Duka la Jumla'}</div>
        </div>
        <div className="detail-card">
          <div className="detail-label">Status</div>
          <div className="detail-value">{shop.status}</div>
        </div>
      </div>

      <div className="detail-actions">
        <div className="action-group">
          <div className="action-label">Badilisha Status</div>
          <div className="action-buttons">
            <button onClick={() => handleStatusChange('active')} disabled={saving || shop.status === 'active'} className="btn-status active">Active</button>
            <button onClick={() => handleStatusChange('pending')} disabled={saving || shop.status === 'pending'} className="btn-status pending">Pending</button>
            <button onClick={() => handleStatusChange('suspended')} disabled={saving || shop.status === 'suspended'} className="btn-status suspended">Suspended</button>
          </div>
        </div>

        <button onClick={handleDelete} className="btn-danger">Futa Duka</button>
      </div>

      <style>{`
        .admin-shop-detail { width: 100%; }
        .back-link { color: #F97316; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
        .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .detail-avatar { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .detail-name { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .detail-sub { font-size: 13px; color: #9CA3AF; }
        .detail-status { margin-left: auto; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 10px; text-transform: uppercase; }
        .status-active { background: rgba(16,185,129,0.15); color: #86EFAC; }
        .status-pending { background: rgba(251,191,36,0.15); color: #FCD34D; }
        .status-suspended { background: rgba(239,68,68,0.15); color: #FCA5A5; }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .detail-card { background: #141414; border-radius: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .detail-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .detail-value { font-size: 14px; color: #fff; font-weight: 600; }
        .detail-value-small { font-size: 11px; word-break: break-all; }
        .detail-actions { display: flex; flex-direction: column; gap: 20px; }
        .action-group { background: #141414; border-radius: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .action-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 12px; }
        .action-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-status { padding: 10px 18px; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-status:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-status.active { background: rgba(16,185,129,0.2); color: #86EFAC; }
        .btn-status.pending { background: rgba(251,191,36,0.2); color: #FCD34D; }
        .btn-status.suspended { background: rgba(239,68,68,0.2); color: #FCA5A5; }
        .btn-danger { padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; color: #FCA5A5; font-size: 14px; font-weight: 700; cursor: pointer; }
        .empty { padding: 40px; text-align: center; color: #9CA3AF; }
      `}</style>
    </div>
  )
}

export default AdminShopDetail

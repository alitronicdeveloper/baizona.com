import { useEffect, useState } from 'react'
import { getShops, updateShop } from './adminApi'

function AdminPending() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    getShops()
      .then(data => setShops(data.filter(s => s.status === 'pending')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (shop) => {
    if (!window.confirm(`Thibitisha duka la ${shop.name}?`)) return
    setSaving(true)
    try {
      await updateShop(shop.id, { ...shop, status: 'active' })
      load()
    } catch (err) {
      alert('Imeshindwa kuthibitisha')
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async (shop) => {
    if (!window.confirm(`Kataa duka la ${shop.name}?`)) return
    setSaving(true)
    try {
      await updateShop(shop.id, { ...shop, status: 'suspended' })
      load()
    } catch (err) {
      alert('Imeshindwa kukataa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-pending">
      <h1 className="page-title">Maduka Yanayosubiri</h1>
      <p className="page-sub">Thibitisha au kataa maduka yaliyojisajili</p>

      {loading ? (
        <div className="empty">Inapakia...</div>
      ) : shops.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <div className="empty-title">Hakuna maduka yanayosubiri</div>
          <div className="empty-sub">Yote yamethibitishwa</div>
        </div>
      ) : (
        <div className="pending-list">
          {shops.map(shop => (
            <div key={shop.id} className="pending-card">
              <div className="pending-avatar">
                {shop.name.charAt(0).toUpperCase()}
              </div>
              <div className="pending-info">
                <div className="pending-name">{shop.name}</div>
                <div className="pending-sub">
                  {shop.owner_name} · {shop.phone}
                </div>
                <div className="pending-type">
                  {shop.shop_type === 'hardware' ? '🔨 Hardware' : '🏪 Duka la Jumla'}
                </div>
              </div>
              <div className="pending-actions">
                <button
                  onClick={() => handleApprove(shop)}
                  disabled={saving}
                  className="btn-approve"
                >
                  ✓ Thibitisha
                </button>
                <button
                  onClick={() => handleReject(shop)}
                  disabled={saving}
                  className="btn-reject"
                >
                  ✕ Kataa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-pending { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 24px; }
        .pending-list { display: flex; flex-direction: column; gap: 10px; }
        .pending-card { display: flex; align-items: center; gap: 14px; padding: 18px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .pending-avatar { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pending-info { flex: 1; min-width: 0; }
        .pending-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .pending-sub { font-size: 12px; color: #9CA3AF; margin-bottom: 4px; }
        .pending-type { font-size: 11px; color: #71717a; }
        .pending-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .btn-approve { padding: 10px 18px; background: linear-gradient(135deg, #10B981, #059669); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-reject { padding: 10px 18px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty { padding: 60px 20px; text-align: center; background: #141414; border-radius: 16px; color: #9CA3AF; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .empty-sub { font-size: 13px; }
      `}</style>
    </div>
  )
}

export default AdminPending

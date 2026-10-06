import { useEffect, useState } from 'react'
import adminApi from './adminApi'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    adminApi.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (user, newStatus) => {
    if (!window.confirm(`Badilisha status ya ${user.name} kuwa ${newStatus}?`)) return
    try {
      await adminApi.put(`/admin/users/${user.id}`, { ...user, status: newStatus })
      load()
    } catch (err) {
      alert('Imeshindwa kubadilisha status')
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Futa mtumiaji ${user.name}?`)) return
    try {
      await adminApi.delete(`/admin/users/${user.id}`)
      load()
    } catch (err) {
      alert('Imeshindwa kufuta')
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  )

  return (
    <div className="admin-users">
      <h1 className="page-title">Watumiaji</h1>
      <p className="page-sub">Watumiaji wote kwenye platform</p>

      <input
        type="text"
        placeholder="Tafuta mtumiaji kwa jina, email, au simu..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <div className="empty">Inapakia...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Hakuna watumiaji</div>
      ) : (
        <div className="users-list">
          {filtered.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
              <div className="user-main">
                <div className="user-name">
                  {u.name}
                  <span className={`user-role role-${u.role}`}>{u.role}</span>
                </div>
                <div className="user-sub">
                  {u.email || 'Hakuna email'} · {u.phone || 'Hakuna simu'}
                </div>
                {u.shop_name && (
                  <div className="user-shop">🏪 {u.shop_name}</div>
                )}
              </div>
              <div className="user-actions">
                <span className={`user-status status-${u.status}`}>{u.status}</span>
                <div className="action-btns">
                  {u.status !== 'active' && (
                    <button onClick={() => handleStatusChange(u, 'active')} className="btn-sm approve">✓</button>
                  )}
                  {u.status !== 'suspended' && (
                    <button onClick={() => handleStatusChange(u, 'suspended')} className="btn-sm suspend">✕</button>
                  )}
                  <button onClick={() => handleDelete(u)} className="btn-sm delete">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-users { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
        .search-input { width: 100%; padding: 14px; background: #141414; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: #fff; font-size: 14px; outline: none; margin-bottom: 20px; box-sizing: border-box; }
        .search-input:focus { border-color: #F97316; }
        .users-list { display: flex; flex-direction: column; gap: 8px; }
        .user-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .user-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .user-main { flex: 1; min-width: 0; }
        .user-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; display: flex; align-items: center; gap: 8px; }
        .user-role { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
        .role-owner { background: rgba(249,115,22,0.15); color: #FDBA74; }
        .role-cashier { background: rgba(59,130,246,0.15); color: #93C5FD; }
        .role-manager { background: rgba(168,85,247,0.15); color: #D8B4FE; }
        .user-sub { font-size: 12px; color: #9CA3AF; }
        .user-shop { font-size: 11px; color: #71717a; margin-top: 2px; }
        .user-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .user-status { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
        .status-active { background: rgba(16,185,129,0.15); color: #86EFAC; }
        .status-pending { background: rgba(251,191,36,0.15); color: #FCD34D; }
        .status-suspended { background: rgba(239,68,68,0.15); color: #FCA5A5; }
        .action-btns { display: flex; gap: 4px; }
        .btn-sm { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; }
        .btn-sm.approve { background: rgba(16,185,129,0.15); color: #86EFAC; }
        .btn-sm.suspend { background: rgba(239,68,68,0.15); color: #FCA5A5; }
        .btn-sm.delete { background: rgba(255,255,255,0.05); color: #9CA3AF; }
        .empty { padding: 40px 20px; text-align: center; background: #141414; border-radius: 16px; color: #9CA3AF; font-size: 13px; }
      `}</style>
    </div>
  )
}

export default AdminUsers

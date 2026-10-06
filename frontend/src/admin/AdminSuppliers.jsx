import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminApi from './adminApi'

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminApi.get('/admin/suppliers')
      .then(r => setSuppliers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search) ||
    (s.region || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (supplier) => {
    setEditing({ ...supplier })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.put(`/admin/suppliers/${editing.id}`, {
        name: editing.name,
        phone: editing.phone,
        address: editing.address,
        region: editing.region,
        district: editing.district,
      })
      setEditing(null)
      load()
    } catch (err) {
      alert('Imeshindwa kuhifadhi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-suppliers">
      <h1 className="page-title">Wasambazaji</h1>
      <p className="page-sub">Wasambazaji wote kwenye platform</p>

      <input
        type="text"
        placeholder="Tafuta supplier kwa jina, simu, au mkoa..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <div className="empty">Inapakia...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Hakuna wasambazaji</div>
      ) : (
        <div className="suppliers-list">
          {filtered.map(s => (
            <div key={s.id} className="supplier-card">
              <div className="supplier-avatar">{s.name.charAt(0).toUpperCase()}</div>
              <div className="supplier-main">
                <div className="supplier-name">{s.name}</div>
                <div className="supplier-sub">
                  {s.phone || 'Hakuna simu'}
                  {s.address ? ` · ${s.address}` : ''}
                </div>
                <div className="supplier-location">
                  {s.region && <span>📍 {s.region}{s.district ? `, ${s.district}` : ''}</span>}
                  {s.shop_name && <span className="supplier-shop">🏪 {s.shop_name}</span>}
                </div>
              </div>
              <div className="supplier-actions">
                <button className="btn-edit" onClick={() => handleEdit(s)}>✎ Hariri</button>
                <Link to={`/admin/suppliers/${s.id}`} className="btn-view">Bidhaa →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Hariri Supplier</div>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className="modal-body">
              <label className="form-label">Jina</label>
              <input
                type="text"
                value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="form-input"
              />

              <label className="form-label">Simu</label>
              <input
                type="tel"
                value={editing.phone || ''}
                onChange={e => setEditing({ ...editing, phone: e.target.value })}
                className="form-input"
              />

              <label className="form-label">Anwani</label>
              <input
                type="text"
                value={editing.address || ''}
                onChange={e => setEditing({ ...editing, address: e.target.value })}
                className="form-input"
              />

              <div className="form-row">
                <div>
                  <label className="form-label">Mkoa</label>
                  <input
                    type="text"
                    value={editing.region || ''}
                    onChange={e => setEditing({ ...editing, region: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Wilaya</label>
                  <input
                    type="text"
                    value={editing.district || ''}
                    onChange={e => setEditing({ ...editing, district: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'INAHIFADHI...' : 'HIFADHI'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-suppliers { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
        .search-input { width: 100%; padding: 14px; background: #141414; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: #fff; font-size: 14px; outline: none; margin-bottom: 20px; box-sizing: border-box; }
        .search-input:focus { border-color: #F97316; }
        .suppliers-list { display: flex; flex-direction: column; gap: 8px; }
        .supplier-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: #141414; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .supplier-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .supplier-main { flex: 1; min-width: 0; }
        .supplier-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .supplier-sub { font-size: 12px; color: #9CA3AF; }
        .supplier-location { font-size: 11px; color: #71717a; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap; }
        .supplier-shop { color: #FDBA74; }
        .supplier-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .btn-edit { padding: 8px 14px; background: rgba(59,130,246,0.15); color: #93C5FD; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-view { padding: 8px 14px; background: rgba(249,115,22,0.15); color: #FDBA74; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; }
        .empty { padding: 40px 20px; text-align: center; background: #141414; border-radius: 16px; color: #9CA3AF; font-size: 13px; }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { background: #141414; border-radius: 20px; width: 100%; max-width: 480px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .modal-title { font-size: 17px; font-weight: 700; color: #fff; }
        .modal-close { background: rgba(255,255,255,0.08); border: none; width: 32px; height: 32px; border-radius: 10px; color: #9CA3AF; cursor: pointer; }
        .modal-body { padding: 20px 22px 24px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; margin-top: 12px; }
        .form-label:first-child { margin-top: 0; }
        .form-input { width: 100%; padding: 13px 14px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: #F97316; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn-save { width: 100%; padding: 14px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 20px; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default AdminSuppliers

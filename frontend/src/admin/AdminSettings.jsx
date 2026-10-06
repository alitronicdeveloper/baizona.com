import { useEffect, useState } from 'react'
import adminApi from './adminApi'

function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: '',
    support_phone: '',
    support_whatsapp: '',
    support_email: '',
    trial_days: '',
    default_shop_type: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = () => {
    adminApi.get('/settings')
      .then(r => setSettings(prev => ({ ...prev, ...r.data })))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const update = (key, value) => {
    setSettings({ ...settings, [key]: value })
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.put('/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Imeshindwa kuhifadhi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="empty">Inapakia...</div>

  return (
    <div className="admin-settings">
      <h1 className="page-title">Mipangilio</h1>
      <p className="page-sub">Mipangilio ya platform</p>

      <form onSubmit={handleSubmit} className="settings-form">

        {/* Jina la Platform */}
        <div className="settings-section">
          <div className="settings-section-title">JINA LA PLATFORM</div>
          <div className="form-group">
            <label className="form-label">Jina</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={e => update('platform_name', e.target.value)}
              className="form-input"
              placeholder="Baizona"
            />
          </div>
        </div>

        {/* Msaada */}
        <div className="settings-section">
          <div className="settings-section-title">MSAADA (SUPPORT)</div>
          <div className="form-group">
            <label className="form-label">Simu ya Msaada</label>
            <input
              type="tel"
              value={settings.support_phone}
              onChange={e => update('support_phone', e.target.value)}
              className="form-input"
              placeholder="0712345678"
            />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp ya Msaada</label>
            <input
              type="tel"
              value={settings.support_whatsapp}
              onChange={e => update('support_whatsapp', e.target.value)}
              className="form-input"
              placeholder="0712345678"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email ya Msaada</label>
            <input
              type="email"
              value={settings.support_email}
              onChange={e => update('support_email', e.target.value)}
              className="form-input"
              placeholder="support@baizona.com"
            />
          </div>
        </div>

        {/* Trial */}
        <div className="settings-section">
          <div className="settings-section-title">TRIAL</div>
          <div className="form-group">
            <label className="form-label">Siku za Trial</label>
            <input
              type="number"
              value={settings.trial_days}
              onChange={e => update('trial_days', e.target.value)}
              className="form-input"
              placeholder="14"
            />
          </div>
        </div>

        {/* Aina ya Duka */}
        <div className="settings-section">
          <div className="settings-section-title">AINA YA DUKA</div>
          <div className="form-group">
            <label className="form-label">Aina ya Duka la Msingi</label>
            <select
              value={settings.default_shop_type}
              onChange={e => update('default_shop_type', e.target.value)}
              className="form-input"
            >
              <option value="hardware">🔨 Hardware</option>
              <option value="general">🏪 Duka la Jumla</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-save" disabled={saving}>
          {saving ? 'INAHIFADHI...' : saved ? '✓ IMEHIFADHIWA' : 'HIFADHI MIPANGILIO'}
        </button>
      </form>

      <style>{`
        .admin-settings { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 24px; }
        .settings-form { display: flex; flex-direction: column; gap: 20px; max-width: 600px; }
        .settings-section { background: #141414; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .settings-section-title { font-size: 11px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .form-group { margin-bottom: 14px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 13px 14px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: #F97316; }
        .form-input::placeholder { color: #52525b; }
        .btn-save { padding: 16px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; border: none; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(249,115,22,0.35); transition: all 0.2s; }
        .btn-save:active:not(:disabled) { transform: scale(0.98); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .empty { padding: 40px; text-align: center; color: #9CA3AF; }
      `}</style>
    </div>
  )
}

export default AdminSettings

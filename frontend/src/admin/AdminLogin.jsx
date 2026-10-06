import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, saveAdminToken } from './adminApi'

function AdminLogin() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await adminLogin({ phone, pin })
      saveAdminToken(result.token, {
        id: result.admin_id,
        name: result.name,
        phone: result.phone,
      })
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data || 'Simu au PIN si sahihi')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-card">
        <div className="login-logo">B</div>
        <h1 className="login-title">Baizona Admin</h1>
        <p className="login-sub">Super Admin Panel</p>

        <form onSubmit={handleSubmit}>
          <label className="form-label">Simu</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="form-input"
            placeholder="0712345678"
            inputMode="tel"
            required
            autoFocus
          />

          <label className="form-label">PIN</label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="form-input"
            placeholder="••••"
            inputMode="numeric"
            maxLength={6}
            required
          />

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'INAINGIA...' : 'INGIA'}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login { min-height: 100vh; background: #0A0A0A; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { width: 100%; max-width: 400px; background: #141414; border-radius: 24px; padding: 32px 24px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .login-logo { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 32px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .login-title { font-size: 22px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 4px; }
        .login-sub { font-size: 13px; color: #9CA3AF; text-align: center; margin-bottom: 28px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 14px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #fff; font-size: 15px; outline: none; margin-bottom: 16px; box-sizing: border-box; }
        .form-input:focus { border-color: #F97316; }
        .form-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; padding: 10px 12px; border-radius: 10px; font-size: 12px; margin-bottom: 12px; font-weight: 600; }
        .btn-primary { width: 100%; padding: 16px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; border: none; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(249,115,22,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default AdminLogin

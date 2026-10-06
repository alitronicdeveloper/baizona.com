import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    shop_name: '',
    shop_type: 'hardware',
    owner_name: '',
    phone: '',
    whatsapp: '',
    address: '',
    region: '',
    district: '',
    email: '',
    password: '',
  })

  const update = (key, value) => setForm({ ...form, [key]: value })

  const validateStep1 = () => {
    if (!form.shop_name.trim()) return 'Jina la duka linahitajika'
    if (!form.owner_name.trim()) return 'Jina lako linahitajika'
    if (!form.phone.trim()) return 'Namba ya simu inahitajika'
    return null
  }

  const validateStep2 = () => {
    if (!form.email.trim()) return 'Email inahitajika'
    if (!form.password || form.password.length < 6) return 'Password iwe angalau herufi 6'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }

    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        whatsapp: form.whatsapp || form.phone,
      }
      await axios.post('http://localhost:8081/api/register', payload)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data || 'Usajili umeshindwa')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="register-screen">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Usajili Umefanikiwa!</h1>
          <p className="success-desc">
            Duka lako limesajiliwa. Bado tunahitaji kuthibitisha akaunti yako.
            Tutawasiliana nawe kwa WhatsApp ({form.whatsapp || form.phone}) hivi karibuni.
          </p>
          <Link to="/login" className="success-btn">Rudi kwenye Login</Link>
        </div>
        <style>{`
          .register-screen { min-height: 100vh; background: #0A0A0A; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .success-card { max-width: 420px; width: 100%; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 28px; text-align: center; }
          .success-icon { font-size: 64px; margin-bottom: 16px; }
          .success-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px; }
          .success-desc { font-size: 14px; color: #9CA3AF; line-height: 1.6; margin-bottom: 28px; }
          .success-btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="register-screen">
      <div className="bg-gradient"></div>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="register-container">
        <div className="logo-section">
          <div className="logo-box">B</div>
        </div>

        <div className="title-section">
          <h1 className="title-main">Sajili Duka Lako</h1>
          <p className="title-sub">Hatua {step} kati ya 2</p>
        </div>

        {/* Progress */}
        <div className="progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <>
              <div className="input-group">
                <label className="input-label">Jina la Duka *</label>
                <input
                  type="text"
                  value={form.shop_name}
                  onChange={e => update('shop_name', e.target.value)}
                  className="input-field"
                  placeholder="Mfano: Alitronic Hardware"
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Aina ya Duka *</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${form.shop_type === 'hardware' ? 'active' : ''}`}
                    onClick={() => update('shop_type', 'hardware')}
                  >
                    🔨 Hardware
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${form.shop_type === 'general' ? 'active' : ''}`}
                    onClick={() => update('shop_type', 'general')}
                  >
                    🏪 Duka la Jumla
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Jina Lako (Mmiliki) *</label>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={e => update('owner_name', e.target.value)}
                  className="input-field"
                  placeholder="Mfano: Alitronic"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Namba ya Simu *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="input-field"
                  placeholder="0712345678"
                  inputMode="tel"
                />
              </div>

              <div className="input-group">
                <label className="input-label">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={e => update('whatsapp', e.target.value)}
                  className="input-field"
                  placeholder="Kama ni tofauti na simu"
                  inputMode="tel"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Anwani</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                  className="input-field"
                  placeholder="Mfano: Kariakoo"
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Mkoa (Region)</label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={e => update('region', e.target.value)}
                    className="input-field"
                    placeholder="Mfano: Dar es Salaam"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Wilaya (District)</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={e => update('district', e.target.value)}
                    className="input-field"
                    placeholder="Mfano: Ilala"
                  />
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="button" className="btn-primary" onClick={handleNext}>
                ENDELEA →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  className="input-field"
                  placeholder="email@mfano.com"
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field"
                  placeholder="Angalau herufi 6"
                />
              </div>

              {error && <div className="error-box">{error}</div>}

              <div className="btn-row">
                <button type="button" className="btn-secondary" onClick={() => { setStep(1); setError('') }}>
                  ← Rudi
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'INASAJILI...' : 'JISAJILI'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="login-link">
          Tayari una akaunti? <Link to="/login">Ingia</Link>
        </div>
      </div>

      <style>{`
        .register-screen { min-height: 100vh; background: #050505; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        .bg-gradient { position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%); }
        .bg-orbs { position: absolute; inset: 0; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; }
        .orb-1 { width: 400px; height: 400px; background: rgba(249, 115, 22, 0.4); top: -100px; left: -100px; }
        .orb-2 { width: 350px; height: 350px; background: rgba(99, 102, 241, 0.35); bottom: -100px; right: -100px; }
        .register-container { position: relative; width: 100%; max-width: 440px; background: rgba(20, 20, 25, 0.75); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; padding: 36px 28px 28px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); }
        .logo-section { display: flex; justify-content: center; margin-bottom: 20px; }
        .logo-box { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #fff; box-shadow: 0 12px 32px rgba(249, 115, 22, 0.45); }
        .title-section { text-align: center; margin-bottom: 20px; }
        .title-main { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .title-sub { font-size: 12px; color: #71717a; }
        .progress { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px; }
        .progress-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
        .progress-dot.active { background: #F97316; box-shadow: 0 0 12px rgba(249, 115, 22, 0.6); }
        .progress-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); transition: all 0.3s; }
        .progress-line.active { background: #F97316; }
        .register-form { display: flex; flex-direction: column; gap: 14px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .input-label { font-size: 11px; font-weight: 700; color: #a1a1aa; letter-spacing: 0.5px; text-transform: uppercase; }
        .input-field { width: 100%; padding: 14px 16px; background: rgba(10, 10, 12, 0.6); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; color: #fff; font-size: 14px; font-weight: 500; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .input-field:focus { border-color: #F97316; background: rgba(10,10,12,0.85); box-shadow: 0 0 0 4px rgba(249,115,22,0.12); }
        .input-field::placeholder { color: #3f3f46; }
        .type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .type-btn { padding: 14px; background: rgba(10,10,12,0.6); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; color: #a1a1aa; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .type-btn.active { border-color: #F97316; background: rgba(249,115,22,0.12); color: #F97316; }
        .error-box { padding: 12px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; color: #fca5a5; font-size: 13px; font-weight: 600; text-align: center; }
        .btn-primary { width: 100%; padding: 16px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; border: none; border-radius: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 8px 24px rgba(249,115,22,0.35); transition: all 0.2s; }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-row { display: flex; gap: 8px; }
        .btn-secondary { flex: 1; padding: 16px; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-secondary:active { transform: scale(0.98); }
        .btn-row .btn-primary { flex: 2; }
        .login-link { text-align: center; margin-top: 20px; font-size: 13px; color: #71717a; }
        .login-link a { color: #F97316; text-decoration: none; font-weight: 700; }
      `}</style>
    </div>
  )
}

export default Register

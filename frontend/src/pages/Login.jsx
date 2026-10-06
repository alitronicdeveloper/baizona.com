import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useUserAuth } from '../context/UserAuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const { login, isLoggedIn } = useUserAuth()

  useEffect(() => {
    setMounted(true)
    if (isLoggedIn) navigate('/')
  }, [isLoggedIn, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8081/api/login', { email, password })
      login(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data || 'Email au password si sahihi')
      setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="login-screen">
      <div className="bg-gradient"></div>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="bg-grid"></div>

      <div className={`login-container ${mounted ? 'mounted' : ''} ${shake ? 'shake' : ''}`}>
        <div className="logo-section">
          <div className="logo-glow"></div>
          <div className="logo-box">
            <span className="logo-letter">B</span>
          </div>
        </div>

        <div className="title-section">
          <h1 className="title-main">Baizona</h1>
          <p className="title-sub">Ingia kwenye duka lako</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="email@mfano.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                <span>INAINGIA...</span>
              </span>
            ) : (
              <span className="btn-content">
                <span>INGIA</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        </form>

        <div className="register-link">
          Hauna akaunti? <Link to="/register">Jisajili</Link>
        </div>

        <div className="footer-info">
          <span className="footer-dot"></span>
          <span>Baizona v1.0</span>
          <span className="footer-dot"></span>
          <span>Phase 1</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .login-screen {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(25, 32, 167, 0.1) 0%, transparent 70%);
        }

        .bg-orbs { position: absolute; inset: 0; overflow: hidden; }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 { width: 400px; height: 400px; background: rgba(249, 115, 22, 0.4); top: -100px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 350px; height: 350px; background: rgba(99, 102, 241, 0.35); bottom: -100px; right: -100px; animation-delay: -7s; }
        .orb-3 { width: 300px; height: 300px; background: rgba(25, 32, 167, 0.4); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -14s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.95); }
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
        }

        .login-container {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(20, 20, 25, 0.7);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px 32px 32px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-container.mounted { opacity: 1; transform: translateY(0) scale(1); }
        .login-container.shake { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97); }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }

        .logo-section { position: relative; display: flex; justify-content: center; margin-bottom: 24px; }

        .logo-glow {
          position: absolute;
          width: 100px; height: 100px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, transparent 70%);
          filter: blur(20px);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
        }

        .logo-box {
          position: relative;
          width: 80px; height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 32px rgba(249, 115, 22, 0.45);
        }

        .logo-letter {
          font-size: 42px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -2px;
        }

        .title-section { text-align: center; margin-bottom: 28px; }

        .title-main {
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.8px;
          margin-bottom: 6px;
          background: linear-gradient(180deg, #fff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-sub { font-size: 13px; color: #71717a; font-weight: 500; }

        .login-form { display: flex; flex-direction: column; gap: 18px; }

        .input-group { display: flex; flex-direction: column; gap: 8px; }

        .input-label {
          font-size: 11px;
          font-weight: 700;
          color: #a1a1aa;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          background: rgba(10, 10, 12, 0.6);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          transition: all 0.25s;
        }

        .input-wrap:focus-within {
          border-color: #F97316;
          background: rgba(10, 10, 12, 0.8);
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          color: #52525b;
          transition: color 0.2s;
        }

        .input-wrap:focus-within .input-icon { color: #F97316; }

        .input-field {
          flex: 1;
          padding: 16px 16px 16px 0;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          outline: none;
          min-width: 0;
        }

        .input-field::placeholder { color: #3f3f46; font-weight: 500; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 600;
        }

        .login-btn {
          width: 100%;
          padding: 18px;
          margin-top: 4px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.5px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          transition: all 0.25s;
        }

        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 12px; }

        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .register-link {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #71717a;
        }

        .register-link a {
          color: #F97316;
          text-decoration: none;
          font-weight: 700;
        }

        .footer-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
          font-size: 11px;
          color: #52525b;
          font-weight: 600;
        }

        .footer-dot { width: 3px; height: 3px; border-radius: 50%; background: #3f3f46; }
      `}</style>
    </div>
  )
}

export default Login

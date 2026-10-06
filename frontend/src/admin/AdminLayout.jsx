import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getAdminData, clearAdminAuth } from './adminApi'

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/shops', label: 'Maduka', icon: '🏪' },
  { to: '/admin/pending', label: 'Pending', icon: '⏳' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/data', label: 'Data', icon: '📊' },
  { to: '/admin/suppliers', label: 'Wasambazaji', icon: '🏭' },
  { to: '/admin/users', label: 'Watumiaji', icon: '👥' },
  { to: '/admin/settings', label: 'Mipangilio', icon: '⚙️' },
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const admin = getAdminData()

  const handleLogout = () => {
    if (!window.confirm('Una uhakika unataka kutoka?')) return
    clearAdminAuth()
    navigate('/admin/login')
  }

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">B</div>
          <div>
            <div className="admin-logo-text">Baizona</div>
            <div className="admin-logo-sub">Super Admin</div>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-profile-info">
              <div className="admin-profile-name">{admin?.name || 'Admin'}</div>
              <div className="admin-profile-role">{admin?.phone || ''}</div>
            </div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>Toka</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="admin-header-title">Super Admin Panel</div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-app { display: flex; min-height: 100vh; background: #0A0A0A; }
        .admin-sidebar { width: 240px; background: #0F0F0F; border-right: 1px solid rgba(255,255,255,0.06); padding: 20px 12px; position: fixed; top: 0; bottom: 0; left: 0; display: flex; flex-direction: column; z-index: 50; transition: transform 0.28s; }
        .admin-sidebar-header { display: flex; align-items: center; gap: 12px; padding: 8px 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px; }
        .admin-logo { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .admin-logo-text { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 1px; }
        .admin-logo-sub { font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .admin-nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; text-decoration: none; color: #9CA3AF; font-weight: 500; font-size: 14px; transition: all 0.15s; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.04); color: #fff; }
        .admin-nav-link.active { background: rgba(249,115,22,0.12); color: #F97316; font-weight: 700; }
        .admin-nav-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
        .admin-nav-label { flex: 1; }
        .admin-sidebar-footer { padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
        .admin-profile { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 8px; }
        .admin-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #F97316, #EA580C); color: #fff; font-size: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .admin-profile-info { min-width: 0; flex: 1; }
        .admin-profile-name { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-profile-role { font-size: 11px; color: #9CA3AF; }
        .admin-logout { width: 100%; padding: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; color: #FCA5A5; font-size: 12px; font-weight: 700; cursor: pointer; }
        .admin-main { flex: 1; margin-left: 240px; min-width: 0; display: flex; flex-direction: column; }
        .admin-header { background: rgba(15,15,15,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 14px 24px; display: flex; align-items: center; position: sticky; top: 0; z-index: 30; }
        .admin-menu-toggle { background: rgba(255,255,255,0.05); border: none; width: 36px; height: 36px; border-radius: 10px; color: #fff; font-size: 18px; cursor: pointer; display: none; margin-right: 12px; }
        .admin-header-title { font-size: 16px; font-weight: 700; color: #fff; }
        .admin-content { padding: 24px; flex: 1; }
        .admin-overlay { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .admin-menu-toggle { display: flex; align-items: center; justify-content: center; }
          .admin-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; }
          .admin-content { padding: 16px; }
        }
      `}</style>
    </div>
  )
}

export default AdminLayout

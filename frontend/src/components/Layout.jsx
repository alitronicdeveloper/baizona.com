import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import SyncStatus from './SyncStatus'

// Sidebar ya PC
const menuItems = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/uza', label: 'Uza', icon: '🛒' },
  { to: '/bidhaa', label: 'Bidhaa', icon: '📦' },
  { to: '/wateja', label: 'Wateja', icon: '👥' },
  { to: '/madeni', label: 'Madeni', icon: '💸' },
  { to: '/mauzo', label: 'Mauzo', icon: '📊' },
  { to: '/zaidi', label: 'Menu', icon: '☰' },
]

// Bottom nav ya simu — tabs 4
const mobileTabs = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/uza', label: 'Uza', icon: 'cart' },
  { to: '/zaidi', label: 'Menu', icon: 'menu' },
  { to: '/mauzo', label: 'Mauzo', icon: 'chart' },
]

function TabIcon({ name, active }) {
  const stroke = active ? '#F97316' : '#9CA3AF'
  const strokeWidth = active ? 2.2 : 1.8

  if (name === 'home') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10L12 3L21 10V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'users') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'cart') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="21" r="1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="21" r="1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'menu') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <line x1="3" y1="6" x2="21" y2="6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'chart') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V14" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'credit') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 10H22" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return null
}

// Menu ya drawer — vitu vingine
const drawerItems = [
  { to: '/uza', label: 'Uza Bidhaa', icon: '🛒', color: 'var(--primary)', bg: '#eff6ff' },
  { to: '/bidhaa', label: 'Bidhaa', icon: '📦', color: 'var(--success)', bg: '#f0fdf4' },
  { to: '/mauzo', label: 'Mauzo', icon: '📊', color: 'var(--purple)', bg: '#faf5ff' },
  { to: '/madeni', label: 'Madeni', icon: '💸', color: 'var(--danger)', bg: '#fef2f2' },
  { to: '/settings', label: 'Mipangilio', icon: '⚙️', color: 'var(--gray-700)', bg: 'var(--gray-100)' },
  { to: '/profile', label: 'Profile', icon: '👤', color: 'var(--gray-700)', bg: 'var(--gray-100)' },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  const currentPage = menuItems.find(m =>
    m.end ? location.pathname === m.to : location.pathname.startsWith(m.to)
  )?.label || 'Baizona'

  const closeAll = () => {
    setSidebarOpen(false)
    setDrawerOpen(false)
    setProfileOpen(false)
  }

  return (
    <div className="app-container">
      {/* Overlays */}
      {(sidebarOpen || drawerOpen) && (
        <div onClick={closeAll} className="sidebar-overlay" />
      )}

      {/* Sidebar (PC) */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-box">B</div>
          <div>
            <div className="logo-text">Baizona</div>
            <div className="logo-sub">Hardware System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              <span className="sidebar-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-card">
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>⚡</div>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>Baizona v1.0</div>
            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Phase 1</div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside className={`mobile-drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-header">
          <div className="logo-box">B</div>
          <div>
            <div className="logo-text">Baizona</div>
            <div className="logo-sub">Hardware System</div>
          </div>
          <button className="drawer-close" onClick={closeAll}>✕</button>
        </div>

        <nav className="drawer-nav">
          {drawerItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeAll}
              className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}
            >
              <div className="drawer-icon" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <span className="drawer-label">{item.label}</span>
              <span className="drawer-arrow">→</span>
            </NavLink>
          ))}
        </nav>

        <div className="drawer-footer">
          <div style={{ fontSize: '11px', color: 'var(--gray-500)', textAlign: 'center' }}>
            Baizona v1.0 • Phase 1
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle-pc"
              aria-label="Menu"
            >
              ☰
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="menu-toggle-mobile"
              aria-label="Menu"
            >
              ☰
            </button>
            <div>
              <h2 className="page-title">{currentPage}</h2>
              <div className="page-date">
                {new Date().toLocaleDateString('sw-TZ', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SyncStatus />
            <div className="profile-wrapper">
              <button
                className="avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile"
              >
                A
              </button>

              {profileOpen && (
                <>
                  <div className="profile-overlay" onClick={() => setProfileOpen(false)} />
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <div className="profile-avatar-lg">A</div>
                      <div>
                        <div className="profile-name">Duka Langu</div>
                        <div className="profile-role">Mmiliki</div>
                      </div>
                    </div>

                    <div className="profile-divider" />

                    <NavLink to="/settings" className="profile-item" onClick={closeAll}>
                      <span className="profile-item-icon">🏪</span>
                      <span>Mipangilio ya Duka</span>
                    </NavLink>

                    <NavLink to="/profile" className="profile-item" onClick={closeAll}>
                      <span className="profile-item-icon">👤</span>
                      <span>Profile Yangu</span>
                    </NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="main-content fade-in">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (Mobile) — tabs 4 */}
      <nav className="bottom-nav">
        {mobileTabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div className="bottom-icon">
                  <TabIcon name={tab.icon} active={isActive} />
                </div>
                <div className="bottom-label">{tab.label}</div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* ===================== SIDEBAR (PC) ===================== */
        .sidebar {
          width: 256px;
          background: #fff;
          border-right: 1px solid var(--gray-200);
          padding: 20px 16px;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 8px 24px;
          border-bottom: 1px solid var(--gray-100);
          margin-bottom: 16px;
        }

        .logo-box {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 18px; font-weight: 800;
          flex-shrink: 0;
        }

        .logo-text {
          font-weight: 700; font-size: 16px;
          color: var(--gray-900); letter-spacing: -0.3px;
        }

        .logo-sub {
          font-size: 11px; color: var(--gray-500); margin-top: 1px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          text-decoration: none; color: var(--gray-600);
          font-weight: 500; font-size: 14px;
          transition: var(--transition);
          position: relative;
        }

        .sidebar-link:hover {
          background: var(--gray-50);
          color: var(--gray-900);
        }

        .sidebar-link.active {
          background: var(--border-light);
          color: var(--text);
          font-weight: 600;
        }

        .sidebar-link.active .sidebar-icon {
          color: var(--accent);
        }

        .sidebar-icon {
          font-size: 18px; width: 24px;
          text-align: center; flex-shrink: 0;
        }

        .sidebar-label { flex: 1; }

        .sidebar-indicator {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent); opacity: 0;
          transition: var(--transition);
        }

        .sidebar-link.active .sidebar-indicator {
          opacity: 1;
        }

        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid var(--gray-100);
        }

        .footer-card {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 12px; padding: 14px; text-align: center;
        }

        /* ===================== MOBILE DRAWER ===================== */
        .mobile-drawer {
          display: none;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          width: 300px;
          background: #fff;
          z-index: 60;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }

        .mobile-drawer.drawer-open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--gray-100);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .drawer-header .logo-box {
          background: rgba(255,255,255,0.2);
          box-shadow: none;
        }

        .drawer-header .logo-text { color: #fff; }
        .drawer-header .logo-sub { color: rgba(255,255,255,0.8); }

        .drawer-close {
          margin-left: auto;
          background: rgba(255,255,255,0.2);
          border: none;
          width: 32px; height: 32px;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        .drawer-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .drawer-link {
          display: flex; align-items: center; gap: 14px;
          padding: 14px;
          border-radius: 12px;
          text-decoration: none;
          color: var(--gray-700);
          font-size: 15px;
          font-weight: 500;
          transition: var(--transition);
        }

        .drawer-link:hover, .drawer-link.active {
          background: var(--gray-50);
          color: var(--primary);
        }

        .drawer-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .drawer-label { flex: 1; }

        .drawer-arrow {
          color: var(--gray-400);
          font-size: 16px;
        }

        .drawer-footer {
          padding: 16px;
          border-top: 1px solid var(--gray-100);
        }

        /* ===================== MAIN WRAPPER ===================== */
        .main-wrapper {
          flex: 1;
          margin-left: 256px;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* ===================== TOP HEADER ===================== */
        .top-header {
          background: rgba(247, 247, 245, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .menu-toggle-pc {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          padding: 8px 12px;
          display: none;
          color: var(--gray-700);
          transition: var(--transition);
        }

        .menu-toggle-mobile {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          padding: 8px 12px;
          display: none;
          color: var(--gray-700);
          transition: var(--transition);
        }

        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          letter-spacing: -0.3px;
        }

        .page-date {
          font-size: 12px;
          color: var(--gray-500);
          margin-top: 2px;
        }

        /* Profile dropdown */
        .profile-wrapper { position: relative; }

        .avatar-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 15px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          cursor: pointer;
          transition: var(--transition);
          font-family: inherit;
        }

        .avatar-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .profile-overlay {
          position: fixed; inset: 0; z-index: 90;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 280px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid var(--gray-100);
          padding: 8px;
          z-index: 100;
          animation: profileSlide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top right;
        }

        @keyframes profileSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .profile-header {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
        }

        .profile-avatar-lg {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 18px;
          flex-shrink: 0;
        }

        .profile-name {
          font-weight: 700; font-size: 14px;
          color: var(--gray-900); margin-bottom: 2px;
        }

        .profile-role {
          font-size: 12px; color: var(--gray-500);
        }

        .profile-divider {
          height: 1px; background: var(--gray-100);
          margin: 6px 8px;
        }

        .profile-item {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: var(--gray-700);
          font-size: 14px; font-weight: 500;
          border: none; background: transparent;
          cursor: pointer; text-align: left;
          transition: var(--transition);
          font-family: inherit;
        }

        .profile-item:hover {
          background: var(--gray-50);
          color: var(--primary);
        }

        .profile-item-icon {
          font-size: 16px; width: 20px;
          text-align: center; flex-shrink: 0;
        }

        /* ===================== MAIN CONTENT ===================== */
        .main-content {
          padding: 0;
          max-width: 1280px;
          width: 100%;
          flex: 1;
          background: #0A0A0A;
        }

        /* ===================== BOTTOM NAV (Mobile) ===================== */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(15, 15, 15, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 -2px 12px rgba(0,0,0,0.3);
          z-index: 9999;
          padding-bottom: env(safe-area-inset-bottom);
          transform: translateZ(0);
          will-change: transform;
        }

        .bottom-tab {
          flex: 1;
          padding: 10px 4px 12px;
          text-align: center;
          text-decoration: none;
          color: #9CA3AF;
          font-weight: 500;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .bottom-tab.active {
          color: #F97316;
          font-weight: 600;
        }

        .bottom-icon {
          font-size: 22px;
          transition: transform 0.2s;
        }

        .bottom-tab.active .bottom-icon {
          transform: translateY(-2px);
        }

        .bottom-label { font-size: 11px; }

        .sidebar-overlay {
          display: none;
        }

        /* ===================== RESPONSIVE ===================== */
        @media (max-width: 768px) {
          /* Hide PC sidebar */
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.sidebar-open {
            transform: translateX(-100%);
          }

          /* Show mobile drawer */
          .mobile-drawer {
            display: flex;
          }

          /* Hide hamburger ya PC, onyesha ya mobile */
          .menu-toggle-pc {
            display: none !important;
          }

          .menu-toggle-mobile {
            display: block !important;
          }

          .sidebar-overlay {
            display: block;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(2px);
            z-index: 55;
            animation: fadeIn 0.2s ease-out;
          }

          .main-wrapper {
            margin-left: 0;
          }

          .main-content {
            padding: 8px 16px 90px;
          }

          .top-header {
            display: none !important;
          }

          .page-date { 
            display: block;
            font-size: 11px;
          }

          .bottom-nav { display: flex; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default Layout

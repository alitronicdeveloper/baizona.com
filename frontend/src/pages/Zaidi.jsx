import { Link } from 'react-router-dom'

const menuSections = [
  {
    title: 'BIASHARA',
    items: [
      { to: '/bidhaa', label: 'Bidhaa', desc: 'Usimamizi wa bidhaa', icon: 'box' },
      { to: '/wateja', label: 'Wateja', desc: 'Wateja wako', icon: 'users' },
      { to: '/madeni', label: 'Madeni', desc: 'Wanaodaiwa', icon: 'credit' },
      { to: '/amana', label: 'Amana', desc: 'Pesa za wateja dukani', icon: 'money' },
      { to: '/expenses', label: 'Gharama', desc: 'Kodi, umeme, mishahara', icon: 'money' },
    ],
  },
  {
    title: 'AKAUNTI',
    items: [
      { to: '/profile', label: 'Profile Yangu', desc: 'Jina, picha', icon: 'user' },
      { to: '/settings', label: 'Mipangilio ya Duka', desc: 'Jina, anwani, simu', icon: 'settings' },
    ],
  },
  {
    title: 'MSAADA',
    items: [
      { to: 'tel:+255712345678', label: 'Tupigie', desc: 'Msaada wa haraka', icon: 'phone', external: true },
    ],
  },
]

function MenuIcon({ name }) {
  const stroke = '#F97316'
  const sw = 1.8

  if (name === 'box') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22.08V12" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'users') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'credit') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2" y1="10" x2="22" y2="10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'money') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'user') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'settings') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'phone') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return null
}

function Zaidi() {
  return (
    <div className="menu-page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Menu</div>
            <div className="hero-sub">Vitu vyote vya duka lako</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="section">
            <div className="section-label">{section.title}</div>

            <div className="card-list">
              {section.items.map((item, iIdx) => {
                if (item.external) {
                  return (
                    <a
                      key={iIdx}
                      href={item.to}
                      className="card"
                    >
                      <div className="card-icon">
                        <MenuIcon name={item.icon} />
                      </div>
                      <div className="card-main">
                        <div className="card-name">{item.label}</div>
                        <div className="card-sub">{item.desc}</div>
                      </div>
                      <span className="card-arrow">→</span>
                    </a>
                  )
                }

                return (
                  <Link
                    key={iIdx}
                    to={item.to}
                    className="card"
                  >
                    <div className="card-icon">
                      <MenuIcon name={item.icon} />
                    </div>
                    <div className="card-main">
                      <div className="card-name">{item.label}</div>
                      <div className="card-sub">{item.desc}</div>
                    </div>
                    <span className="card-arrow">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* VERSION */}
        <div className="version">
          Baizona v1.0 • Phase 1
        </div>
      </div>

      <style>{`
        .menu-page {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #1920A7 0%, #3047CD 50%, #232CC9 100%);
          border-radius: 16px 16px 28px 28px;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(25, 32, 167, 0.4);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        /* CONTENT */
        .content {
          padding: 20px 0;
        }

        .section {
          margin-bottom: 20px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
          margin-bottom: 8px;
        }

        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #1A1A1A;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.15s;
        }

        .card:active {
          transform: scale(0.98);
          background: #232323;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(249, 115, 22, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-main {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
        }

        .card-arrow {
          color: #6B7280;
          font-size: 16px;
          flex-shrink: 0;
        }

        /* VERSION */
        .version {
          text-align: center;
          font-size: 11px;
          color: #4B5563;
          padding: 20px;
        }
      `}</style>
    </div>
  )
}

export default Zaidi

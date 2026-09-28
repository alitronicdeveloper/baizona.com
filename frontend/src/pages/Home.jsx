import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTodayStats, getAllProducts, getAllSalesWithFetch } from '../db/operations'

function Home() {
  const [today, setToday] = useState({ total_sales: 0, total_profit: 0, total_count: 0 })
  const [lowStock, setLowStock] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [userName, setUserName] = useState('Alitronic')
  const [showMenu, setShowMenu] = useState(false)

  const load = async () => {
    const stats = await getTodayStats()
    setToday(stats)

    const products = await getAllProducts()
    setLowStock(products.filter(p => Number(p.stock) <= Number(p.reorder_level)).slice(0, 3))

    const sales = await getAllSalesWithFetch()
    setRecentSales(sales.slice(0, 3))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const formatDate = () => {
    return new Date().toLocaleDateString('sw-TZ', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  return (
    <div className="home">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Habari, {userName}!</div>
            <div className="hero-sub">{formatDate()}</div>
          </div>
          <button className="hero-profile" onClick={() => setShowMenu(!showMenu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="hero-label">MAUZO YA LEO</div>

        <div className="hero-value-row">
          <span className="hero-value">{formatTZS(today.total_sales)}</span>
          <span className="hero-count">{today.total_count} mauzo</span>
        </div>

        <div className="hero-actions">
          <Link to="/uza" className="hero-action hero-action-primary">
            <span className="hero-action-plus">+</span>
            <span>Uza</span>
          </Link>
          <Link to="/bidhaa" className="hero-action hero-action-secondary">
            <span className="hero-action-plus">+</span>
            <span>Bidhaa</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="home-content">

        {lowStock.length > 0 && (
          <>
            <div className="section-header">
              <div className="section-label">STOCK INAYOHITAJI UANGALIZI</div>
              <Link to="/bidhaa" className="section-link">Ona →</Link>
            </div>

            <div className="card-list">
              {lowStock.map(p => (
                <div key={p.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">{p.name}</div>
                    <div className="card-sub">{p.category || 'Bila kundi'}</div>
                  </div>
                  <div className="card-value card-value-warn">
                    {p.stock} {p.unit}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="section-header">
          <div className="section-label">MZUNGUKO WA KARIBUNI</div>
          <Link to="/mauzo" className="section-link">Ona →</Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="empty">Hakuna mauzo bado</div>
        ) : (
          <div className="card-list">
            {recentSales.map(s => {
              const isDeni = s.payment_method === 'credit'
              const paymentLabel = s.payment_method === 'cash' ? 'Taslimu' :
                                   s.payment_method === 'mpesa' ? 'M-Pesa' : 'Deni'
              const itemName = s.first_item_name || 'Mauzo'
              const extraCount = (s.items_count || 0) > 1 ? ` +${s.items_count - 1}` : ''

              return (
                <Link to="/mauzo" key={s.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">
                      {itemName}{extraCount}
                    </div>
                    <div className="card-sub">
                      {new Date(s.sale_date).toLocaleDateString('sw-TZ', {
                        day: 'numeric', month: 'short'
                      })}
                      {' · '}
                      <span className={isDeni ? 'pay-deni' : 'pay-normal'}>
                        {paymentLabel}
                      </span>
                    </div>
                  </div>
                  <div className={`card-value ${isDeni ? 'card-value-deni' : ''}`}>
                    {formatTZS(s.total_amount)}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>

      {/* PROFILE MENU */}
      {showMenu && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="menu">
            <div className="menu-header">
              <div className="menu-avatar">{userName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="menu-name">{userName}</div>
                <div className="menu-role">Mmiliki</div>
              </div>
            </div>

            <div className="menu-divider" />

            <Link to="/profile" className="menu-item" onClick={() => setShowMenu(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Profile Yangu</span>
            </Link>

            <Link to="/settings" className="menu-item" onClick={() => setShowMenu(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Mipangilio ya Duka</span>
            </Link>

            <div className="menu-divider" />

            <a href="tel:+255712345678" className="menu-item" onClick={() => setShowMenu(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Tupigie</span>
            </a>
          </div>
        </>
      )}

      <style>{`
        .home {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #1920A7 0%, #3047CD 50%, #232CC9 100%);
          border-radius: 16px 16px 28px 28px;
          margin: 0;
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

        .hero::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -50px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
        }

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.2px;
          margin-bottom: 2px;
          color: #fff;
        }

        .hero-sub {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
        }

        .hero-profile {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .hero-profile:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
        }

        .hero-value-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
        }

        .hero-value {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
        }

        .hero-count {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          flex-shrink: 0;
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .hero-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.2s;
        }

        .hero-action:active {
          transform: scale(0.95);
        }

        .hero-action-primary {
          background: #fff;
          color: #1920A7;
          border-color: #fff;
        }

        .hero-action-secondary {
          flex: 1;
        }

        .hero-action-plus {
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
        }

        /* CONTENT */
        .home-content {
          padding: 16px 0 100px;
          background: #0A0A0A;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
          margin-top: 8px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
        }

        .section-link {
          font-size: 12px;
          color: #F97316;
          text-decoration: none;
          font-weight: 600;
        }

        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          background: #1A1A1A;
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.15s;
        }

        .card:active {
          transform: scale(0.98);
          background: #232323;
        }

        .card-main {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-sub {
          font-size: 11px;
          color: #9CA3AF;
        }

        .pay-deni {
          color: #EF4444;
          font-weight: 600;
        }

        .pay-normal {
          color: #9CA3AF;
        }

        .card-value {
          font-size: 14px;
          font-weight: 700;
          color: #FFFFFF;
          flex-shrink: 0;
        }

        .card-value-warn {
          color: #F97316;
          background: rgba(249, 115, 22, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .card-value-deni {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .empty {
          padding: 20px;
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
        }

        /* MENU */
        .menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          animation: fadeIn 0.15s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .menu {
          position: fixed;
          top: calc(env(safe-area-inset-top, 0px) + 70px);
          right: 18px;
          width: 240px;
          background: #1A1A1A;
          border-radius: 18px;
          padding: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          z-index: 201;
          animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top right;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
        }

        .menu-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F97316, #EA580C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
          flex-shrink: 0;
        }

        .menu-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
        }

        .menu-role {
          font-size: 11px;
          color: #9CA3AF;
        }

        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 6px 8px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
          cursor: pointer;
        }

        .menu-item:active {
          background: rgba(255, 255, 255, 0.05);
        }

        .menu-item span {
          flex: 1;
        }
      `}</style>
    </div>
  )
}

export default Home

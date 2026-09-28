import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSales, getAllCustomers, getAllExpenses } from '../db/operations'
import { db } from '../db/dexie'

function Mauzo() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [period, setPeriod] = useState('today')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [salesData, customersData, expensesData] = await Promise.all([
      getAllSales(),
      getAllCustomers(),
      getAllExpenses()
    ])

    // Pata jina la bidhaa kwa kila mauzo
    for (const s of salesData) {
      try {
        const items = await db.sale_items.where('sale_id').equals(s.local_id).toArray()
        if (items.length > 0) {
          s.first_item_name = items[0].product_name || 'Bidhaa'
          s.items_count = items.length
        } else {
          s.first_item_name = 'Mauzo'
          s.items_count = 0
        }
      } catch (e) {
        s.first_item_name = 'Mauzo'
        s.items_count = 0
      }
    }

    setSales(salesData)
    setCustomers(customersData)
    setExpenses(expensesData)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  // Filter kwa kipindi
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const filtered = sales.filter(s => {
    const saleDate = s.sale_date || ''
    if (period === 'today') return saleDate.startsWith(today)
    if (period === 'week') return saleDate >= weekAgo
    if (period === 'month') return saleDate >= monthAgo
    return true
  })

  const totalSales = filtered.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const totalProfit = filtered.reduce((sum, s) => sum + Number(s.profit || 0), 0)

  // Gharama kwa kipindi hicho
  const filteredExpenses = expenses.filter(e => {
    const expDate = e.expense_date || ''
    if (period === 'today') return expDate.startsWith(today)
    if (period === 'week') return expDate >= weekAgo
    if (period === 'month') return expDate >= monthAgo
    return true
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const netProfit = totalProfit - totalExpenses

  // Breakdown kwa njia za malipo
  const cashSales = filtered.filter(s => s.payment_method === 'cash')
  const mpesaSales = filtered.filter(s => s.payment_method === 'mpesa')
  const creditSales = filtered.filter(s => s.payment_method === 'credit')

  const cashTotal = cashSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const mpesaTotal = mpesaSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const creditTotal = creditSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)

  return (
    <div className="mauzo">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Mauzo</div>
            <div className="hero-sub">Historia ya mauzo yako</div>
          </div>
          <div className="hero-actions">
            <Link to="/uza" className="hero-uza">+ Uza</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="hero-filters">
          {[
            { id: 'today', label: 'Leo' },
            { id: 'week', label: 'Wiki' },
            { id: 'month', label: 'Mwezi' },
            { id: 'all', label: 'Zote' },
          ].map(f => (
            <button
              key={f.id}
              className={`hero-filter ${period === f.id ? 'active' : ''}`}
              onClick={() => setPeriod(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Jumla */}
        <div className="hero-value-row">
          <span className="hero-value">{formatTZS(totalSales)}</span>
          <span className="hero-count">{filtered.length} mauzo</span>
        </div>

        <div className="hero-profit">
          Faida ghafi: <strong>{formatTZS(totalProfit)}</strong>
        </div>

        <div className="hero-net">
          <div className="hero-net-row">
            <span>Gharama</span>
            <span className="hero-net-expense">-{formatTZS(totalExpenses)}</span>
          </div>
          <div className="hero-net-divider"></div>
          <div className="hero-net-row hero-net-row-final">
            <span>Faida halisi</span>
            <span className={`hero-net-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
              {formatTZS(netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* BREAKDOWN — NJIA ZA MALIPO */}
        <div className="section-header">
          <div className="section-label">NJIA ZA MALIPO</div>
        </div>

        <div className="breakdown">
          <div className="breakdown-item">
            <div className="breakdown-dot" style={{ background: '#10B981' }}></div>
            <div className="breakdown-main">
              <div className="breakdown-label">Taslimu</div>
              <div className="breakdown-count">{cashSales.length} mauzo</div>
            </div>
            <div className="breakdown-value">{formatTZS(cashTotal)}</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-dot" style={{ background: '#3B82F6' }}></div>
            <div className="breakdown-main">
              <div className="breakdown-label">M-Pesa</div>
              <div className="breakdown-count">{mpesaSales.length} mauzo</div>
            </div>
            <div className="breakdown-value">{formatTZS(mpesaTotal)}</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-dot" style={{ background: '#EF4444' }}></div>
            <div className="breakdown-main">
              <div className="breakdown-label">Deni</div>
              <div className="breakdown-count">{creditSales.length} mauzo</div>
            </div>
            <div className="breakdown-value breakdown-value-deni">{formatTZS(creditTotal)}</div>
          </div>
        </div>

        {/* MAUZO YOTE — LIST */}
        <div className="section-header">
          <div className="section-label">MAUZO YOTE</div>
        </div>

        {loading ? (
          <div className="empty">Inapakia...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📊</div>
            <div className="empty-title">Hakuna mauzo</div>
            <div className="empty-sub">Mauzo yataonekana hapa</div>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(s => {
              const isDeni = s.payment_method === 'credit'
              const paymentLabel = s.payment_method === 'cash' ? 'Taslimu' :
                                   s.payment_method === 'mpesa' ? 'M-Pesa' : 'Deni'
              const itemName = s.first_item_name || 'Mauzo'
              const extraCount = (s.items_count || 0) > 1 ? ` +${s.items_count - 1}` : ''

              return (
                <div key={s.local_id} className="card">
                  <div className="card-main">
                    <div className="card-name">
                      {itemName}{extraCount}
                    </div>
                    <div className="card-sub">
                      {new Date(s.sale_date).toLocaleDateString('sw-TZ', {
                        day: 'numeric', month: 'short'
                      })}
                      {' · '}
                      {new Date(s.sale_date).toLocaleTimeString('sw-TZ', {
                        hour: '2-digit', minute: '2-digit'
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
                </div>
              )
            })}
          </div>
        )}

      </div>

      <style>{`
        .mauzo {
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
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
          color: #fff;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }

        .hero-uza {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 14px;
          border-radius: 10px;
          background: #F97316;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .hero-uza:active {
          transform: scale(0.95);
          background: #EA580C;
        }

        /* FILTERS */
        .hero-filters {
          display: flex;
          gap: 6px;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .hero-filter {
          flex: 1;
          padding: 8px 4px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hero-filter:active {
          transform: scale(0.96);
        }

        .hero-filter.active {
          background: #fff;
          color: #1920A7;
          border-color: #fff;
        }

        /* VALUE */
        .hero-value-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 8px;
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

        .hero-profit {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          position: relative;
          z-index: 1;
          margin-bottom: 12px;
        }

        .hero-profit strong {
          color: #86EFAC;
          font-weight: 700;
        }

        .hero-net {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 14px;
          position: relative;
          z-index: 1;
        }

        .hero-net-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .hero-net-row span:first-child {
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-net-expense {
          color: #FCA5A5;
          font-weight: 700;
        }

        .hero-net-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.15);
          margin: 8px 0;
        }

        .hero-net-row-final {
          margin-bottom: 0;
        }

        .hero-net-row-final span:first-child {
          color: #fff;
          font-weight: 700;
        }

        .hero-net-value {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .hero-net-value.profit {
          color: #86EFAC;
        }

        .hero-net-value.loss {
          color: #FCA5A5;
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
          background: #0A0A0A;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
          margin-top: 8px;
          padding: 0;
        }

        .section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
        }

        /* BREAKDOWN */
        .breakdown {
          margin: 0 0 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .breakdown-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .breakdown-main {
          flex: 1;
          min-width: 0;
        }

        .breakdown-label {
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 2px;
        }

        .breakdown-count {
          font-size: 11px;
          color: #9CA3AF;
        }

        .breakdown-value {
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
          flex-shrink: 0;
        }

        .breakdown-value-deni {
          color: #EF4444;
        }

        /* CARD LIST */
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          background: #1A1A1A;
          border-radius: 16px;
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

        .card-value-deni {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* EMPTY */
        .empty {
          margin: 0;
          padding: 40px 20px;
          text-align: center;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-icon {
          font-size: 36px;
          margin-bottom: 8px;
          opacity: 0.6;
        }

        .empty-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .empty-sub {
          font-size: 12px;
          color: #9CA3AF;
        }
      `}</style>
    </div>
  )
}

export default Mauzo

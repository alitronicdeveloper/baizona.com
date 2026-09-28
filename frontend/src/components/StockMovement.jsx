import { useEffect, useState } from 'react'
import { getStockMovements } from '../db/operations'

function StockMovement({ product, onClose }) {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getStockMovements(product.local_id)
      setMovements(data)
      setLoading(false)
    }
    load()
  }, [product.local_id])

  const filtered = movements.filter(m => {
    if (filter === 'all') return true
    return m.movement_type === filter
  })

  const totalIn = movements
    .filter(m => m.movement_type === 'in')
    .reduce((sum, m) => sum + Number(m.quantity), 0)

  const totalOut = movements
    .filter(m => m.movement_type === 'out')
    .reduce((sum, m) => sum + Number(m.quantity), 0)

  const getIcon = (type) => {
    if (type === 'in') return '📥'
    if (type === 'out') return '📤'
    if (type === 'adjustment') return '⚖️'
    return '📦'
  }

  const getColor = (type) => {
    if (type === 'in') return { bg: '#dcfce7', color: '#166534', label: 'Kuingia' }
    if (type === 'out') return { bg: '#fee2e2', color: '#991b1b', label: 'Kutoka' }
    if (type === 'adjustment') return { bg: '#fef3c7', color: '#92400e', label: 'Marekebisho' }
    return { bg: '#f3f4f6', color: '#374151', label: 'Nyingine' }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{product.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px' }}>
              Historia ya Stock • {product.category || 'Bila kundi'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Stats */}
          <div className="sm-stats">
            <div className="sm-stat">
              <div className="sm-stat-label">Stock ya Sasa</div>
              <div className="sm-stat-value" style={{ color: 'var(--primary)' }}>
                {product.stock} {product.unit}
              </div>
            </div>
            <div className="sm-stat">
              <div className="sm-stat-label">📥 Zilizoingia</div>
              <div className="sm-stat-value" style={{ color: 'var(--success)' }}>
                +{totalIn}
              </div>
            </div>
            <div className="sm-stat">
              <div className="sm-stat-label">📤 Zilizotoka</div>
              <div className="sm-stat-value" style={{ color: 'var(--danger)' }}>
                -{totalOut}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="sm-filters">
            {[
              { id: 'all', label: 'Zote' },
              { id: 'in', label: '📥 Kuingia' },
              { id: 'out', label: '📤 Kutoka' },
              { id: 'adjustment', label: '⚖️ Marekebisho' },
            ].map(f => (
              <button
                key={f.id}
                className={`sm-filter ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="sm-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-500)' }}>
                Inapakia...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-500)' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>📭</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Hakuna mienendo bado
                </div>
                <div style={{ fontSize: '12px' }}>
                  Historia itaonekana hapa
                </div>
              </div>
            ) : (
              filtered.map(m => {
                const style = getColor(m.movement_type)
                return (
                  <div key={m.local_id} className="sm-item">
                    <div className="sm-icon" style={{ background: style.bg, color: style.color }}>
                      {getIcon(m.movement_type)}
                    </div>
                    <div className="sm-item-main">
                      <div className="sm-item-type" style={{ color: style.color }}>
                        {style.label}
                      </div>
                      <div className="sm-item-notes">
                        {m.notes || (m.reference_type === 'sale' ? 'Mauzo' : 'Marekebisho')}
                      </div>
                      <div className="sm-item-date">
                        {new Date(m.created_at).toLocaleString('sw-TZ', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="sm-item-qty" style={{ color: style.color }}>
                      {m.movement_type === 'in' ? '+' : m.movement_type === 'out' ? '-' : ''}
                      {m.quantity}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 20px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: slideUp 0.25s ease-out;
        }

        .modal-header {
          display: flex; justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          border-bottom: 1px solid var(--gray-100);
          position: sticky; top: 0; background: #fff;
          border-radius: 20px 20px 0 0; z-index: 1;
        }

        .modal-title {
          font-size: 18px; font-weight: 700;
          color: var(--gray-900);
        }

        .modal-close {
          background: var(--gray-100); border: none;
          width: 34px; height: 34px; border-radius: 10px;
          cursor: pointer; font-size: 14px;
          color: var(--gray-600);
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition); flex-shrink: 0;
        }

        .modal-close:hover { background: var(--gray-200); }

        .modal-body { padding: 20px 24px 24px; }

        .sm-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 16px;
        }

        .sm-stat {
          background: var(--gray-50);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .sm-stat-label {
          font-size: 10px; font-weight: 700;
          color: var(--gray-500); text-transform: uppercase;
          letter-spacing: 0.3px; margin-bottom: 4px;
        }

        .sm-stat-value {
          font-size: 16px; font-weight: 800;
        }

        .sm-filters {
          display: flex; gap: 6px; margin-bottom: 16px;
          overflow-x: auto; scrollbar-width: none;
        }

        .sm-filters::-webkit-scrollbar { display: none; }

        .sm-filter {
          padding: 7px 14px;
          border-radius: 20px;
          border: 1.5px solid var(--gray-200);
          background: #fff;
          color: var(--gray-600);
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: var(--transition);
          white-space: nowrap; flex-shrink: 0;
        }

        .sm-filter.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }

        .sm-list {
          display: flex; flex-direction: column; gap: 8px;
        }

        .sm-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          transition: var(--transition);
        }

        .sm-item:hover {
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
        }

        .sm-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .sm-item-main { flex: 1; min-width: 0; }

        .sm-item-type {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.3px;
          margin-bottom: 2px;
        }

        .sm-item-notes {
          font-size: 13px; color: var(--gray-700);
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .sm-item-date {
          font-size: 11px; color: var(--gray-500);
        }

        .sm-item-qty {
          font-size: 16px; font-weight: 800;
          flex-shrink: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default StockMovement

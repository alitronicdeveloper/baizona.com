import { useState, useMemo, useEffect } from 'react'

function CustomerPicker({ customers, selectedId, onSelect, onClose, onCreateNew }) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Filter customers kwa search
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) {
      // Kama hakuna search, onyesha wateja 5 wa hivi karibuni
      const sorted = [...customers].sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )
      return showAll ? sorted : sorted.slice(0, 5)
    }
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    )
  }, [customers, search, showAll])

  // Auto-focus search
  useEffect(() => {
    const input = document.getElementById('customer-search')
    if (input) input.focus()
  }, [])

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="picker-header">
          <h3 className="picker-title">Chagua Mteja</h3>
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>

        {/* Search */}
        <div className="picker-search-wrap">
          <span className="picker-search-icon">🔍</span>
          <input
            id="customer-search"
            type="text"
            placeholder="Tafuta kwa jina au simu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="picker-search"
          />
          {search && (
            <button className="picker-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Label */}
        {!search && (
          <div className="picker-label">
            {showAll ? 'Wateja Wote' : 'Wateja wa Hivi Karibuni'}
          </div>
        )}

        {/* List */}
        <div className="picker-list">
          {filtered.length === 0 ? (
            <div className="picker-empty">
              {search ? (
                <>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    Hakuna mteja anayelingana
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    Ongeza mteja mpya chini
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    Hakuna wateja bado
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    Ongeza mteja wa kwanza
                  </div>
                </>
              )}
            </div>
          ) : (
            filtered.map(c => (
              <button
                key={c.local_id}
                onClick={() => {
                  onSelect(c.local_id)
                  onClose()
                }}
                className={`picker-item ${selectedId === c.local_id ? 'selected' : ''}`}
              >
                <div className="picker-avatar">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="picker-info">
                  <div className="picker-name">{c.name}</div>
                  <div className="picker-phone">{c.phone || 'Hakuna simu'}</div>
                </div>
                {Number(c.balance) > 0 && (
                  <div className="picker-balance">
                    Deni: {Number(c.balance).toLocaleString()}
                  </div>
                )}
              </button>
            ))
          )}

          {/* Show all button */}
          {!search && !showAll && customers.length > 5 && (
            <button
              className="picker-show-all"
              onClick={() => setShowAll(true)}
            >
              Ona wateja wote ({customers.length})
            </button>
          )}
        </div>

        {/* Footer: Add new */}
        <div className="picker-footer">
          <button
            className="picker-add-new"
            onClick={() => {
              onClose()
              onCreateNew()
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            <span>Ongeza Mteja Mpya</span>
          </button>
        </div>
      </div>

      <style>{`
        .picker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .picker-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: pickerSlide 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        @keyframes pickerSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .picker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 12px;
        }

        .picker-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .picker-close {
          background: var(--gray-100);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--gray-600);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .picker-close:hover {
          background: var(--gray-200);
        }

        .picker-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          margin: 0 20px 12px;
          background: var(--gray-50);
          border: 1.5px solid var(--gray-200);
          border-radius: 12px;
          padding: 0 14px;
          transition: var(--transition);
        }

        .picker-search-wrap:focus-within {
          border-color: var(--primary);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .picker-search-icon {
          font-size: 14px;
          color: var(--gray-400);
          margin-right: 8px;
        }

        .picker-search {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
          background: transparent;
          color: var(--gray-900);
        }

        .picker-search::placeholder {
          color: var(--gray-400);
        }

        .picker-search-clear {
          background: var(--gray-200);
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 10px;
          color: var(--gray-600);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .picker-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0 20px 8px;
        }

        .picker-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px;
          min-height: 200px;
        }

        .picker-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: var(--transition);
          margin-bottom: 2px;
        }

        .picker-item:hover {
          background: var(--gray-50);
        }

        .picker-item.selected {
          background: #eff6ff;
          box-shadow: inset 0 0 0 1.5px var(--primary);
        }

        .picker-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .picker-info {
          flex: 1;
          min-width: 0;
        }

        .picker-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--gray-900);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .picker-phone {
          font-size: 12px;
          color: var(--gray-500);
        }

        .picker-balance {
          font-size: 11px;
          font-weight: 700;
          color: var(--danger);
          background: #fef2f2;
          padding: 4px 10px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .picker-empty {
          text-align: center;
          padding: 40px 20px;
          color: var(--gray-500);
        }

        .picker-show-all {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1.5px dashed var(--gray-200);
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          margin-top: 8px;
          margin-bottom: 8px;
          transition: var(--transition);
        }

        .picker-show-all:hover {
          border-color: var(--primary);
          background: #eff6ff;
        }

        .picker-footer {
          padding: 12px 20px 20px;
          border-top: 1px solid var(--gray-100);
          background: #fff;
        }

        .picker-add-new {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: var(--transition);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }

        .picker-add-new:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
        }
      `}</style>
    </div>
  )
}

export default CustomerPicker

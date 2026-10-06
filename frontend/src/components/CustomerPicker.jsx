import { useState, useMemo, useEffect } from 'react'

function CustomerPicker({ customers, selectedId, onSelect, onClose, onCreateNew, onlyDeposits = false }) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Chuja kama ni amana
  const baseList = useMemo(() => {
    if (onlyDeposits) {
      return customers.filter(c => Number(c.deposit || 0) > 0)
    }
    return customers
  }, [customers, onlyDeposits])

  // Filter kwa search
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) {
      const sorted = [...baseList].sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )
      return showAll ? sorted : sorted.slice(0, 5)
    }
    return baseList.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    )
  }, [baseList, search, showAll])

  useEffect(() => {
    const input = document.getElementById('customer-search')
    if (input) input.focus()
  }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="picker-header">
          <div>
            <div className="picker-title">
              {onlyDeposits ? 'Chagua Mteja Mwenye Amana' : 'Chagua Mteja'}
            </div>
            {onlyDeposits && (
              <div className="picker-sub">Wateja wenye amana tu</div>
            )}
          </div>
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>

        {/* SEARCH */}
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

        {/* LABEL */}
        {!search && (
          <div className="picker-label">
            {showAll ? (onlyDeposits ? 'Wateja Wote Wenye Amana' : 'Wateja Wote') : 'Wateja wa Karibuni'}
          </div>
        )}

        {/* LIST */}
        <div className="picker-list">
          {filtered.length === 0 ? (
            <div className="picker-empty">
              {search ? (
                <>
                  <div className="picker-empty-icon">🔍</div>
                  <div className="picker-empty-title">Hakuna mteja anayelingana</div>
                  <div className="picker-empty-sub">Jaribu jina lingine</div>
                </>
              ) : onlyDeposits ? (
                <>
                  <div className="picker-empty-icon">💰</div>
                  <div className="picker-empty-title">Hakuna wateja wenye amana</div>
                  <div className="picker-empty-sub">Weka amana kwa mteja kwanza</div>
                </>
              ) : (
                <>
                  <div className="picker-empty-icon">👥</div>
                  <div className="picker-empty-title">Hakuna wateja bado</div>
                  <div className="picker-empty-sub">Ongeza mteja wa kwanza</div>
                </>
              )}
            </div>
          ) : (
            filtered.map(c => {
              const balance = Number(c.balance || 0)
              const deposit = Number(c.deposit || 0)

              return (
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
                  <div className="picker-badges">
                    {deposit > 0 && (
                      <div className="picker-badge picker-badge-deposit">
                        💰 {formatTZS(deposit)}
                      </div>
                    )}
                    {balance > 0 && (
                      <div className="picker-badge picker-badge-debt">
                        Deni: {formatTZS(balance)}
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}

          {!search && !showAll && baseList.length > 5 && (
            <button
              className="picker-show-all"
              onClick={() => setShowAll(true)}
            >
              Ona wote ({baseList.length})
            </button>
          )}
        </div>

        {/* FOOTER */}
        {!onlyDeposits && (
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
        )}
      </div>

      <style>{`
        .picker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .picker-modal {
          background: #0F0F0F;
          border-radius: 22px;
          width: 100%;
          max-width: 480px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          animation: pickerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        @keyframes pickerSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .picker-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 20px 12px;
        }

        .picker-title {
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
        }

        .picker-sub {
          font-size: 12px;
          color: #9CA3AF;
        }

        .picker-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .picker-close:active {
          background: rgba(255, 255, 255, 0.15);
        }

        .picker-search-wrap {
          display: flex;
          align-items: center;
          margin: 0 20px 12px;
          background: #1A1A1A;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0 14px;
          transition: all 0.2s;
        }

        .picker-search-wrap:focus-within {
          border-color: #F97316;
          background: #141414;
        }

        .picker-search-icon {
          font-size: 14px;
          color: #6B7280;
          margin-right: 8px;
        }

        .picker-search {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
          background: transparent;
          color: #fff;
        }

        .picker-search::placeholder {
          color: #6B7280;
        }

        .picker-search-clear {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 10px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .picker-label {
          font-size: 10px;
          font-weight: 800;
          color: #6B7280;
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
          transition: all 0.15s;
          margin-bottom: 2px;
        }

        .picker-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .picker-item.selected {
          background: rgba(249, 115, 22, 0.1);
          box-shadow: inset 0 0 0 1.5px #F97316;
        }

        .picker-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F97316, #EA580C);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
        }

        .picker-info {
          flex: 1;
          min-width: 0;
        }

        .picker-name {
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .picker-phone {
          font-size: 12px;
          color: #9CA3AF;
        }

        .picker-badges {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .picker-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 8px;
          white-space: nowrap;
        }

        .picker-badge-deposit {
          color: #FCD34D;
          background: rgba(251, 191, 36, 0.12);
        }

        .picker-badge-debt {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
        }

        .picker-empty {
          text-align: center;
          padding: 40px 20px;
          color: #9CA3AF;
        }

        .picker-empty-icon {
          font-size: 36px;
          margin-bottom: 8px;
          opacity: 0.6;
        }

        .picker-empty-title {
          font-weight: 700;
          margin-bottom: 4px;
          color: #fff;
          font-size: 14px;
        }

        .picker-empty-sub {
          font-size: 12px;
          color: #6B7280;
        }

        .picker-show-all {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          color: #F97316;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .picker-show-all:active {
          background: rgba(249, 115, 22, 0.08);
        }

        .picker-footer {
          padding: 12px 20px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .picker-add-new {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .picker-add-new:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}

export default CustomerPicker

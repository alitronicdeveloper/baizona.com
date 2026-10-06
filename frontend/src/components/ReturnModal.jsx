import { useState, useEffect } from 'react'
import { db } from '../db/dexie'
import { createReturnLocal } from '../db/operations'

function ReturnModal({ sale, onClose, onSuccess }) {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState({})
  const [reason, setReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('cash')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadItems = async () => {
      try {
        const saleItems = await db.sale_items
          .where('sale_id').equals(sale.local_id)
          .toArray()

        const withReturned = []
        for (const item of saleItems) {
          // Angalia kama bidhaa hii ilisharudishwa
          const returnedItems = await db.return_items
            .where('product_local_id').equals(item.product_local_id)
            .toArray()

          const totalReturned = returnedItems.reduce((sum, r) => sum + Number(r.quantity), 0)

          withReturned.push({
            ...item,
            alreadyReturned: totalReturned,
            availableToReturn: Number(item.quantity) - totalReturned,
          })
        }

        setItems(withReturned)

        // Weka default: kila item iliyobaki
        const initialSelected = {}
        withReturned.forEach(i => {
          if (i.availableToReturn > 0) {
            initialSelected[i.local_id] = {
              checked: true,
              quantity: i.availableToReturn,
            }
          }
        })
        setSelected(initialSelected)
      } catch (err) {
        console.error('Load items error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [sale.local_id])

  const toggleItem = (localId) => {
    setSelected(prev => ({
      ...prev,
      [localId]: {
        ...prev[localId],
        checked: !prev[localId]?.checked,
      }
    }))
  }

  const setQuantity = (localId, qty) => {
    setSelected(prev => ({
      ...prev,
      [localId]: {
        ...prev[localId],
        quantity: qty,
      }
    }))
  }

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const selectedItems = items.filter(i => selected[i.local_id]?.checked && selected[i.local_id]?.quantity > 0)

  const totalRefund = selectedItems.reduce((sum, i) => {
    return sum + (Number(i.unit_price) * Number(selected[i.local_id]?.quantity || 0))
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      alert('Chagua bidhaa angalau moja')
      return
    }

    // Validate quantities
    for (const item of selectedItems) {
      const qty = Number(selected[item.local_id]?.quantity || 0)
      if (qty <= 0 || qty > item.availableToReturn) {
        alert(`Kiasi si sahihi kwa: ${item.product_name}`)
        return
      }
    }

    setSaving(true)
    try {
      const returnItems = selectedItems.map(item => ({
        product_local_id: item.product_local_id,
        product_name: item.product_name,
        quantity: Number(selected[item.local_id]?.quantity || 0),
        unit_price: Number(item.unit_price),
        cost_price: Number(item.cost_price || 0),
      }))

      await createReturnLocal({
        sale_local_id: sale.local_id,
        customer_local_id: sale.customer_local_id || null,
        refund_method: refundMethod,
        reason: reason,
        items: returnItems,
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      alert('Kosa: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="return-overlay" onClick={onClose}>
      <div className="return-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="return-header">
          <div>
            <div className="return-title">Rudisha Bidhaa</div>
            <div className="return-sub">
              {sale.customer_name || 'Mteja wa kawaida'} ·{' '}
              {new Date(sale.sale_date).toLocaleDateString('sw-TZ', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </div>
          </div>
          <button className="return-close" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="return-body">

          {loading ? (
            <div className="return-loading">Inapakia...</div>
          ) : items.length === 0 ? (
            <div className="return-empty">Hakuna bidhaa kwenye mauzo haya</div>
          ) : (
            <>
              <div className="return-label">CHAGUA BIDHAA</div>

              <div className="return-items">
                {items.map(item => {
                  const isChecked = selected[item.local_id]?.checked || false
                  const qty = selected[item.local_id]?.quantity || 0
                  const maxQty = item.availableToReturn
                  const canReturn = maxQty > 0

                  return (
                    <div key={item.local_id} className={`return-item ${isChecked ? 'checked' : ''} ${!canReturn ? 'disabled' : ''}`}>
                      <label className="return-item-check">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!canReturn}
                          onChange={() => toggleItem(item.local_id)}
                        />
                      </label>

                      <div className="return-item-main">
                        <div className="return-item-name">{item.product_name}</div>
                        <div className="return-item-sub">
                          {formatTZS(item.unit_price)} × {item.quantity}
                          {item.alreadyReturned > 0 && (
                            <span className="return-item-returned">
                              {' '}· Zimerudishwa: {item.alreadyReturned}
                            </span>
                          )}
                        </div>
                        {!canReturn && (
                          <div className="return-item-done">Zote zimerudishwa</div>
                        )}
                      </div>

                      {isChecked && canReturn && (
                        <div className="return-item-qty">
                          <button
                            type="button"
                            className="return-qty-btn"
                            onClick={() => setQuantity(item.local_id, Math.max(1, qty - 1))}
                          >−</button>
                          <input
                            type="number"
                            value={qty}
                            onChange={e => setQuantity(item.local_id, Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
                            className="return-qty-input"
                            min="1"
                            max={maxQty}
                          />
                          <button
                            type="button"
                            className="return-qty-btn"
                            onClick={() => setQuantity(item.local_id, Math.min(maxQty, qty + 1))}
                          >+</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="return-label">SABABU</div>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="return-input"
                placeholder="Mfano: Bidhaa mbovu"
              />

              <div className="return-label">NAMNA YA KUREFUND</div>
              <div className="return-refunds">
                {[
                  { id: 'cash', label: 'Taslimu', icon: '💵' },
                  { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
                  { id: 'credit', label: 'Punguza Deni', icon: '📝' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRefundMethod(r.id)}
                    className={`return-refund ${refundMethod === r.id ? 'active' : ''}`}
                  >
                    <span className="return-refund-icon">{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* TOTAL */}
              {selectedItems.length > 0 && (
                <div className="return-total">
                  <span>Jumla ya Kurudisha</span>
                  <span className="return-total-value">{formatTZS(totalRefund)}</span>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="return-submit"
            disabled={saving || selectedItems.length === 0}
          >
            {saving ? 'INAHIFADHI...' : `HIFADHI RETURN (${selectedItems.length})`}
          </button>
        </form>
      </div>

      <style>{`
        .return-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .return-modal {
          background: #0A0A0A;
          border-radius: 22px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .return-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 22px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: sticky;
          top: 0;
          background: #0A0A0A;
          z-index: 2;
        }

        .return-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 3px;
        }

        .return-sub {
          font-size: 12px;
          color: #9CA3AF;
        }

        .return-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: #9CA3AF;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .return-body {
          padding: 20px 22px 24px;
        }

        .return-loading,
        .return-empty {
          padding: 30px;
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
        }

        .return-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9CA3AF;
          margin-bottom: 10px;
          margin-top: 16px;
        }

        .return-label:first-of-type {
          margin-top: 0;
        }

        .return-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .return-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          transition: all 0.15s;
        }

        .return-item.checked {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.05);
        }

        .return-item.disabled {
          opacity: 0.5;
        }

        .return-item-check input {
          width: 20px;
          height: 20px;
          accent-color: #10B981;
          cursor: pointer;
        }

        .return-item-main {
          flex: 1;
          min-width: 0;
        }

        .return-item-name {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
        }

        .return-item-sub {
          font-size: 11px;
          color: #9CA3AF;
        }

        .return-item-returned {
          color: #F97316;
        }

        .return-item-done {
          font-size: 10px;
          color: #10B981;
          font-weight: 700;
          margin-top: 2px;
        }

        .return-item-qty {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .return-qty-btn {
          width: 28px;
          height: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0A0A0A;
          border-radius: 8px;
          color: #10B981;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .return-qty-btn:active {
          background: #10B981;
          color: #fff;
        }

        .return-qty-input {
          width: 44px;
          height: 28px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0A0A0A;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          outline: none;
        }

        .return-qty-input:focus {
          border-color: #10B981;
        }

        .return-qty-input::-webkit-outer-spin-button,
        .return-qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .return-input {
          width: 100%;
          padding: 13px 14px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .return-input:focus {
          border-color: #10B981;
        }

        .return-input::placeholder {
          color: #6B7280;
        }

        .return-refunds {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .return-refund {
          padding: 12px 6px;
          background: #1A1A1A;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #9CA3AF;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.15s;
        }

        .return-refund.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10B981;
          color: #10B981;
        }

        .return-refund-icon {
          font-size: 18px;
        }

        .return-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          margin-top: 16px;
          font-size: 13px;
          color: #A7F3D0;
        }

        .return-total-value {
          font-size: 18px;
          font-weight: 800;
          color: #10B981;
        }

        .return-submit {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
          margin-top: 18px;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
          transition: all 0.15s;
        }

        .return-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .return-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}

export default ReturnModal

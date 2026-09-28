import { useState, useEffect } from 'react'
import { createCustomerLocal } from '../db/operations'

function QuickAddCustomer({ onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const input = document.getElementById('quick-name')
    if (input) input.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Weka jina la mteja')
      return
    }

    setSaving(true)
    try {
      const customer = await createCustomerLocal({
        name: form.name.trim(),
        phone: form.phone.trim(),
      })

      if (customer) {
        onCreated(customer)
        onClose()
      } else {
        setError('Imeshindwa kuhifadhi')
        setSaving(false)
      }
    } catch (err) {
      setError(err.message || 'Kosa la kuhifadhi')
      setSaving(false)
    }
  }

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal quick-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3 className="picker-title">Mteja Mpya</h3>
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 20px 20px' }}>
          <div className="quick-hint">
            Ongeza jina na simu tu
          </div>

          <label className="quick-label">Jina *</label>
          <input
            id="quick-name"
            type="text"
            placeholder="Mfano: Juma Contractor"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="quick-input"
            autoComplete="off"
          />

          <label className="quick-label">Simu</label>
          <input
            type="tel"
            placeholder="Mfano: 0712345678"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="quick-input"
            inputMode="tel"
            autoComplete="off"
          />

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '12px',
              fontWeight: '600',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="checkout-btn"
            disabled={saving}
            style={{ marginTop: '8px', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'INAHIFADHI...' : 'HIFADHI NA CHAGUA'}
          </button>
        </form>
      </div>

      <style>{`
        .picker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .picker-modal {
          background: #1A1A1A;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: popIn 0.25s ease-out;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
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
          color: #fff;
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
        }

        .quick-hint {
          background: rgba(249, 115, 22, 0.1);
          color: #F97316;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .quick-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .quick-input {
          width: 100%;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 15px;
          margin-bottom: 16px;
          box-sizing: border-box;
          background: #0A0A0A;
          color: #fff;
          outline: none;
        }

        .quick-input:focus {
          border-color: #F97316;
        }

        .quick-input::placeholder {
          color: #6B7280;
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
        }
      `}</style>
    </div>
  )
}

export default QuickAddCustomer

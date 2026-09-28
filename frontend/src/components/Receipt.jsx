import { useState, useEffect } from 'react'
import { getSettings } from '../lib/settings'

function Receipt({ sale, items, customerName, customerPhone, onClose }) {
  const settings = getSettings()
  const [phone, setPhone] = useState(customerPhone || '')
  const [copied, setCopied] = useState(false)

  const formatNumber = (n) => Math.round(Number(n || 0)).toLocaleString()
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('sw-TZ', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getMethodLabel = (m) => {
    if (m === 'cash') return 'Taslimu'
    if (m === 'mpesa') return 'M-Pesa'
    if (m === 'credit') return 'Deni'
    return m
  }

  // Tengeneza ujumbe wa WhatsApp
  const buildReceiptText = () => {
    const lines = []
    lines.push(`*${settings.shopName}*`)
    lines.push(settings.shopAddress)
    lines.push(`Simu: ${settings.shopPhone}`)
    lines.push('━━━━━━━━━━━━━━━')
    lines.push(`*Risiti:* #${sale.receipt_number || sale.local_id.slice(-8)}`)
    lines.push(`*Tarehe:* ${formatDate(sale.sale_date)}`)
    if (customerName) lines.push(`*Mteja:* ${customerName}`)
    lines.push('━━━━━━━━━━━━━━━')

    items.forEach(item => {
      lines.push(`*${item.product_name}*`)
      lines.push(`  ${item.quantity} × ${formatNumber(item.unit_price)} = ${formatNumber(item.subtotal)}`)
    })

    lines.push('━━━━━━━━━━━━━━━')
    lines.push(`*JUMLA: TZS ${formatNumber(sale.total_amount)}*`)
    lines.push(`Malipo: ${getMethodLabel(sale.payment_method)}`)

    if (Number(sale.amount_paid) > 0 && sale.payment_method !== 'credit') {
      lines.push(`Iliyolipwa: ${formatNumber(sale.amount_paid)}`)
      if (Number(sale.amount_paid) > Number(sale.total_amount)) {
        lines.push(`Chenji: ${formatNumber(Number(sale.amount_paid) - Number(sale.total_amount))}`)
      }
    }

    if (sale.payment_method === 'credit' && Number(sale.balance) > 0) {
      lines.push(`*Deni lililobaki: TZS ${formatNumber(sale.balance)}*`)
    }

    lines.push('━━━━━━━━━━━━━━━')
    lines.push(settings.receiptFooter)
    lines.push('_Baizona POS_')

    return lines.join('\n')
  }

  const formatPhone = (p) => {
    let cleaned = p.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('0')) cleaned = '255' + cleaned.slice(1)
    if (!cleaned.startsWith('255') && cleaned.length === 9) cleaned = '255' + cleaned
    return cleaned
  }

  const handleWhatsApp = () => {
    if (!phone || phone.trim() === '') {
      alert('Weka namba ya simu ya mteja')
      return
    }
    const formatted = formatPhone(phone)
    if (formatted.length < 12) {
      alert('Namba si sahihi. Tumia mfano: 0712345678')
      return
    }
    const text = encodeURIComponent(buildReceiptText())
    const url = `https://wa.me/${formatted}?text=${text}`
    window.open(url, '_blank')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildReceiptText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Imeshindwa kunakili')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Auto-focus phone kama ni tupu
  useEffect(() => {
    if (!customerPhone) {
      const input = document.getElementById('receipt-phone')
      if (input) input.focus()
    }
  }, [customerPhone])

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-actions">
          <div className="receipt-phone-wrap">
            <span className="receipt-phone-icon">📱</span>
            <input
              id="receipt-phone"
              type="tel"
              placeholder="Namba ya mteja (0712345678)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="receipt-phone-input"
            />
          </div>

          <button className="receipt-btn whatsapp" onClick={handleWhatsApp}>
            <span style={{ fontSize: '18px' }}>💬</span>
            <span>Tuma WhatsApp</span>
          </button>

          <div className="receipt-actions-row">
            <button className="receipt-btn copy" onClick={handleCopy}>
              {copied ? '✓ Imenakiliwa' : '📋 Nakili'}
            </button>
            <button className="receipt-btn print" onClick={handlePrint}>
              🖨️ Chapisha
            </button>
            <button className="receipt-btn close" onClick={onClose}>
              Funga
            </button>
          </div>
        </div>

        <div className="receipt-paper" id="receipt-printable">
          <div className="receipt-header">
            <div className="receipt-shop-name">{settings.shopName}</div>
            <div className="receipt-shop-info">{settings.shopAddress}</div>
            <div className="receipt-shop-info">Simu: {settings.shopPhone}</div>
            {settings.shopEmail && (
              <div className="receipt-shop-info">{settings.shopEmail}</div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-info">
            <div className="receipt-info-row">
              <span>Risiti Na:</span>
              <span>#{sale.receipt_number || sale.local_id.slice(-8)}</span>
            </div>
            <div className="receipt-info-row">
              <span>Tarehe:</span>
              <span>{formatDate(sale.sale_date)}</span>
            </div>
            {customerName && (
              <div className="receipt-info-row">
                <span>Mteja:</span>
                <span>{customerName}</span>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            {items.map((item, idx) => (
              <div key={idx} className="receipt-item">
                <div className="receipt-item-name">{item.product_name}</div>
                <div className="receipt-item-detail">
                  <span>{item.quantity} × {formatNumber(item.unit_price)}</span>
                  <span>{formatNumber(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Jumla</span>
              <span className="receipt-total-amount">TZS {formatNumber(sale.total_amount)}</span>
            </div>

            <div className="receipt-total-row">
              <span>Malipo</span>
              <span>{getMethodLabel(sale.payment_method)}</span>
            </div>

            {Number(sale.amount_paid) > 0 && sale.payment_method !== 'credit' && (
              <>
                <div className="receipt-total-row">
                  <span>Iliyolipwa</span>
                  <span>{formatNumber(sale.amount_paid)}</span>
                </div>
                {Number(sale.amount_paid) > Number(sale.total_amount) && (
                  <div className="receipt-total-row">
                    <span>Chenji</span>
                    <span>{formatNumber(Number(sale.amount_paid) - Number(sale.total_amount))}</span>
                  </div>
                )}
              </>
            )}

            {sale.payment_method === 'credit' && Number(sale.balance) > 0 && (
              <div className="receipt-total-row debt">
                <span>Deni lililobaki</span>
                <span>{formatNumber(sale.balance)}</span>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-footer">
            <div>{settings.receiptFooter}</div>
            <div className="receipt-powered">Baizona POS</div>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .receipt-modal {
          background: #f0f0f0;
          border-radius: 16px;
          padding: 16px;
          width: 100%;
          max-width: 440px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0,0,0,0.35);
          animation: slideUp 0.3s ease-out;
        }

        .receipt-actions {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 12px;
        }

        .receipt-phone-wrap {
          display: flex; align-items: center;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 14px;
          transition: all 0.15s;
        }

        .receipt-phone-wrap:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .receipt-phone-icon {
          font-size: 16px;
          margin-right: 8px;
        }

        .receipt-phone-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
          background: transparent;
          color: #111;
          font-weight: 500;
        }

        .receipt-phone-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .receipt-btn {
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .receipt-btn.whatsapp {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .receipt-btn.whatsapp:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
        }

        .receipt-actions-row {
          display: flex; gap: 8px;
        }

        .receipt-btn.copy,
        .receipt-btn.print,
        .receipt-btn.close {
          flex: 1;
        }

        .receipt-btn.copy {
          background: #fff;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .receipt-btn.copy:hover {
          background: #f9fafb;
        }

        .receipt-btn.print {
          background: #fff;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .receipt-btn.print:hover {
          background: #f9fafb;
        }

        .receipt-btn.close {
          background: #374151;
          color: #fff;
        }

        .receipt-btn.close:hover {
          background: #1f2937;
        }

        .receipt-paper {
          background: #fff;
          border-radius: 8px;
          padding: 24px 20px;
          font-family: 'Courier New', 'Courier', monospace;
          color: #111;
          font-size: 13px;
          line-height: 1.5;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 4px;
        }

        .receipt-shop-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .receipt-shop-info {
          font-size: 11px;
          color: #444;
          margin-bottom: 2px;
        }

        .receipt-divider {
          border-top: 1px dashed #999;
          margin: 12px 0;
        }

        .receipt-info { font-size: 12px; }

        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .receipt-items { font-size: 12px; }

        .receipt-item { margin-bottom: 10px; }

        .receipt-item-name {
          font-weight: 700;
          margin-bottom: 2px;
        }

        .receipt-item-detail {
          display: flex;
          justify-content: space-between;
          color: #444;
          font-size: 11px;
        }

        .receipt-totals { font-size: 13px; }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .receipt-total-amount {
          font-weight: 800;
          font-size: 15px;
        }

        .receipt-total-row.debt {
          color: #dc2626;
          font-weight: 700;
        }

        .receipt-footer {
          text-align: center;
          font-size: 11px;
          color: #444;
          margin-top: 8px;
        }

        .receipt-powered {
          margin-top: 8px;
          font-size: 10px;
          color: #999;
          letter-spacing: 1px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media print {
          body * { visibility: hidden; }
          #receipt-printable, #receipt-printable * { visibility: visible; }
          #receipt-printable {
            position: absolute;
            left: 0; top: 0;
            width: 80mm;
            padding: 10px;
            background: #fff;
            border-radius: 0;
          }
          .receipt-overlay {
            background: #fff !important;
            padding: 0 !important;
            position: static !important;
          }
          .receipt-modal {
            background: #fff !important;
            padding: 0 !important;
            box-shadow: none !important;
            max-width: none !important;
            border-radius: 0 !important;
          }
          .receipt-actions { display: none !important; }
          @page { margin: 0; size: 80mm auto; }
        }
      `}</style>
    </div>
  )
}

export default Receipt

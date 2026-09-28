import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomerById, getPaymentsByCustomer, createPaymentLocal } from '../db/operations'

function MtejaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [payments, setPayments] = useState([])
  const [showPayForm, setShowPayForm] = useState(false)
  const [form, setForm] = useState({ amount: '', payment_method: 'cash', notes: '' })

  const load = async () => {
    const c = await getCustomerById(id)
    setCustomer(c)
    const p = await getPaymentsByCustomer(id)
    setPayments(p)
  }

  useEffect(() => { load() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) {
      return alert('Weka kiasi sahihi')
    }
    try {
      await createPaymentLocal({
        customer_local_id: id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        notes: form.notes,
      })
      setForm({ amount: '', payment_method: 'cash', notes: '' })
      setShowPayForm(false)
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('sw-TZ', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const daysSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  if (!customer) {
    return <div style={{ padding: '20px', color: 'var(--gray-500)' }}>Inapakia...</div>
  }

  const balance = Number(customer.balance)

  return (
    <div style={{ paddingBottom: '40px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', color: 'var(--primary)',
        fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '16px',
        fontWeight: '600'
      }}>
        ← Rudi
      </button>

      <div style={{
        background: '#fff', padding: '20px', borderRadius: 'var(--radius)',
        marginBottom: '16px', boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>{customer.name}</h1>
        <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>{customer.phone || 'Hakuna simu'}</div>
      </div>

      <div style={{
        background: balance > 0 ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${balance > 0 ? '#fca5a5' : '#86efac'}`,
        borderRadius: 'var(--radius)', padding: '20px',
        marginBottom: '16px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '13px', color: balance > 0 ? '#991b1b' : '#166534' }}>
          {balance > 0 ? 'Deni la Sasa' : 'Hana Deni'}
        </div>
        <div style={{
          fontSize: '28px', fontWeight: '700',
          color: balance > 0 ? 'var(--danger)' : 'var(--success)'
        }}>
          TZS {Math.round(balance).toLocaleString()}
        </div>
        {balance > 0 && (customer.last_credit_date || customer.created_at) && (
          <div style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px dashed #fca5a5',
            fontSize: '12px',
            color: '#991b1b',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: '600' }}>
              📅 Deni la mwisho: {formatDate(customer.last_credit_date || customer.created_at)}
            </span>
            {daysSince(customer.last_credit_date || customer.created_at) !== null && (
              <span style={{
                background: daysSince(customer.last_credit_date || customer.created_at) > 30 ? '#fee2e2' : '#fff',
                padding: '2px 8px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                textTransform: 'uppercase'
              }}>
                {daysSince(customer.last_credit_date || customer.created_at) === 0 ? 'Leo' :
                 daysSince(customer.last_credit_date || customer.created_at) === 1 ? 'Jana' :
                 `Siku ${daysSince(customer.last_credit_date || customer.created_at)}`}
              </span>
            )}
          </div>
        )}
      </div>

      {!showPayForm ? (
        <button onClick={() => setShowPayForm(true)} style={{
          width: '100%', padding: '16px', background: 'var(--primary)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: '600', cursor: 'pointer',
          marginBottom: '20px'
        }}>
          + Rekodi Malipo
        </button>
      ) : (
        <form onSubmit={handlePayment} style={{
          background: '#fff', padding: '20px', borderRadius: 'var(--radius)',
          marginBottom: '20px', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '12px' }}>Rekodi Malipo</div>
          <input
            type="number"
            placeholder="Kiasi"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            required
            style={inputStyle}
          />
          <select
            value={form.payment_method}
            onChange={e => setForm({ ...form, payment_method: e.target.value })}
            style={inputStyle}
          >
            <option value="cash">Taslimu</option>
            <option value="mpesa">M-Pesa</option>
          </select>
          <input
            placeholder="Maelezo (si lazima)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setShowPayForm(false)} style={{
              flex: 1, padding: '12px', background: 'var(--gray-100)',
              color: 'var(--gray-700)', border: 'none', borderRadius: '8px',
              fontWeight: '600', cursor: 'pointer'
            }}>
              Ghairi
            </button>
            <button type="submit" style={{
              flex: 2, padding: '12px', background: 'var(--success)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: '600', cursor: 'pointer'
            }}>
              HIFADHI MALIPO
            </button>
          </div>
        </form>
      )}

      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Historia ya Malipo</h2>

      {payments.length === 0 ? (
        <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '20px', textAlign: 'center' }}>
          Hakuna malipo bado
        </div>
      ) : (
        payments.map(p => (
          <div key={p.local_id} style={{
            background: '#fff', padding: '16px', borderRadius: 'var(--radius)',
            marginBottom: '8px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontWeight: '600' }}>
                TZS {Number(p.amount).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {new Date(p.payment_date).toLocaleString()} • {p.payment_method === 'cash' ? 'Taslimu' : p.payment_method === 'mpesa' ? 'M-Pesa' : 'Deni'}
              </div>
              {p.notes && (
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                  {p.notes}
                </div>
              )}
            </div>
            <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '18px' }}>+</div>
          </div>
        ))
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px', marginBottom: '12px',
  border: '1px solid var(--gray-200)', borderRadius: '8px',
  fontSize: '14px', boxSizing: 'border-box'
}

export default MtejaDetail

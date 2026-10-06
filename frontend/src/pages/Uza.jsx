import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllProducts, getAllCustomers, createSaleLocal } from '../db/operations'
import CustomerPicker from '../components/CustomerPicker'
import QuickAddCustomer from '../components/QuickAddCustomer'
import Receipt from '../components/Receipt'
import { generateReceiptNumber } from '../lib/settings'

function Uza() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('baizona_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [payment, setPayment] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customersWithDeposits, setCustomersWithDeposits] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const navigate = useNavigate()

  const loadCustomers = () => getAllCustomers().then(setCustomers).catch(console.error)

  useEffect(() => {
    getAllProducts().then(setProducts).catch(console.error)
    loadCustomers()
  }, [])

  // Hifadhi cart kwenye localStorage
  useEffect(() => {
    try {
      localStorage.setItem('baizona_cart', JSON.stringify(cart))
    } catch {}
  }, [cart])

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === 'all' || p.category === category
      return matchSearch && matchCategory && Number(p.stock) > 0
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'sw'))

  const addToCart = (p) => {
    const existing = cart.find(i => i.product_local_id === p.local_id)
    if (existing) {
      const updated = cart.map(i =>
        i.product_local_id === p.local_id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
      const item = updated.find(i => i.product_local_id === p.local_id)
      const others = updated.filter(i => i.product_local_id !== p.local_id)
      setCart([item, ...others])
    } else {
      setCart([{
        product_local_id: p.local_id,
        product_name: p.name,
        unit: p.unit,
        unit_price: Number(p.selling_price),
        cost_price: Number(p.cost_price),
        quantity: 1,
        stock: Number(p.stock),
      }, ...cart])
    }
  }

  const setQty = (localId, qty) => {
    const item = cart.find(i => i.product_local_id === localId)
    if (!item) return
    if (qty <= 0) return setCart(cart.filter(i => i.product_local_id !== localId))
    if (qty > item.stock) {
      alert(`Stock haitoshi. Zimebaki ${item.stock} ${item.unit}`)
      qty = item.stock
    }
    setCart(cart.map(i => i.product_local_id === localId ? { ...i, quantity: qty } : i))
  }

  const incrementQty = (localId, amount) => {
    const item = cart.find(i => i.product_local_id === localId)
    if (!item) return
    setQty(localId, item.quantity + amount)
  }

  const removeFromCart = (localId) => {
    setCart(cart.filter(i => i.product_local_id !== localId))
  }

  const total = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const profit = cart.reduce((sum, i) => sum + (i.unit_price - i.cost_price) * i.quantity, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const handleCustomerCreated = (customer) => {
    setCustomers(prev => [...prev, customer])
    setSelectedCustomer(customer.local_id)
  }

  const handleSale = async () => {
    if (cart.length === 0) return alert('Cart ni tupu')
    if (payment === 'credit' && !selectedCustomer) {
      return alert('Tafadhali chagua mteja kwa mauzo ya deni')
    }
    if (payment === 'deposit' && !selectedCustomer) {
      return alert('Tafadhali chagua mteja mwenye amana')
    }

    try {
      const createdSale = await createSaleLocal({
        payment_method: payment === 'deposit' ? 'deposit' : payment,
        customer_local_id: selectedCustomer || null,
        amount_paid: payment === 'credit' ? 0 : total,
        total_amount: total,
        profit: profit,
        items: cart.map(i => ({
          product_local_id: i.product_local_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          cost_price: i.cost_price,
          subtotal: i.unit_price * i.quantity,
          profit: (i.unit_price - i.cost_price) * i.quantity,
        })),
      })

      const saleData = {
        local_id: createdSale.local_id,
        receipt_number: generateReceiptNumber(),
        sale_date: createdSale.sale_date || new Date().toISOString(),
        payment_method: payment,
        total_amount: total,
        amount_paid: payment === 'credit' ? 0 : total,
        balance: payment === 'credit' ? total : 0,
        profit: profit,
      }

      const customerName = selectedCustomerObj ? selectedCustomerObj.name : null

      setReceiptData({
        sale: saleData,
        items: cart.map(i => ({
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.unit_price * i.quantity,
        })),
        customerName: customerName,
        customerPhone: selectedCustomerObj ? selectedCustomerObj.phone : '',
      })

      setCart([])
      setSelectedCustomer(null)
      setPayment('cash')
      setShowCart(false)
      try { localStorage.removeItem('baizona_cart') } catch {}
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const closeReceipt = () => {
    setReceiptData(null)
    navigate('/')
  }

  const selectedCustomerObj = customers.find(c => c.local_id === selectedCustomer)

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  return (
    <div className="uza">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Uza</div>
            <div className="hero-sub">Chagua bidhaa kuuza</div>
          </div>
          <button className="hero-cart" onClick={() => setShowCart(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="21" r="1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="21" r="1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {cart.length > 0 && (
              <span className="hero-cart-badge">{itemCount}</span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="hero-search">
          <span className="hero-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tafuta bidhaa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="hero-search-input"
          />
          {search && (
            <button className="hero-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* CATEGORIES */}
        {categories.length > 1 && (
          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'all' ? 'Zote' : cat}
              </button>
            ))}
          </div>
        )}

        {/* PRODUCTS GRID */}
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-title">
              {search ? 'Hakuna bidhaa inayolingana' : 'Hakuna bidhaa'}
            </div>
            <div className="empty-sub">
              {search ? 'Jaribu jina lingine' : 'Ongeza bidhaa kwenye Bidhaa page'}
            </div>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(p => {
              const inCart = cart.find(i => i.product_local_id === p.local_id)
              const stockNum = Number(p.stock)
              const stockClass = stockNum <= 5 ? 'low' : stockNum <= 20 ? 'medium' : 'good'

              return (
                <button
                  key={p.local_id}
                  onClick={() => addToCart(p)}
                  className={`product ${inCart ? 'in-cart' : ''}`}
                >
                  {inCart && <div className="badge">{inCart.quantity}</div>}

                  <div className="product-icon">
                    {p.category === 'Saruji' ? '🧱' :
                     p.category === 'Nondo' ? '🔩' :
                     p.category === 'Mabati' ? '📐' : '📦'}
                  </div>

                  <div className="product-name">{p.name}</div>

                  <div className="product-price">
                    {formatTZS(p.selling_price)}
                  </div>

                  <div className={`product-stock ${stockClass}`}>
                    {p.stock} {p.unit}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* FLOATING CART */}
      {cart.length > 0 && !showCart && (
        <button className="float-cart" onClick={() => setShowCart(true)}>
          <div className="float-cart-left">
            <span className="float-cart-icon">🛒</span>
            <span className="float-cart-count">{itemCount} bidhaa</span>
          </div>
          <div className="float-cart-total">{formatTZS(total)}</div>
        </button>
      )}

      {/* CART MODAL */}
      {showCart && (
        <div className="cart-modal">
          <div className="cart-header">
            <div>
              <div className="cart-title">Cart</div>
              <div className="cart-sub">{itemCount} bidhaa · {cart.length} aina</div>
            </div>
            <button className="cart-close" onClick={() => setShowCart(false)}>✕</button>
          </div>

          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <div className="cart-empty-title">Cart ni tupu</div>
              </div>
            ) : (
              cart.map(i => (
                <div key={i.product_local_id} className="cart-item">
                  <div className="cart-item-top">
                    <div className="cart-item-name">{i.product_name}</div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(i.product_local_id)}
                    >✕</button>
                  </div>

                  <div className="cart-item-price">
                    {formatTZS(i.unit_price)} / {i.unit}
                  </div>

                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => incrementQty(i.product_local_id, -1)}>−</button>
                    <input
                      type="number"
                      className="qty-input"
                      value={i.quantity}
                      onChange={e => setQty(i.product_local_id, Number(e.target.value) || 0)}
                      onFocus={e => e.target.select()}
                      min="1"
                      max={i.stock}
                      inputMode="numeric"
                    />
                    <button className="qty-btn" onClick={() => incrementQty(i.product_local_id, 1)}>+</button>
                  </div>

                  <div className="presets">
                    {[5, 10, 50, 100].map(n => (
                      <button
                        key={n}
                        className="preset"
                        onClick={() => setQty(i.product_local_id, n)}
                        disabled={n > i.stock}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="cart-item-total">
                    {formatTZS(i.unit_price * i.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="summary">
                <div className="summary-row">
                  <span>Jumla</span>
                  <span className="summary-total">{formatTZS(total)}</span>
                </div>
                <div className="summary-row summary-profit">
                  <span>Faida</span>
                  <span>{formatTZS(profit)}</span>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="payments">
                {[
                  { id: 'cash', label: 'Taslimu', icon: '💵' },
                  { id: 'mobile', label: 'Malipo kwa Simu', icon: '📱' },
                  { id: 'credit', label: 'Deni', icon: '📝' },
                  { id: 'deposit', label: 'Amana', icon: '💰' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`pay-tab ${payment === m.id ? 'active' : ''}`}
                  >
                    <span className="pay-icon">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* CUSTOMER (kwa credit au deposit) */}
              {(payment === 'credit' || payment === 'deposit') && (
                <button
                  className="customer-btn"
                  onClick={() => setShowPicker(true)}
                >
                  {selectedCustomerObj ? (
                    <>
                      <div className="customer-avatar">
                        {selectedCustomerObj.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-info">
                        <div className="customer-name">{selectedCustomerObj.name}</div>
                        {Number(selectedCustomerObj.balance) > 0 && (
                          <div className="customer-debt">
                            Deni: {formatTZS(selectedCustomerObj.balance)}
                          </div>
                        )}
                      </div>
                      <span className="customer-action">Badili</span>
                    </>
                  ) : (
                    <>
                      <span className="customer-icon">👤</span>
                      <span>Chagua mteja</span>
                    </>
                  )}
                </button>
              )}

              <button className="checkout" onClick={handleSale}>
                MALIZA MALIPO
                <span className="checkout-arrow">→</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showPicker && (
        <CustomerPicker
          customers={customers}
          selectedId={selectedCustomer}
          onSelect={setSelectedCustomer}
          onClose={() => setShowPicker(false)}
          onCreateNew={() => setShowQuickAdd(true)}
          onlyDeposits={payment === 'deposit'}
        />
      )}

      {showQuickAdd && (
        <QuickAddCustomer
          onCreated={handleCustomerCreated}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {receiptData && (
        <Receipt
          sale={receiptData.sale}
          items={receiptData.items}
          customerName={receiptData.customerName}
          customerPhone={receiptData.customerPhone}
          onClose={closeReceipt}
        />
      )}

      <style>{`
        .uza {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
          padding-bottom: 100px;
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
          margin-bottom: 16px;
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

        .hero-cart {
          position: relative;
          width: 44px;
          height: 44px;
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

        .hero-cart:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          background: #F97316;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1920A7;
        }

        /* SEARCH */
        .hero-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          padding: 12px 14px;
          position: relative;
          z-index: 1;
        }

        .hero-search-icon {
          font-size: 14px;
          opacity: 0.8;
        }

        .hero-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
          min-width: 0;
        }

        .hero-search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .hero-search-clear {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
        }

        /* CATEGORIES */
        .categories {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          padding: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .categories::-webkit-scrollbar { display: none; }

        .cat {
          padding: 8px 16px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 999px;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .cat.active {
          background: #F97316;
          border-color: #F97316;
          color: #fff;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .product {
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .product:active {
          transform: scale(0.97);
        }

        .product.in-cart {
          border-color: #F97316;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, #1A1A1A 100%);
        }

        .badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #F97316;
          color: #fff;
          width: 26px; height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
        }

        .product-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .product-name {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
          line-height: 1.3;
          min-height: 34px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-price {
          font-size: 14px;
          font-weight: 800;
          color: #F97316;
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }

        .product-stock {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          align-self: flex-start;
        }

        .product-stock.good {
          background: rgba(16, 185, 129, 0.15);
          color: #86EFAC;
        }

        .product-stock.medium {
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
        }

        .product-stock.low {
          background: rgba(239, 68, 68, 0.15);
          color: #FCA5A5;
        }

        /* EMPTY */
        .empty {
          padding: 60px 20px;
          text-align: center;
          background: #1A1A1A;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
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

        /* FLOATING CART */
        .float-cart {
          position: fixed;
          bottom: 90px;
          left: 16px;
          right: 16px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: #fff;
          border: none;
          padding: 16px 20px;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 12px 32px rgba(249, 115, 22, 0.45);
          z-index: 50;
          animation: slideUp 0.3s ease-out;
        }

        .float-cart:active {
          transform: scale(0.98);
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .float-cart-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .float-cart-icon {
          font-size: 20px;
        }

        .float-cart-count {
          font-size: 14px;
          font-weight: 600;
        }

        .float-cart-total {
          font-size: 16px;
          font-weight: 800;
        }

        /* CART MODAL */
        .cart-modal {
          position: fixed;
          inset: 0;
          background: #0A0A0A;
          z-index: 200;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          animation: slideRight 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          padding-bottom: 40px;
        }

        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: #0A0A0A;
        }

        .cart-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
        }

        .cart-sub {
          font-size: 12px;
          color: #9CA3AF;
        }

        .cart-close {
          background: #1A1A1A;
          border: none;
          width: 36px; height: 36px;
          border-radius: 12px;
          font-size: 16px;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cart-body {
          padding: 16px 18px;
        }

        .cart-empty {
          padding: 60px 20px;
          text-align: center;
        }

        .cart-empty-icon {
          font-size: 56px;
          margin-bottom: 12px;
          opacity: 0.3;
        }

        .cart-empty-title {
          font-size: 14px;
          color: #9CA3AF;
        }

        .cart-item {
          background: #1A1A1A;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cart-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .cart-item-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex: 1;
          padding-right: 8px;
        }

        .cart-item-remove {
          background: rgba(239, 68, 68, 0.15);
          border: none;
          width: 26px; height: 26px;
          border-radius: 8px;
          color: #EF4444;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-price {
          font-size: 11px;
          color: #9CA3AF;
          margin-bottom: 12px;
        }

        .qty-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .qty-btn {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0A0A0A;
          border-radius: 12px;
          cursor: pointer;
          font-size: 22px;
          font-weight: 700;
          color: #F97316;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .qty-btn:active {
          background: #F97316;
          color: #fff;
          transform: scale(0.95);
        }

        .qty-input {
          flex: 1;
          height: 44px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          background: #0A0A0A;
          outline: none;
        }

        .qty-input:focus {
          border-color: #F97316;
        }

        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .qty-input[type=number] {
          -moz-appearance: textfield;
        }

        .presets {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }

        .preset {
          flex: 1;
          padding: 8px 4px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          color: #9CA3AF;
          transition: all 0.15s;
        }

        .preset:active:not(:disabled) {
          background: #F97316;
          color: #fff;
          border-color: #F97316;
        }

        .preset:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .cart-item-total {
          text-align: right;
          font-size: 15px;
          font-weight: 800;
          color: #F97316;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
        }

        /* FOOTER */
        .cart-footer {
          padding: 14px 18px 24px;
          padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          background: #0A0A0A;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 8px;
        }

        .summary {
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          margin-bottom: 10px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .summary-row span:first-child {
          font-size: 14px;
          color: #9CA3AF;
          font-weight: 500;
        }

        .summary-total {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
        }

        .summary-profit {
          font-size: 13px;
        }

        .summary-profit span:last-child {
          color: #86EFAC;
          font-weight: 700;
        }

        .payments {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }

        .pay-tab {
          padding: 12px 6px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #1A1A1A;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.15s;
          color: #9CA3AF;
        }

        .pay-tab.active {
          background: #F97316;
          border-color: #F97316;
          color: #fff;
        }

        .pay-icon {
          font-size: 18px;
        }

        .customer-btn {
          width: 100%;
          padding: 14px;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          background: #1A1A1A;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 12px;
          transition: all 0.15s;
        }

        .customer-btn:active {
          background: #232323;
        }

        .customer-icon {
          font-size: 20px;
        }

        .customer-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F97316, #EA580C);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
        }

        .customer-info {
          flex: 1;
          text-align: left;
          min-width: 0;
        }

        .customer-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .customer-debt {
          font-size: 11px;
          color: #FCA5A5;
          font-weight: 600;
          margin-top: 2px;
        }

        .customer-action {
          color: #9CA3AF;
          font-size: 12px;
          flex-shrink: 0;
        }

        .checkout {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
          letter-spacing: 0.3px;
          transition: all 0.15s;
        }

        .checkout:active {
          transform: scale(0.98);
        }

        .checkout-arrow {
          font-size: 18px;
        }
      `}</style>
    </div>
  )
}

export default Uza

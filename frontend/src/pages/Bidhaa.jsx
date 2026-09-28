import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts, createProductLocal } from '../db/operations'

// Templates za bidhaa za kawaida
const TEMPLATES = {
  Saruji: {
    unit: 'Mfuko',
    items: [
      'Saruji Twiga 50kg',
      'Saruji Simba 50kg',
      'Saruji Tembo 50kg',
      'Saruji Dangote 50kg',
      'Saruji Camel 50kg',
      'Saruji Twiga 25kg',
      'Saruji Simba 25kg',
    ],
  },
  Nondo: {
    unit: 'Kg',
    items: [
      'Nondo D8',
      'Nondo D10',
      'Nondo D12',
      'Nondo D16',
      'Nondo D20',
      'Nondo D25',
      'Nondo D32',
    ],
  },
  Mabati: {
    unit: 'Karatasi',
    items: [
      'Bati G28',
      'Bati G30',
      'Bati G32',
      'Bati G35',
      'Bati PVC',
      'Bati Kiganjani',
      'Bati Roman',
    ],
  },
  Rangi: {
    unit: 'Lita',
    items: [
      'Rangi Emulsion Nyeupe',
      'Rangi Emulsion Rangi',
      'Rangi Gloss Nyeupe',
      'Rangi Gloss Rangi',
      'Rangi Undercoat',
      'Rangi Primer',
    ],
  },
  Mbao: {
    unit: 'Piece',
    items: [
      'Mbao 2x2',
      'Mbao 2x4',
      'Mbao 2x6',
      'Mbao 1x8',
      'Mbao 4x4',
    ],
  },
  Umeme: {
    unit: 'Piece',
    items: [
      'Waya 1.5mm',
      'Waya 2.5mm',
      'Swichi',
      'Soketi',
      'Bulb LED',
      'Breaker',
    ],
  },
}

function Bidhaa() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Batch form state
  const [showForm, setShowForm] = useState(false)
  const [formStep, setFormStep] = useState(1) // 1: chagua kundi, 2: chagua aina, 3: jaza bei
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [rows, setRows] = useState([])
  const [customItem, setCustomItem] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const rowRefs = useRef([])

  const load = async () => {
    setLoading(true)
    const data = await getAllProducts()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products
    .filter(p => {
      if (category === 'all') return true
      return p.category === category
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'sw')
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'sw')
      if (sortBy === 'stock') return Number(a.stock) - Number(b.stock)
      if (sortBy === 'price') return Number(a.selling_price) - Number(b.selling_price)
      return 0
    })

  // Batch form — fungua
  const openForm = () => {
    setShowForm(true)
    setFormStep(1)
    setSelectedCategory('')
    setSelectedItems([])
    setRows([])
    setCustomItem('')
    setShowCustomInput(false)
  }

  const closeForm = () => {
    setShowForm(false)
    setFormStep(1)
    setSelectedCategory('')
    setSelectedItems([])
    setRows([])
  }

  // Chagua kundi → nenda step 2
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setSelectedItems([])
    setFormStep(2)
  }

  // Toggle item
  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  // Ongeza item mpya
  const addCustomItem = () => {
    if (!customItem.trim()) return
    const newItem = customItem.trim()
    if (!selectedItems.includes(newItem)) {
      setSelectedItems([...selectedItems, newItem])
    }
    setCustomItem('')
    setShowCustomInput(false)
  }

  // Endelea → nenda step 3 (jaza rows)
  const goToStep3 = () => {
    if (selectedItems.length === 0) return

    const newRows = selectedItems.map(item => ({
      name: item,
      cost_price: '',
      selling_price: '',
      stock: '',
    }))
    setRows(newRows)
    rowRefs.current = []
    setFormStep(3)

    // Scroll to first row
    setTimeout(() => {
      if (rowRefs.current[0]) {
        rowRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Update row
  const updateRow = (idx, field, value) => {
    const updated = [...rows]
    updated[idx][field] = value
    setRows(updated)
  }

  // Auto-scroll kwa row inayofuata
  const scrollToNextRow = (currentIdx) => {
    const nextIdx = currentIdx + 1
    if (nextIdx < rows.length && rowRefs.current[nextIdx]) {
      setTimeout(() => {
        rowRefs.current[nextIdx].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 150)
    }
  }

  // Save zote
  const handleSaveAll = async () => {
    // Validate
    for (const row of rows) {
      if (!row.cost_price || !row.selling_price || !row.stock) {
        alert(`Jaza bei na stock kwa: ${row.name}`)
        return
      }
    }

    try {
      const unit = TEMPLATES[selectedCategory]?.unit || 'Piece'

      for (const row of rows) {
        await createProductLocal({
          name: row.name,
          category: selectedCategory,
          unit: unit,
          cost_price: Number(row.cost_price),
          selling_price: Number(row.selling_price),
          stock: Number(row.stock),
          reorder_level: 10,
        })
      }

      alert(`✅ Bidhaa ${rows.length} zimehifadhiwa!`)
      closeForm()
      load()
    } catch (err) {
      alert('Kosa: ' + err.message)
    }
  }

  const availableItems = (TEMPLATES[selectedCategory]?.items || [])
    .slice()
    .sort((a, b) => a.localeCompare(b, 'sw'))

  return (
    <div className="bidhaa">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Bidhaa</div>
            <div className="hero-sub">Usimamizi wa bidhaa zako</div>
          </div>
          <div className="hero-actions">
            <Link to="/uza" className="hero-uza">+ Uza</Link>
            <button className="hero-add" onClick={openForm}>+</button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{products.length}</div>
            <div className="hero-stat-label">Bidhaa Zote</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">{categories.length - 1}</div>
            <div className="hero-stat-label">Makundi</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {!showForm ? (
          <>
            {/* CATEGORIES — templates + existing */}
            <div className="filters">
              <button
                className={`filter ${category === 'all' ? 'active' : ''}`}
                onClick={() => setCategory('all')}
              >
                Zote
              </button>
              {Object.keys(TEMPLATES).map(cat => (
                <button
                  key={cat}
                  className={`filter ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* SORT */}
            <div className="sort-row">
              <span className="sort-label">Panga:</span>
              <div className="sort-chips">
                {[
                  { id: 'name', label: 'A-Z' },
                  { id: 'name-desc', label: 'Z-A' },
                  { id: 'stock', label: 'Stock' },
                  { id: 'price', label: 'Bei' },
                ].map(s => (
                  <button
                    key={s.id}
                    className={`sort-chip ${sortBy === s.id ? 'active' : ''}`}
                    onClick={() => setSortBy(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIST */}
            {loading ? (
              <div className="empty">Inapakia...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📦</div>
                <div className="empty-title">Hakuna bidhaa</div>
                <div className="empty-sub">Bonyeza + kuongeza</div>
              </div>
            ) : (
              <div className="card-list">
                {filtered.map(p => {
                  const isLow = Number(p.stock) <= Number(p.reorder_level)
                  return (
                    <div key={p.local_id} className="card">
                      <div className="card-main">
                        <div className="card-name">{p.name}</div>
                        <div className="card-sub">{p.category} • {p.unit}</div>
                      </div>
                      <div className="card-right">
                        <div className="card-price">
                          {formatTZS(p.selling_price)}
                        </div>
                        <div className={`card-stock ${isLow ? 'low' : ''}`}>
                          {p.stock} {p.unit}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* BATCH FORM */}
            <div className="form-card">

              {/* STEP 1: Chagua Kundi */}
              {formStep === 1 && (
                <>
                  <div className="form-title">Chagua Kundi</div>
                  <div className="form-sub">Bidhaa gani unataka kuongeza?</div>

                  <div className="category-grid">
                    {Object.keys(TEMPLATES).map(cat => (
                      <button
                        key={cat}
                        className="category-btn"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 2: Chagua Aina */}
              {formStep === 2 && (
                <>
                  <div className="form-title">{selectedCategory}</div>
                  <div className="form-sub">Chagua aina unazouza</div>

                  <div className="check-list">
                    {availableItems.map(item => (
                      <label key={item} className="check-item">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => toggleItem(item)}
                        />
                        <span className="check-label">{item}</span>
                      </label>
                    ))}

                    {selectedItems.filter(i => !availableItems.includes(i)).map(item => (
                      <label key={item} className="check-item">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleItem(item)}
                        />
                        <span className="check-label">{item}</span>
                      </label>
                    ))}
                  </div>

                  {!showCustomInput ? (
                    <button
                      className="add-custom-btn"
                      onClick={() => setShowCustomInput(true)}
                    >
                      + Ongeza Aina Mpya
                    </button>
                  ) : (
                    <div className="custom-input-wrap">
                      <input
                        type="text"
                        placeholder="Jina la aina..."
                        value={customItem}
                        onChange={e => setCustomItem(e.target.value)}
                        className="form-input"
                        autoFocus
                      />
                      <div className="custom-btns">
                        <button className="custom-cancel" onClick={() => setShowCustomInput(false)}>
                          Ghairi
                        </button>
                        <button className="custom-add" onClick={addCustomItem}>
                          Ongeza
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    className="form-btn"
                    onClick={goToStep3}
                    disabled={selectedItems.length === 0}
                  >
                    ENDELEA ({selectedItems.length})
                  </button>
                </>
              )}

              {/* STEP 3: Jaza Bei */}
              {formStep === 3 && (
                <>
                  <div className="form-title">{selectedCategory}</div>
                  <div className="form-sub">Jaza bei na stock kwa kila bidhaa</div>

                  <div className="row-list">
                    {rows.map((row, idx) => (
                      <div
                        key={idx}
                        className="row-item"
                        ref={el => rowRefs.current[idx] = el}
                      >
                        <div className="row-header">
                          <div className="row-number">#{idx + 1}</div>
                          <div className="row-name">{row.name}</div>
                        </div>
                        <div className="row-fields">
                          <div className="row-field">
                            <label className="row-label">Kununua</label>
                            <input
                              type="number"
                              value={row.cost_price}
                              onChange={e => updateRow(idx, 'cost_price', e.target.value)}
                              className="row-input"
                              placeholder="0"
                              inputMode="numeric"
                              onFocus={() => {
                                // Scroll row to top ukibonyeza
                                rowRefs.current[idx]?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start'
                                })
                              }}
                            />
                          </div>
                          <div className="row-field">
                            <label className="row-label">Kuuza</label>
                            <input
                              type="number"
                              value={row.selling_price}
                              onChange={e => updateRow(idx, 'selling_price', e.target.value)}
                              className="row-input"
                              placeholder="0"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="row-field">
                            <label className="row-label">Stock</label>
                            <input
                              type="number"
                              value={row.stock}
                              onChange={e => updateRow(idx, 'stock', e.target.value)}
                              className="row-input"
                              placeholder="0"
                              inputMode="numeric"
                              onBlur={() => {
                                // Ukimaliza stock, scroll next row
                                if (row.stock) {
                                  scrollToNextRow(idx)
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-btns">
                    <button className="btn-back" onClick={() => setFormStep(2)}>
                      Rudi
                    </button>
                    <button className="form-btn" onClick={handleSaveAll}>
                      HIFADHI ZOTE ({rows.length})
                    </button>
                  </div>
                </>
              )}

              <button className="form-close" onClick={closeForm}>✕</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .bidhaa {
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

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
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

        .hero-add {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .hero-add:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .hero-stat {
          flex: 1;
          min-width: 0;
          text-align: center;
        }

        .hero-stat-value {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #fff;
        }

        .hero-stat-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }

        .hero-stat-divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        /* CONTENT */
        .content {
          padding: 16px 0;
          background: #0A0A0A;
        }

        /* FILTERS */
        .filters {
          display: flex;
          gap: 6px;
          margin: 0 0 10px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0;
        }

        .filters::-webkit-scrollbar { display: none; }

        .filter {
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

        .filter.active {
          background: #F97316;
          border-color: #F97316;
          color: #fff;
        }

        /* SORT */
        .sort-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px;
        }

        .sort-label {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          flex-shrink: 0;
        }

        .sort-chips {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .sort-chip {
          padding: 6px 12px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 999px;
          color: #9CA3AF;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .sort-chip.active {
          background: #F97316;
          border-color: #F97316;
          color: #fff;
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

        .card-right {
          text-align: right;
          flex-shrink: 0;
        }

        .card-price {
          font-size: 14px;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 2px;
        }

        .card-stock {
          font-size: 11px;
          color: #86EFAC;
          font-weight: 600;
        }

        .card-stock.low {
          color: #F97316;
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

        /* FORM CARD */
        .form-card {
          margin: 0;
          background: #1A1A1A;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .form-title {
          position: sticky;
          top: 0;
          background: #1A1A1A;
          padding-top: 4px;
          z-index: 2;
        }

        .form-title {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .form-sub {
          font-size: 12px;
          color: #9CA3AF;
          margin-bottom: 20px;
        }

        .form-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          color: #9CA3AF;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* CATEGORY GRID */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .category-btn {
          padding: 16px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .category-btn:active {
          background: #F97316;
          border-color: #F97316;
          transform: scale(0.98);
        }

        /* CHECK LIST */
        .check-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 12px;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #0A0A0A;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .check-item:active {
          background: #151515;
        }

        .check-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #F97316;
          cursor: pointer;
        }

        .check-label {
          font-size: 13px;
          color: #fff;
          font-weight: 500;
          flex: 1;
        }

        /* CUSTOM INPUT */
        .add-custom-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #F97316;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .custom-input-wrap {
          margin-bottom: 16px;
        }

        .custom-btns {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .custom-cancel {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 10px;
          color: #9CA3AF;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .custom-add {
          flex: 2;
          padding: 10px;
          background: #F97316;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* FORM INPUT */
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .form-input::placeholder { color: #6B7280; }
        .form-input:focus { border-color: #F97316; }

        /* FORM BUTTON */
        .form-btn {
          width: 100%;
          padding: 14px;
          background: #F97316;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          margin-top: 12px;
        }

        .form-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .form-btn:active:not(:disabled) {
          transform: scale(0.98);
          background: #EA580C;
        }

        /* ROWS */
        .row-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 8px;
        }

        .row-item {
          background: #0A0A0A;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          scroll-margin-top: 80px;
        }

        .row-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .row-number {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: #F97316;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .row-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex: 1;
        }

        .row-fields {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .row-field {
          min-width: 0;
        }

        .row-label {
          display: block;
          font-size: 10px;
          color: #9CA3AF;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
        }

        .row-input {
          width: 100%;
          padding: 10px 8px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          text-align: center;
        }

        .row-input:focus {
          border-color: #F97316;
        }

        .row-input::-webkit-outer-spin-button,
        .row-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .row-input[type=number] {
          -moz-appearance: textfield;
        }

        /* FORM BUTTONS */
        .form-btns {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .btn-back {
          flex: 1;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: #9CA3AF;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .form-btns .form-btn {
          flex: 2;
          margin-top: 0;
        }
      `}</style>
    </div>
  )
}

export default Bidhaa

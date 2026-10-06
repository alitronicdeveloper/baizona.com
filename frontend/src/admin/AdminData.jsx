import { useEffect, useState } from 'react'
import adminApi from './adminApi'

function AdminData() {
  const [topProducts, setTopProducts] = useState([])
  const [shopsByRegion, setShopsByRegion] = useState([])
  const [supplierPrices, setSupplierPrices] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/data/top-products').then(r => r.data),
      adminApi.get('/admin/data/shops-by-region').then(r => r.data),
      adminApi.get('/admin/data/supplier-prices').then(r => r.data),
    ])
      .then(([products, regions, prices]) => {
        setTopProducts(products)
        setShopsByRegion(regions)
        setSupplierPrices(prices)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatTZS = (n) => `TZS ${Math.round(Number(n || 0)).toLocaleString()}`

  if (loading) return <div className="empty">Inapakia...</div>

  return (
    <div className="admin-data">
      <h1 className="page-title">Data ya Platform</h1>
      <p className="page-sub">Bidhaa, location, na bei za suppliers</p>

      <div className="tabs">
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          Bidhaa Zinazouzwa
        </button>
        <button className={`tab ${activeTab === 'regions' ? 'active' : ''}`} onClick={() => setActiveTab('regions')}>
          Maduka kwa Mkoa
        </button>
        <button className={`tab ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>
          Bei za Suppliers
        </button>
      </div>

      {/* TOP PRODUCTS */}
      {activeTab === 'products' && (
        <div className="data-card">
          <div className="data-title">Bidhaa Zinazouzwa Zaidi (Kwenye Maduka Yote)</div>
          {topProducts.length === 0 ? (
            <div className="empty-small">Hakuna data bado</div>
          ) : (
            <div className="data-table">
              <div className="table-header">
                <div className="th">Bidhaa</div>
                <div className="th">Kundi</div>
                <div className="th">Mauzo</div>
                <div className="th">Idadi</div>
                <div className="th">Mapato</div>
              </div>
              {topProducts.map((p, i) => (
                <div key={i} className="table-row">
                  <div className="td td-name">{p.product_name}</div>
                  <div className="td">{p.category}</div>
                  <div className="td">{p.sales_count}</div>
                  <div className="td">{p.total_quantity}</div>
                  <div className="td td-value">{formatTZS(p.total_revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGIONS */}
      {activeTab === 'regions' && (
        <div className="data-card">
          <div className="data-title">Maduka kwa Mkoa</div>
          {shopsByRegion.length === 0 ? (
            <div className="empty-small">Hakuna data bado</div>
          ) : (
            <div className="data-table">
              <div className="table-header regions-header">
                <div className="th">Mkoa</div>
                <div className="th">Maduka</div>
              </div>
              {shopsByRegion.map((r, i) => (
                <div key={i} className="table-row regions-row">
                  <div className="td td-name">{r.region}</div>
                  <div className="td td-value">{r.shops_count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER PRICES */}
      {activeTab === 'prices' && (
        <div className="data-card">
          <div className="data-title">Bei za Suppliers</div>
          {supplierPrices.length === 0 ? (
            <div className="empty-small">Hakuna data bado</div>
          ) : (
            <div className="data-table">
              <div className="table-header">
                <div className="th">Bidhaa</div>
                <div className="th">Supplier</div>
                <div className="th">Mkoa</div>
                <div className="th">Bei</div>
              </div>
              {supplierPrices.map((p, i) => (
                <div key={i} className="table-row">
                  <div className="td td-name">{p.product_name}</div>
                  <div className="td">{p.supplier_name}</div>
                  <div className="td">{p.supplier_region || '—'}</div>
                  <div className="td td-value">{formatTZS(p.supplier_price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-data { width: 100%; }
        .page-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
        .tabs { display: flex; gap: 6px; margin-bottom: 20px; background: #141414; padding: 5px; border-radius: 12px; }
        .tab { flex: 1; padding: 11px; background: transparent; border: none; border-radius: 8px; color: #9CA3AF; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .tab.active { background: #F97316; color: #fff; }
        .data-card { background: #141414; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .data-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 16px; }
        .data-table { display: flex; flex-direction: column; }
        .table-header { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr; gap: 12px; padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 6px; }
        .regions-header { grid-template-columns: 2fr 1fr; }
        .th { font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr; gap: 12px; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .regions-row { grid-template-columns: 2fr 1fr; }
        .table-row:last-child { border-bottom: none; }
        .td { font-size: 13px; color: #d1d5db; display: flex; align-items: center; }
        .td-name { font-weight: 700; color: #fff; }
        .td-value { color: #F97316; font-weight: 700; }
        .empty-small { padding: 40px 20px; text-align: center; color: #71717a; font-size: 13px; }
        .empty { padding: 40px; text-align: center; color: #9CA3AF; }
      `}</style>
    </div>
  )
}

export default AdminData

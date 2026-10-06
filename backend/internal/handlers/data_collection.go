package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type DataCollectionHandler struct {
	DB *sql.DB
}

func NewDataCollectionHandler(db *sql.DB) *DataCollectionHandler {
	return &DataCollectionHandler{DB: db}
}

// GET /api/admin/data/top-products
func (h *DataCollectionHandler) TopProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT
			p.name AS product_name,
			p.category AS category,
			COUNT(si.id) AS sales_count,
			COALESCE(SUM(si.quantity), 0) AS total_quantity,
			COALESCE(SUM(si.subtotal), 0) AS total_revenue
		FROM sale_items si
		JOIN products p ON p.id = si.product_id
		GROUP BY p.name, p.category
		ORDER BY total_quantity DESC
		LIMIT 20
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type ProductStat struct {
		ProductName   string  `json:"product_name"`
		Category      string  `json:"category"`
		SalesCount    int     `json:"sales_count"`
		TotalQuantity float64 `json:"total_quantity"`
		TotalRevenue  float64 `json:"total_revenue"`
	}

	var stats []ProductStat
	for rows.Next() {
		var s ProductStat
		if err := rows.Scan(&s.ProductName, &s.Category, &s.SalesCount, &s.TotalQuantity, &s.TotalRevenue); err == nil {
			stats = append(stats, s)
		}
	}
	if stats == nil {
		stats = []ProductStat{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GET /api/admin/data/shops-by-region
func (h *DataCollectionHandler) ShopsByRegion(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT
			COALESCE(region, 'Haijulikani') AS region,
			COUNT(*) AS shops_count
		FROM shops
		WHERE deleted_at IS NULL
		GROUP BY region
		ORDER BY shops_count DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type RegionStat struct {
		Region     string `json:"region"`
		ShopsCount int    `json:"shops_count"`
	}

	var stats []RegionStat
	for rows.Next() {
		var s RegionStat
		if err := rows.Scan(&s.Region, &s.ShopsCount); err == nil {
			stats = append(stats, s)
		}
	}
	if stats == nil {
		stats = []RegionStat{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GET /api/admin/data/supplier-prices
func (h *DataCollectionHandler) SupplierPrices(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT
			p.name AS product_name,
			p.category AS category,
			s.name AS supplier_name,
			sp.supplier_price,
			s.region AS supplier_region
		FROM supplier_products sp
		JOIN products p ON p.id = sp.product_id
		JOIN suppliers s ON s.id = sp.supplier_id
		ORDER BY p.name, sp.supplier_price
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type PriceStat struct {
		ProductName    string  `json:"product_name"`
		Category       string  `json:"category"`
		SupplierName   string  `json:"supplier_name"`
		SupplierPrice  float64 `json:"supplier_price"`
		SupplierRegion string  `json:"supplier_region"`
	}

	var stats []PriceStat
	for rows.Next() {
		var s PriceStat
		if err := rows.Scan(&s.ProductName, &s.Category, &s.SupplierName, &s.SupplierPrice, &s.SupplierRegion); err == nil {
			stats = append(stats, s)
		}
	}
	if stats == nil {
		stats = []PriceStat{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

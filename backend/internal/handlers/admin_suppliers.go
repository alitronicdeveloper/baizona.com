package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type AdminSuppliersHandler struct {
	DB *sql.DB
}

func NewAdminSuppliersHandler(db *sql.DB) *AdminSuppliersHandler {
	return &AdminSuppliersHandler{DB: db}
}

// GET /api/admin/suppliers
func (h *AdminSuppliersHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT s.id, s.name, COALESCE(s.phone, ''), COALESCE(s.address, ''),
		       COALESCE(s.region, ''), COALESCE(s.district, ''),
		       COALESCE(s.balance, 0), COALESCE(sh.name, ''),
		       s.shop_id
		FROM suppliers s
		LEFT JOIN shops sh ON sh.id = s.shop_id
		WHERE s.deleted_at IS NULL
		ORDER BY s.name
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type SupplierRow struct {
		ID        uuid.UUID  `json:"id"`
		Name      string     `json:"name"`
		Phone     string     `json:"phone"`
		Address   string     `json:"address"`
		Region    string     `json:"region"`
		District  string     `json:"district"`
		Balance   float64    `json:"balance"`
		ShopName  string     `json:"shop_name"`
		ShopID    *uuid.UUID `json:"shop_id,omitempty"`
	}

	var suppliers []SupplierRow
	for rows.Next() {
		var s SupplierRow
		err := rows.Scan(&s.ID, &s.Name, &s.Phone, &s.Address, &s.Region, &s.District, &s.Balance, &s.ShopName, &s.ShopID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		suppliers = append(suppliers, s)
	}
	if suppliers == nil {
		suppliers = []SupplierRow{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suppliers)
}

// GET /api/admin/suppliers/{id}
func (h *AdminSuppliersHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var s struct {
		ID       uuid.UUID `json:"id"`
		Name     string    `json:"name"`
		Phone    string    `json:"phone"`
		Address  string    `json:"address"`
		Region   string    `json:"region"`
		District string    `json:"district"`
		Balance  float64   `json:"balance"`
	}

	err = h.DB.QueryRow(`
		SELECT id, name, COALESCE(phone, ''), COALESCE(address, ''),
		       COALESCE(region, ''), COALESCE(district, ''),
		       COALESCE(balance, 0)
		FROM suppliers
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(&s.ID, &s.Name, &s.Phone, &s.Address, &s.Region, &s.District, &s.Balance)
	if err != nil {
		http.Error(w, "Supplier haipatikani", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

// PUT /api/admin/suppliers/{id}
func (h *AdminSuppliersHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var req struct {
		Name     string `json:"name"`
		Phone    string `json:"phone"`
		Address  string `json:"address"`
		Region   string `json:"region"`
		District string `json:"district"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		UPDATE suppliers
		SET name = COALESCE(NULLIF($1, ''), name),
		    phone = COALESCE(NULLIF($2, ''), phone),
		    address = COALESCE(NULLIF($3, ''), address),
		    region = COALESCE(NULLIF($4, ''), region),
		    district = COALESCE(NULLIF($5, ''), district),
		    updated_at = NOW()
		WHERE id = $6
	`, req.Name, req.Phone, req.Address, req.Region, req.District, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imehifadhiwa"})
}

// GET /api/admin/suppliers/{id}/products
func (h *AdminSuppliersHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	rows, err := h.DB.Query(`
		SELECT sp.id, sp.product_id, p.name, p.category, COALESCE(p.unit, ''),
		       sp.supplier_price
		FROM supplier_products sp
		JOIN products p ON p.id = sp.product_id
		WHERE sp.supplier_id = $1
		ORDER BY p.name
	`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type ProductRow struct {
		ID            uuid.UUID `json:"id"`
		ProductID     uuid.UUID `json:"product_id"`
		Name          string    `json:"name"`
		Category      string    `json:"category"`
		Unit          string    `json:"unit"`
		SupplierPrice float64   `json:"supplier_price"`
	}

	var products []ProductRow
	for rows.Next() {
		var p ProductRow
		err := rows.Scan(&p.ID, &p.ProductID, &p.Name, &p.Category, &p.Unit, &p.SupplierPrice)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		products = append(products, p)
	}
	if products == nil {
		products = []ProductRow{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}


// POST /api/admin/suppliers/{id}/products
func (h *AdminSuppliersHandler) AddProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var req struct {
		ProductID     uuid.UUID `json:"product_id"`
		SupplierPrice float64   `json:"supplier_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		INSERT INTO supplier_products (id, supplier_id, product_id, supplier_price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		ON CONFLICT (supplier_id, product_id)
		DO UPDATE SET supplier_price = $4, updated_at = NOW()
	`, uuid.New(), supplierID, req.ProductID, req.SupplierPrice)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "imehifadhiwa"})
}

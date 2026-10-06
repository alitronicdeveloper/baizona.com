package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ShopHandler struct {
	DB *sql.DB
}

func NewShopHandler(db *sql.DB) *ShopHandler {
	return &ShopHandler{DB: db}
}

// GET /api/shops
func (h *ShopHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, name, COALESCE(owner_name, ''), COALESCE(phone, ''), COALESCE(address, ''),
		       COALESCE(region, ''), COALESCE(district, ''),
		       status, COALESCE(plan, 'free'), COALESCE(shop_type, 'hardware'),
		       created_at, updated_at
		FROM shops
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var shops []models.Shop
	for rows.Next() {
		var s models.Shop
		err := rows.Scan(&s.ID, &s.Name, &s.OwnerName, &s.Phone, &s.Address,
			&s.Region, &s.District, &s.Region, &s.District, &s.Status, &s.Plan, &s.ShopType, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		shops = append(shops, s)
	}
	if shops == nil {
		shops = []models.Shop{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shops)
}

// GET /api/shops/{id}
func (h *ShopHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var s models.Shop
	err = h.DB.QueryRow(`
		SELECT id, name, COALESCE(owner_name, ''), COALESCE(phone, ''), COALESCE(address, ''),
		       COALESCE(region, ''), COALESCE(district, ''),
		       status, COALESCE(plan, 'free'), COALESCE(shop_type, 'hardware'),
		       created_at, updated_at
		FROM shops
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(&s.ID, &s.Name, &s.OwnerName, &s.Phone, &s.Address,
		&s.Region, &s.District, &s.Region, &s.District, &s.Status, &s.Plan, &s.ShopType, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		http.Error(w, "Duka haipatikani", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

// PUT /api/shops/{id}
func (h *ShopHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var req models.UpdateShopRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		UPDATE shops
		SET name = COALESCE(NULLIF($1, ''), name),
		    status = COALESCE(NULLIF($2, ''), status),
		    plan = COALESCE(NULLIF($3, ''), plan),
		    phone = COALESCE(NULLIF($4, ''), phone),
		    address = COALESCE(NULLIF($5, ''), address),
		    updated_at = NOW()
		WHERE id = $6
	`, req.Name, req.Status, req.Plan, req.Phone, req.Address, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imehifadhiwa"})
}

// DELETE /api/shops/{id}
func (h *ShopHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`UPDATE shops SET deleted_at = NOW() WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imefutwa"})
}

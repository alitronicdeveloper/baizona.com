package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type PurchaseHandler struct {
	Service *services.PurchaseService
}

func NewPurchaseHandler(s *services.PurchaseService) *PurchaseHandler {
	return &PurchaseHandler{Service: s}
}

// GET /api/purchases
func (h *PurchaseHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	purchases, err := h.Service.GetAllPurchases(shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if purchases == nil {
		purchases = []models.Purchase{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(purchases)
}

// GET /api/suppliers/{id}/purchases
func (h *PurchaseHandler) GetBySupplier(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	purchases, err := h.Service.GetPurchasesBySupplier(supplierID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if purchases == nil {
		purchases = []models.Purchase{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(purchases)
}

// POST /api/purchases
func (h *PurchaseHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreatePurchaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	purchase, err := h.Service.CreatePurchase(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(purchase)
}

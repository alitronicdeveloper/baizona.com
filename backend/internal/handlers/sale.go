package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
)

type SaleHandler struct {
	Service *services.SaleService
}

func NewSaleHandler(s *services.SaleService) *SaleHandler {
	return &SaleHandler{Service: s}
}

func (h *SaleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	shopID := r.URL.Query().Get("shop_id")

	sale, err := h.Service.CreateSale(&req, shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sale)
}

func (h *SaleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	sales, err := h.Service.GetAllSales(shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if sales == nil {
		sales = []models.Sale{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sales)
}

func (h *SaleHandler) GetToday(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	sales, err := h.Service.GetTodaySales(shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if sales == nil {
		sales = []models.Sale{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sales)
}

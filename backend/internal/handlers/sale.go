package handlers

import (
	"encoding/json"
	"log"
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
		log.Printf("❌ JSON decode error: %v", err)
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	log.Printf("📥 Sale request: customer=%v, payment=%s, amount_paid=%.2f, items=%d",
		req.CustomerID, req.PaymentMethod, req.AmountPaid, len(req.Items))

	sale, err := h.Service.CreateSale(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sale)
}

func (h *SaleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	sales, err := h.Service.GetAllSales()
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
	stats, err := h.Service.GetTodaySales()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

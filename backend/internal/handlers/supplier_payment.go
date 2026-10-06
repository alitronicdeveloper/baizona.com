package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type SupplierPaymentHandler struct {
	Service *services.SupplierPaymentService
}

func NewSupplierPaymentHandler(s *services.SupplierPaymentService) *SupplierPaymentHandler {
	return &SupplierPaymentHandler{Service: s}
}

// GET /api/suppliers/{id}/payments
func (h *SupplierPaymentHandler) GetBySupplier(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	payments, err := h.Service.GetPaymentsBySupplier(supplierID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if payments == nil {
		payments = []models.SupplierPayment{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

// POST /api/supplier-payments
func (h *SupplierPaymentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateSupplierPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	payment, err := h.Service.CreatePayment(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(payment)
}

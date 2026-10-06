package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type DepositHandler struct {
	Service *services.DepositService
}

func NewDepositHandler(s *services.DepositService) *DepositHandler {
	return &DepositHandler{Service: s}
}

func (h *DepositHandler) GetByCustomer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	customerID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	deposits, err := h.Service.GetDepositsByCustomer(customerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if deposits == nil {
		deposits = []models.Deposit{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(deposits)
}

func (h *DepositHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateDepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	shopID := r.URL.Query().Get("shop_id")

	deposit, err := h.Service.CreateDeposit(&req, shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(deposit)
}

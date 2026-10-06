package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
)

type ReturnHandler struct {
	Service *services.ReturnService
}

func NewReturnHandler(s *services.ReturnService) *ReturnHandler {
	return &ReturnHandler{Service: s}
}

func (h *ReturnHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	returns, err := h.Service.GetAllReturns(shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if returns == nil {
		returns = []models.Return{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(returns)
}

func (h *ReturnHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateReturnRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	shopID := r.URL.Query().Get("shop_id")

	ret, err := h.Service.CreateReturn(&req, shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ret)
}

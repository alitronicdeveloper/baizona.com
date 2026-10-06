package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
)

type RegisterHandler struct {
	Service *services.RegisterService
}

func NewRegisterHandler(s *services.RegisterService) *RegisterHandler {
	return &RegisterHandler{Service: s}
}

// POST /api/register
func (h *RegisterHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	result, err := h.Service.Register(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

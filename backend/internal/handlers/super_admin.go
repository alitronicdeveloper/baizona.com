package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
)

type SuperAdminHandler struct {
	Service *services.SuperAdminService
}

func NewSuperAdminHandler(s *services.SuperAdminService) *SuperAdminHandler {
	return &SuperAdminHandler{Service: s}
}

// Setup — kuunda admin wa kwanza (mara moja tu)
func (h *SuperAdminHandler) Setup(w http.ResponseWriter, r *http.Request) {
	exists, err := h.Service.CheckIfExists()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Admin tayari ameundwa", http.StatusBadRequest)
		return
	}

	var req models.CreateSuperAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	if len(req.PIN) < 4 {
		http.Error(w, "PIN iwe angalau tarakimu 4", http.StatusBadRequest)
		return
	}

	admin, err := h.Service.CreateSuperAdmin(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(admin)
}

// Login — kuingia
func (h *SuperAdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.SuperAdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	admin, err := h.Service.Login(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	response := models.SuperAdminLoginResponse{
		Token:     admin.ID.String(),
		AdminID:   admin.ID,
		Name:      admin.Name,
		Phone:     admin.Phone,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetMe — pata taarifa za admin aliyeingia
func (h *SuperAdminHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-Admin-Token")
	if token == "" {
		http.Error(w, "Hauna ruhusa", http.StatusUnauthorized)
		return
	}

	id, err := uuid.Parse(token)
	if err != nil {
		http.Error(w, "Token si sahihi", http.StatusUnauthorized)
		return
	}

	admin, err := h.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Admin haipatikani", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(admin)
}

package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
)

type UserHandler struct {
	Service *services.UserService
}

func NewUserHandler(s *services.UserService) *UserHandler {
	return &UserHandler{Service: s}
}

// POST /api/login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.UserLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	user, err := h.Service.Login(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var shopID uuid.UUID
	if user.ShopID != nil {
		shopID = *user.ShopID
	}

	response := models.UserLoginResponse{
		Token:     user.ID.String(),
		UserID:    user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Phone:     user.Phone,
		WhatsApp:  user.WhatsApp,
		Role:      user.Role,
		Status:    user.Status,
		ShopID:    shopID,
		ExpiresAt: time.Now().Add(365 * 24 * time.Hour),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GET /api/me
func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-User-Token")
	if token == "" {
		http.Error(w, "Hauna ruhusa", http.StatusUnauthorized)
		return
	}

	id, err := uuid.Parse(token)
	if err != nil {
		http.Error(w, "Token si sahihi", http.StatusUnauthorized)
		return
	}

	user, err := h.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Mtumiaji haipatikani", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

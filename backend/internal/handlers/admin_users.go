package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type AdminUsersHandler struct {
	DB *sql.DB
}

func NewAdminUsersHandler(db *sql.DB) *AdminUsersHandler {
	return &AdminUsersHandler{DB: db}
}

// GET /api/admin/users
func (h *AdminUsersHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT u.id, u.shop_id, u.name, COALESCE(u.email, ''), COALESCE(u.phone, ''),
		       COALESCE(u.whatsapp, ''), u.role, COALESCE(u.status, 'pending'), u.is_active,
		       u.created_at, u.updated_at, COALESCE(s.name, '')
		FROM users u
		LEFT JOIN shops s ON s.id = u.shop_id
		WHERE u.deleted_at IS NULL
		ORDER BY u.created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type UserRow struct {
		ID        uuid.UUID  `json:"id"`
		ShopID    *uuid.UUID `json:"shop_id,omitempty"`
		Name      string     `json:"name"`
		Email     string     `json:"email"`
		Phone     string     `json:"phone"`
		WhatsApp  string     `json:"whatsapp"`
		Role      string     `json:"role"`
		Status    string     `json:"status"`
		IsActive  bool       `json:"is_active"`
		CreatedAt interface{} `json:"created_at"`
		UpdatedAt interface{} `json:"updated_at"`
		ShopName  string     `json:"shop_name"`
	}

	var users []UserRow
	for rows.Next() {
		var u UserRow
		err := rows.Scan(&u.ID, &u.ShopID, &u.Name, &u.Email, &u.Phone, &u.WhatsApp,
			&u.Role, &u.Status, &u.IsActive, &u.CreatedAt, &u.UpdatedAt, &u.ShopName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}
	if users == nil {
		users = []UserRow{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// PUT /api/admin/users/{id}
func (h *AdminUsersHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		UPDATE users
		SET name = COALESCE(NULLIF($1, ''), name),
		    status = COALESCE(NULLIF($2, ''), status),
		    role = COALESCE(NULLIF($3, ''), role),
		    phone = COALESCE(NULLIF($4, ''), phone),
		    whatsapp = COALESCE(NULLIF($5, ''), whatsapp),
		    updated_at = NOW()
		WHERE id = $6
	`, req.Name, req.Status, req.Role, req.Phone, req.WhatsApp, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imehifadhiwa"})
}

// DELETE /api/admin/users/{id}
func (h *AdminUsersHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imefutwa"})
}

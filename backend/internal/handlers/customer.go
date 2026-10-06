package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type CustomerHandler struct {
	DB *sql.DB
}

func NewCustomerHandler(db *sql.DB) *CustomerHandler {
	return &CustomerHandler{DB: db}
}

func (h *CustomerHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateCustomerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	shopID := r.URL.Query().Get("shop_id")

	customer := &models.Customer{
		ID:      uuid.New(),
		Name:    req.Name,
		Phone:   req.Phone,
		Balance: 0,
		Deposit: 0,
	}

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	err := h.DB.QueryRow(`INSERT INTO customers (id, name, phone, balance, deposit, shop_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING created_at, updated_at`,
		customer.ID, customer.Name, customer.Phone, customer.Balance, customer.Deposit, shopUUID).Scan(&customer.CreatedAt, &customer.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(customer)
}

func (h *CustomerHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")

	query := `SELECT id, name, phone, COALESCE(balance, 0), COALESCE(deposit, 0), created_at, updated_at
	          FROM customers WHERE deleted_at IS NULL`
	args := []interface{}{}

	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}

	query += ` ORDER BY name ASC`

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var customers []models.Customer
	for rows.Next() {
		var c models.Customer
		err := rows.Scan(&c.ID, &c.Name, &c.Phone, &c.Balance, &c.Deposit, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		customers = append(customers, c)
	}
	if customers == nil {
		customers = []models.Customer{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customers)
}

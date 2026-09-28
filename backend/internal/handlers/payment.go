package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type PaymentHandler struct {
	DB *sql.DB
}

func NewPaymentHandler(db *sql.DB) *PaymentHandler {
	return &PaymentHandler{DB: db}
}

type CreatePaymentRequest struct {
	CustomerID    uuid.UUID `json:"customer_id"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	Notes         string    `json:"notes"`
}

func (h *PaymentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Rekodi malipo
	paymentID := uuid.New()
	_, err = tx.Exec(`INSERT INTO payments (id, customer_id, amount, payment_method, notes)
		VALUES ($1, $2, $3, $4, $5)`,
		paymentID, req.CustomerID, req.Amount, req.PaymentMethod, req.Notes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Punguza deni la mteja
	_, err = tx.Exec(`UPDATE customers SET balance = balance - $1 WHERE id = $2`,
		req.Amount, req.CustomerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      paymentID,
		"status":  "imekamilika",
		"message": "Malipo yamerekodiwa",
	})
}

func (h *PaymentHandler) GetByCustomer(w http.ResponseWriter, r *http.Request) {
	customerID := r.URL.Query().Get("customer_id")
	if customerID == "" {
		http.Error(w, "customer_id inahitajika", http.StatusBadRequest)
		return
	}

	rows, err := h.DB.Query(`SELECT id, customer_id, amount, payment_method, notes, payment_date
		FROM payments WHERE customer_id = $1 ORDER BY payment_date DESC`, customerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Payment struct {
		ID            uuid.UUID `json:"id"`
		CustomerID    uuid.UUID `json:"customer_id"`
		Amount        float64   `json:"amount"`
		PaymentMethod string    `json:"payment_method"`
		Notes         string    `json:"notes"`
		PaymentDate   string    `json:"payment_date"`
	}

	var payments []Payment
	for rows.Next() {
		var p Payment
		err := rows.Scan(&p.ID, &p.CustomerID, &p.Amount, &p.PaymentMethod, &p.Notes, &p.PaymentDate)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		payments = append(payments, p)
	}
	if payments == nil {
		payments = []Payment{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

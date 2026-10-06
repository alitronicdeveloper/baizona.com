package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type SupplierPaymentService struct {
	DB *sql.DB
}

func NewSupplierPaymentService(db *sql.DB) *SupplierPaymentService {
	return &SupplierPaymentService{DB: db}
}

// GetPaymentsBySupplier - malipo yote kwa supplier mmoja
func (s *SupplierPaymentService) GetPaymentsBySupplier(supplierID uuid.UUID) ([]models.SupplierPayment, error) {
	query := `SELECT id, supplier_id, amount, payment_method, notes, payment_date, created_at, synced_at, shop_id
	          FROM supplier_payments
	          WHERE supplier_id = $1
	          ORDER BY payment_date DESC`

	rows, err := s.DB.Query(query, supplierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []models.SupplierPayment
	for rows.Next() {
		var p models.SupplierPayment
		err := rows.Scan(&p.ID, &p.SupplierID, &p.Amount, &p.PaymentMethod, &p.Notes, &p.PaymentDate, &p.CreatedAt, &p.SyncedAt, &p.ShopID)
		if err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}
	return payments, nil
}

// CreatePayment - rekodi malipo
func (s *SupplierPaymentService) CreatePayment(req *models.CreateSupplierPaymentRequest) (*models.SupplierPayment, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	id := uuid.New()
	now := time.Now()

	// 1. Unda payment
	_, err = tx.Exec(`INSERT INTO supplier_payments (id, supplier_id, amount, payment_method, notes, payment_date, created_at)
	                  VALUES ($1, $2, $3, $4, $5, $6, $6)`,
		id, req.SupplierID, req.Amount, req.PaymentMethod, req.Notes, now)
	if err != nil {
		return nil, err
	}

	// 2. Punguza deni la supplier
	_, err = tx.Exec(`UPDATE suppliers SET balance = balance - $1 WHERE id = $2`,
		req.Amount, req.SupplierID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.SupplierPayment{
		ID:            id,
		SupplierID:    req.SupplierID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		Notes:         req.Notes,
		PaymentDate:   now,
		CreatedAt:     now,
	}, nil
}

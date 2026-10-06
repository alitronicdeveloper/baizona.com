package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type PurchaseService struct {
	DB *sql.DB
}

func NewPurchaseService(db *sql.DB) *PurchaseService {
	return &PurchaseService{DB: db}
}

// GetAllPurchases - manunuzi yote
func (s *PurchaseService) GetAllPurchases(shopID string) ([]models.Purchase, error) {
	query := `SELECT id, supplier_id, total_amount, amount_paid, balance, notes, purchase_date, created_at, updated_at, synced_at, deleted_at, shop_id
	          FROM purchases WHERE deleted_at IS NULL`
	args := []interface{}{}
	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}
	query += ` ORDER BY purchase_date DESC`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var purchases []models.Purchase
	for rows.Next() {
		var p models.Purchase
		err := rows.Scan(&p.ID, &p.SupplierID, &p.TotalAmount, &p.AmountPaid, &p.Balance, &p.Notes, &p.PurchaseDate, &p.CreatedAt, &p.UpdatedAt, &p.SyncedAt, &p.DeletedAt, &p.ShopID)
		if err != nil {
			return nil, err
		}
		purchases = append(purchases, p)
	}
	return purchases, nil
}

// GetPurchasesBySupplier - manunuzi ya supplier mmoja
func (s *PurchaseService) GetPurchasesBySupplier(supplierID uuid.UUID) ([]models.Purchase, error) {
	query := `SELECT id, supplier_id, total_amount, amount_paid, balance, notes, purchase_date, created_at, updated_at, synced_at, deleted_at, shop_id
	          FROM purchases WHERE supplier_id = $1 AND deleted_at IS NULL
	          ORDER BY purchase_date DESC`

	rows, err := s.DB.Query(query, supplierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var purchases []models.Purchase
	for rows.Next() {
		var p models.Purchase
		err := rows.Scan(&p.ID, &p.SupplierID, &p.TotalAmount, &p.AmountPaid, &p.Balance, &p.Notes, &p.PurchaseDate, &p.CreatedAt, &p.UpdatedAt, &p.SyncedAt, &p.DeletedAt, &p.ShopID)
		if err != nil {
			return nil, err
		}
		purchases = append(purchases, p)
	}
	return purchases, nil
}

// CreatePurchase - manunuzi mapya
func (s *PurchaseService) CreatePurchase(req *models.CreatePurchaseRequest) (*models.Purchase, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	purchaseID := uuid.New()
	now := time.Now()
	var totalAmount float64

	// 1. Unda purchase
	_, err = tx.Exec(`INSERT INTO purchases (id, supplier_id, total_amount, amount_paid, balance, notes, purchase_date, created_at, updated_at)
	                  VALUES ($1, $2, 0, $3, 0, $4, $5, $5, $5)`,
		purchaseID, req.SupplierID, req.AmountPaid, req.Notes, now)
	if err != nil {
		return nil, err
	}

	// 2. Unda purchase items + ongeza stock
	for _, item := range req.Items {
		subtotal := item.CostPrice * item.Quantity
		totalAmount += subtotal

		_, err = tx.Exec(`INSERT INTO purchase_items (id, purchase_id, product_id, product_name, quantity, cost_price, subtotal, created_at)
		                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			uuid.New(), purchaseID, item.ProductID, item.ProductName, item.Quantity, item.CostPrice, subtotal, now)
		if err != nil {
			return nil, err
		}

		// Ongeza stock
		_, err = tx.Exec(`UPDATE products SET stock = stock + $1, cost_price = $2 WHERE id = $3`,
			item.Quantity, item.CostPrice, item.ProductID)
		if err != nil {
			return nil, err
		}
	}

	// 3. Hesabu balance
	balance := totalAmount - req.AmountPaid

	_, err = tx.Exec(`UPDATE purchases SET total_amount = $1, balance = $2 WHERE id = $3`,
		totalAmount, balance, purchaseID)
	if err != nil {
		return nil, err
	}

	// 4. Sasisha deni la supplier
	if req.SupplierID != nil && balance > 0 {
		_, err = tx.Exec(`UPDATE suppliers SET balance = balance + $1 WHERE id = $2`,
			balance, req.SupplierID)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.Purchase{
		ID:           purchaseID,
		SupplierID:   req.SupplierID,
		TotalAmount:  totalAmount,
		AmountPaid:   req.AmountPaid,
		Balance:      balance,
		Notes:        req.Notes,
		PurchaseDate: now,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

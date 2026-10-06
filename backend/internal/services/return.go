package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type ReturnService struct {
	DB *sql.DB
}

func NewReturnService(db *sql.DB) *ReturnService {
	return &ReturnService{DB: db}
}

// GetAllReturns - returns zote
func (s *ReturnService) GetAllReturns(shopID string) ([]models.Return, error) {
	query := `SELECT id, sale_id, customer_id, total_amount, refund_method, reason, return_date, created_at, synced_at, deleted_at, shop_id
	          FROM returns WHERE deleted_at IS NULL`
	args := []interface{}{}
	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}
	query += ` ORDER BY return_date DESC`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var returns []models.Return
	for rows.Next() {
		var r models.Return
		err := rows.Scan(&r.ID, &r.SaleID, &r.CustomerID, &r.TotalAmount, &r.RefundMethod, &r.Reason, &r.ReturnDate, &r.CreatedAt, &r.SyncedAt, &r.DeletedAt, &r.ShopID)
		if err != nil {
			return nil, err
		}
		returns = append(returns, r)
	}
	return returns, nil
}

// CreateReturn - return mpya
func (s *ReturnService) CreateReturn(req *models.CreateReturnRequest, shopID string) (*models.Return, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	returnID := uuid.New()
	now := time.Now()
	var totalAmount float64

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	// 1. Unda return
	_, err = tx.Exec(`INSERT INTO returns (id, sale_id, customer_id, total_amount, refund_method, reason, return_date, created_at, shop_id)
	                  VALUES ($1, $2, $3, 0, $4, $5, $6, $6, $7)`,
		returnID, req.SaleID, req.CustomerID, req.RefundMethod, req.Reason, now, shopUUID)
	if err != nil {
		return nil, err
	}

	// 2. Unda return_items + rudisha stock
	for _, item := range req.Items {
		subtotal := item.UnitPrice * item.Quantity
		totalAmount += subtotal

		_, err = tx.Exec(`INSERT INTO return_items (id, return_id, product_id, product_name, quantity, unit_price, cost_price, subtotal, created_at)
		                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			uuid.New(), returnID, item.ProductID, item.ProductName, item.Quantity, item.UnitPrice, item.CostPrice, subtotal, now)
		if err != nil {
			return nil, err
		}

		// Rudisha stock
		_, err = tx.Exec(`UPDATE products SET stock = stock + $1 WHERE id = $2`,
			item.Quantity, item.ProductID)
		if err != nil {
			return nil, err
		}
	}

	// 3. Sasisha total_amount
	_, err = tx.Exec(`UPDATE returns SET total_amount = $1 WHERE id = $2`,
		totalAmount, returnID)
	if err != nil {
		return nil, err
	}

	// 4. Kama refund ni credit, punguza deni la mteja
	if req.RefundMethod == "credit" && req.CustomerID != nil {
		_, err = tx.Exec(`UPDATE customers SET balance = balance - $1 WHERE id = $2`,
			totalAmount, req.CustomerID)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.Return{
		ID:           returnID,
		SaleID:       req.SaleID,
		CustomerID:   req.CustomerID,
		TotalAmount:  totalAmount,
		RefundMethod: req.RefundMethod,
		Reason:       req.Reason,
		ReturnDate:   now,
		CreatedAt:    now,
	}, nil
}

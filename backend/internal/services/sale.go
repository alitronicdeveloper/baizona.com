package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type SaleService struct {
	DB *sql.DB
}

func NewSaleService(db *sql.DB) *SaleService {
	return &SaleService{DB: db}
}

func (s *SaleService) GetAllSales(shopID string) ([]models.Sale, error) {
	query := `SELECT id, customer_id, total_amount, total_cost, profit, payment_method, amount_paid, balance, sale_date, created_at
	          FROM sales WHERE deleted_at IS NULL`
	args := []interface{}{}

	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}

	query += ` ORDER BY sale_date DESC`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []models.Sale
	for rows.Next() {
		var s models.Sale
		err := rows.Scan(&s.ID, &s.CustomerID, &s.TotalAmount, &s.TotalCost, &s.Profit, &s.PaymentMethod, &s.AmountPaid, &s.Balance, &s.SaleDate, &s.CreatedAt)
		if err != nil {
			return nil, err
		}
		sales = append(sales, s)
	}
	return sales, nil
}

func (s *SaleService) GetTodaySales(shopID string) ([]models.Sale, error) {
	today := time.Now().Format("2006-01-02")

	query := `SELECT id, customer_id, total_amount, total_cost, profit, payment_method, amount_paid, balance, sale_date, created_at
	          FROM sales WHERE deleted_at IS NULL AND DATE(sale_date) = $1`
	args := []interface{}{today}

	if shopID != "" {
		query += ` AND shop_id = $2`
		args = append(args, shopID)
	}

	query += ` ORDER BY sale_date DESC`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []models.Sale
	for rows.Next() {
		var s models.Sale
		err := rows.Scan(&s.ID, &s.CustomerID, &s.TotalAmount, &s.TotalCost, &s.Profit, &s.PaymentMethod, &s.AmountPaid, &s.Balance, &s.SaleDate, &s.CreatedAt)
		if err != nil {
			return nil, err
		}
		sales = append(sales, s)
	}
	return sales, nil
}

func (s *SaleService) CreateSale(req *models.CreateSaleRequest, shopID string) (*models.Sale, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	saleID := uuid.New()
	now := time.Now()

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	var totalAmount, totalCost, profit float64

	// 1. Unda sale
	_, err = tx.Exec(`INSERT INTO sales (id, customer_id, total_amount, total_cost, profit, payment_method, amount_paid, balance, sale_date, created_at, shop_id)
	                  VALUES ($1, $2, 0, 0, 0, $3, $4, 0, $5, $5, $6)`,
		saleID, req.CustomerID, req.PaymentMethod, req.AmountPaid, now, shopUUID)
	if err != nil {
		return nil, err
	}

	// 2. Unda sale_items
	for _, item := range req.Items {
		var productPrice, productCost float64
		var productName string

		err = tx.QueryRow(`SELECT name, selling_price, cost_price FROM products WHERE id = $1`, item.ProductID).Scan(&productName, &productPrice, &productCost)
		if err != nil {
			return nil, err
		}

		subtotal := productPrice * item.Quantity
		itemProfit := (productPrice - productCost) * item.Quantity

		totalAmount += subtotal
		totalCost += productCost * item.Quantity
		profit += itemProfit

		_, err = tx.Exec(`INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, cost_price, subtotal, profit, created_at, shop_id)
		                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			uuid.New(), saleID, item.ProductID, productName, item.Quantity, productPrice, productCost, subtotal, itemProfit, now, shopUUID)
		if err != nil {
			return nil, err
		}

		// Punguza stock
		_, err = tx.Exec(`UPDATE products SET stock = stock - $1 WHERE id = $2`, item.Quantity, item.ProductID)
		if err != nil {
			return nil, err
		}
	}

	// 3. Sasisha sale na totals
	balance := totalAmount - req.AmountPaid
	_, err = tx.Exec(`UPDATE sales SET total_amount = $1, total_cost = $2, profit = $3, balance = $4 WHERE id = $5`,
		totalAmount, totalCost, profit, balance, saleID)
	if err != nil {
		return nil, err
	}

	// 4. Kama ni deni, ongeza kwenye customer balance
	if req.PaymentMethod == "credit" && req.CustomerID != nil {
		_, err = tx.Exec(`UPDATE customers SET balance = balance + $1 WHERE id = $2`, totalAmount, req.CustomerID)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.Sale{
		ID:            saleID,
		CustomerID:    req.CustomerID,
		TotalAmount:   totalAmount,
		TotalCost:     totalCost,
		Profit:        profit,
		PaymentMethod: req.PaymentMethod,
		AmountPaid:    req.AmountPaid,
		Balance:       balance,
		SaleDate:      now,
		CreatedAt:     now,
	}, nil
}

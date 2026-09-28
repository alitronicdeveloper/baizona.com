package services

import (
	"database/sql"
	"errors"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type SaleService struct {
	DB *sql.DB
}

func NewSaleService(db *sql.DB) *SaleService {
	return &SaleService{DB: db}
}

func (s *SaleService) CreateSale(req *models.CreateSaleRequest) (*models.Sale, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("mauzo hayawezi kuwa tupu")
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	sale := &models.Sale{
		ID:            uuid.New(),
		CustomerID:    req.CustomerID,
		PaymentMethod: req.PaymentMethod,
		AmountPaid:    req.AmountPaid,
	}

	// 1. UNDA SALE KWANZA
	err = tx.QueryRow(`INSERT INTO sales (id, customer_id, total_amount, total_cost, profit, payment_method, amount_paid, balance)
		VALUES ($1, $2, 0, 0, 0, $3, $4, 0) RETURNING sale_date, created_at`,
		sale.ID, sale.CustomerID, sale.PaymentMethod, sale.AmountPaid).Scan(&sale.SaleDate, &sale.CreatedAt)
	if err != nil {
		return nil, err
	}

	var totalAmount, totalCost, totalProfit float64

	for _, item := range req.Items {
		var product models.Product
		err := tx.QueryRow(`SELECT id, name, cost_price, selling_price, stock FROM products WHERE id = $1 AND deleted_at IS NULL`,
			item.ProductID).Scan(&product.ID, &product.Name, &product.CostPrice, &product.SellingPrice, &product.Stock)
		if err != nil {
			return nil, errors.New("bidhaa haipatikani")
		}
		if product.Stock < item.Quantity {
			return nil, errors.New("stock haitoshi kwa " + product.Name)
		}

		subtotal := product.SellingPrice * item.Quantity
		profit := (product.SellingPrice - product.CostPrice) * item.Quantity
		totalAmount += subtotal
		totalCost += product.CostPrice * item.Quantity
		totalProfit += profit

		saleItem := models.SaleItem{
			ID:          uuid.New(),
			SaleID:      sale.ID,
			ProductID:   product.ID,
			ProductName: product.Name,
			Quantity:    item.Quantity,
			UnitPrice:   product.SellingPrice,
			CostPrice:   product.CostPrice,
			Subtotal:    subtotal,
			Profit:      profit,
		}

		_, err = tx.Exec(`INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, cost_price, subtotal, profit)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			saleItem.ID, saleItem.SaleID, saleItem.ProductID, saleItem.ProductName,
			saleItem.Quantity, saleItem.UnitPrice, saleItem.CostPrice, saleItem.Subtotal, saleItem.Profit)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(`UPDATE products SET stock = stock - $1 WHERE id = $2`, item.Quantity, product.ID)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(`INSERT INTO stock_movements (id, product_id, movement_type, quantity, reference_type, reference_id)
			VALUES ($1, $2, 'out', $3, 'sale', $4)`,
			uuid.New(), product.ID, item.Quantity, sale.ID)
		if err != nil {
			return nil, err
		}

		sale.Items = append(sale.Items, saleItem)
	}

	sale.TotalAmount = totalAmount
	sale.TotalCost = totalCost
	sale.Profit = totalProfit
	sale.Balance = totalAmount - req.AmountPaid

	_, err = tx.Exec(`UPDATE sales SET total_amount = $1, total_cost = $2, profit = $3, balance = $4 WHERE id = $5`,
		sale.TotalAmount, sale.TotalCost, sale.Profit, sale.Balance, sale.ID)
	if err != nil {
		return nil, err
	}

	if req.PaymentMethod == "credit" && sale.CustomerID != nil {
		_, err = tx.Exec(`UPDATE customers SET balance = balance + $1 WHERE id = $2`, sale.Balance, sale.CustomerID)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return sale, nil
}

func (s *SaleService) GetTodaySales() (map[string]interface{}, error) {
	var totalSales, totalProfit float64
	var count int
	err := s.DB.QueryRow(`SELECT COALESCE(SUM(total_amount), 0), COALESCE(SUM(profit), 0), COUNT(*) FROM sales WHERE DATE(sale_date) = CURRENT_DATE AND deleted_at IS NULL`).Scan(&totalSales, &totalProfit, &count)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"total_sales":  totalSales,
		"total_profit": totalProfit,
		"total_count":  count,
	}, nil
}

func (s *SaleService) GetAllSales() ([]models.Sale, error) {
	rows, err := s.DB.Query(`SELECT id, customer_id, total_amount, total_cost, profit, payment_method, amount_paid, balance, sale_date, created_at FROM sales WHERE deleted_at IS NULL ORDER BY sale_date DESC LIMIT 100`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []models.Sale
	for rows.Next() {
		var sale models.Sale
		err := rows.Scan(&sale.ID, &sale.CustomerID, &sale.TotalAmount, &sale.TotalCost,
			&sale.Profit, &sale.PaymentMethod, &sale.AmountPaid, &sale.Balance, &sale.SaleDate, &sale.CreatedAt)
		if err != nil {
			return nil, err
		}
		sales = append(sales, sale)
	}
	return sales, nil
}

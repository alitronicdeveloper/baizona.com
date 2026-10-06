package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type ProductService struct {
	DB *sql.DB
}

func NewProductService(db *sql.DB) *ProductService {
	return &ProductService{DB: db}
}

func (s *ProductService) GetAllProducts(shopID string) ([]models.Product, error) {
	query := `SELECT id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active, created_at, updated_at
	          FROM products WHERE deleted_at IS NULL`
	args := []interface{}{}

	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}

	query += ` ORDER BY name`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Unit, &p.CostPrice, &p.SellingPrice, &p.Stock, &p.ReorderLevel, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

func (s *ProductService) CreateProduct(req *models.CreateProductRequest, shopID string) (*models.Product, error) {
	id := uuid.New()
	now := time.Now()

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	_, err := s.DB.Exec(`INSERT INTO products (id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active, created_at, updated_at, shop_id)
	                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $9, $10)`,
		id, req.Name, req.Category, req.Unit, req.CostPrice, req.SellingPrice, req.Stock, req.ReorderLevel, now, shopUUID)
	if err != nil {
		return nil, err
	}

	return &models.Product{
		ID:           id,
		Name:         req.Name,
		Category:     req.Category,
		Unit:         req.Unit,
		CostPrice:    req.CostPrice,
		SellingPrice: req.SellingPrice,
		Stock:        req.Stock,
		ReorderLevel: req.ReorderLevel,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
		ShopID:       shopUUID,
	}, nil
}

func (s *ProductService) GetProductByID(id uuid.UUID) (*models.Product, error) {
	var p models.Product
	err := s.DB.QueryRow(`SELECT id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active, created_at, updated_at, shop_id
	                      FROM products WHERE id = $1 AND deleted_at IS NULL`, id).
		Scan(&p.ID, &p.Name, &p.Category, &p.Unit, &p.CostPrice, &p.SellingPrice, &p.Stock, &p.ReorderLevel, &p.IsActive, &p.CreatedAt, &p.UpdatedAt, &p.ShopID)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

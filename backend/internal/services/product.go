package services

import (
	"database/sql"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type ProductService struct {
	DB *sql.DB
}

func NewProductService(db *sql.DB) *ProductService {
	return &ProductService{DB: db}
}

func (s *ProductService) CreateProduct(req *models.CreateProductRequest) (*models.Product, error) {
	product := &models.Product{
		ID:           uuid.New(),
		Name:         req.Name,
		Category:     req.Category,
		Unit:         req.Unit,
		CostPrice:    req.CostPrice,
		SellingPrice: req.SellingPrice,
		Stock:        req.Stock,
		ReorderLevel: req.ReorderLevel,
		IsActive:     true,
	}

	query := `INSERT INTO products (id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING created_at, updated_at`

	err := s.DB.QueryRow(query,
		product.ID, product.Name, product.Category, product.Unit,
		product.CostPrice, product.SellingPrice, product.Stock,
		product.ReorderLevel, product.IsActive,
	).Scan(&product.CreatedAt, &product.UpdatedAt)

	if err != nil {
		return nil, err
	}
	return product, nil
}

func (s *ProductService) GetAllProducts() ([]models.Product, error) {
	query := `SELECT id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active, created_at, updated_at
		FROM products WHERE deleted_at IS NULL ORDER BY name ASC`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Category, &p.Unit,
			&p.CostPrice, &p.SellingPrice, &p.Stock,
			&p.ReorderLevel, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

func (s *ProductService) GetProductByID(id uuid.UUID) (*models.Product, error) {
	query := `SELECT id, name, category, unit, cost_price, selling_price, stock, reorder_level, is_active, created_at, updated_at
		FROM products WHERE id = $1 AND deleted_at IS NULL`

	var p models.Product
	err := s.DB.QueryRow(query, id).Scan(
		&p.ID, &p.Name, &p.Category, &p.Unit,
		&p.CostPrice, &p.SellingPrice, &p.Stock,
		&p.ReorderLevel, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

package services

import (
	"database/sql"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type SupplierProductService struct {
	DB *sql.DB
}

func NewSupplierProductService(db *sql.DB) *SupplierProductService {
	return &SupplierProductService{DB: db}
}

// GetProductsBySupplier - bidhaa zote za supplier mmoja
func (s *SupplierProductService) GetProductsBySupplier(supplierID uuid.UUID) ([]models.SupplierProduct, error) {
	query := `
		SELECT sp.id, sp.supplier_id, sp.product_id, p.name, sp.supplier_price, sp.created_at, sp.updated_at
		FROM supplier_products sp
		JOIN products p ON p.id = sp.product_id
		WHERE sp.supplier_id = $1
		ORDER BY p.name
	`
	rows, err := s.DB.Query(query, supplierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.SupplierProduct
	for rows.Next() {
		var sp models.SupplierProduct
		err := rows.Scan(&sp.ID, &sp.SupplierID, &sp.ProductID, &sp.ProductName, &sp.SupplierPrice, &sp.CreatedAt, &sp.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, sp)
	}
	return list, nil
}

// AddProductToSupplier - ongeza bidhaa kwa supplier
func (s *SupplierProductService) AddProductToSupplier(supplierID uuid.UUID, req *models.AddSupplierProductRequest) (*models.SupplierProduct, error) {
	id := uuid.New()
	_, err := s.DB.Exec(`
		INSERT INTO supplier_products (id, supplier_id, product_id, supplier_price)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (supplier_id, product_id)
		DO UPDATE SET supplier_price = $4, updated_at = NOW()
	`, id, supplierID, req.ProductID, req.SupplierPrice)
	if err != nil {
		return nil, err
	}

	// Rudisha bidhaa iliyoongezwa
	var sp models.SupplierProduct
	err = s.DB.QueryRow(`
		SELECT sp.id, sp.supplier_id, sp.product_id, p.name, sp.supplier_price, sp.created_at, sp.updated_at
		FROM supplier_products sp
		JOIN products p ON p.id = sp.product_id
		WHERE sp.supplier_id = $1 AND sp.product_id = $2
	`, supplierID, req.ProductID).Scan(&sp.ID, &sp.SupplierID, &sp.ProductID, &sp.ProductName, &sp.SupplierPrice, &sp.CreatedAt, &sp.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sp, nil
}

// RemoveProductFromSupplier - ondoa bidhaa kwa supplier
func (s *SupplierProductService) RemoveProductFromSupplier(supplierID, productID uuid.UUID) error {
	_, err := s.DB.Exec(`
		DELETE FROM supplier_products
		WHERE supplier_id = $1 AND product_id = $2
	`, supplierID, productID)
	return err
}

// UpdateSupplierProductPrice - badilisha bei ya supplier kwa bidhaa
func (s *SupplierProductService) UpdateSupplierProductPrice(supplierID, productID uuid.UUID, price float64) error {
	_, err := s.DB.Exec(`
		UPDATE supplier_products
		SET supplier_price = $1, updated_at = NOW()
		WHERE supplier_id = $2 AND product_id = $3
	`, price, supplierID, productID)
	return err
}

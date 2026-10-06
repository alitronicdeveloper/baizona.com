package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type SupplierService struct {
	DB *sql.DB
}

func NewSupplierService(db *sql.DB) *SupplierService {
	return &SupplierService{DB: db}
}

func (s *SupplierService) GetAllSuppliers(shopID string) ([]models.Supplier, error) {
	query := `SELECT id, name, phone, address, COALESCE(region, ''), COALESCE(district, ''), notes, balance, created_at, updated_at, synced_at, deleted_at, shop_id
	          FROM suppliers WHERE deleted_at IS NULL`
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

	var suppliers []models.Supplier
	for rows.Next() {
		var sup models.Supplier
		err := rows.Scan(&sup.ID, &sup.Name, &sup.Phone, &sup.Address, &sup.Region, &sup.District, &sup.Notes, &sup.Balance, &sup.CreatedAt, &sup.UpdatedAt, &sup.SyncedAt, &sup.DeletedAt, &sup.ShopID)
		if err != nil {
			return nil, err
		}
		suppliers = append(suppliers, sup)
	}
	return suppliers, nil
}

func (s *SupplierService) CreateSupplier(req *models.CreateSupplierRequest, shopID string) (*models.Supplier, error) {
	id := uuid.New()
	now := time.Now()

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	_, err := s.DB.Exec(`INSERT INTO suppliers (id, name, phone, address, region, district, notes, balance, created_at, updated_at, shop_id)
	                     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $8, $9)`,
		id, req.Name, req.Phone, req.Address, req.Region, req.District, req.Notes, now, shopUUID)
	if err != nil {
		return nil, err
	}

	return &models.Supplier{
		ID:        id,
		Name:      req.Name,
		Phone:     req.Phone,
		Address:   req.Address,
		Notes:     req.Notes,
		Balance:   0,
		CreatedAt: now,
		UpdatedAt: now,
		ShopID:    shopUUID,
	}, nil
}

func (s *SupplierService) GetSupplierByID(id uuid.UUID) (*models.Supplier, error) {
	var sup models.Supplier
	err := s.DB.QueryRow(`SELECT id, name, phone, address, COALESCE(region, ''), COALESCE(district, ''), notes, balance, created_at, updated_at
	                      FROM suppliers WHERE id = $1 AND deleted_at IS NULL`, id).
		Scan(&sup.ID, &sup.Name, &sup.Phone, &sup.Address, &sup.Region, &sup.District, &sup.Notes, &sup.Balance, &sup.CreatedAt, &sup.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sup, nil
}

func (s *SupplierService) UpdateSupplier(id uuid.UUID, req *models.UpdateSupplierRequest) error {
	_, err := s.DB.Exec(`UPDATE suppliers SET name = $1, phone = $2, address = $3, notes = $4, balance = $5, updated_at = NOW()
	                     WHERE id = $6`,
		req.Name, req.Phone, req.Address, req.Notes, req.Balance, id)
	return err
}

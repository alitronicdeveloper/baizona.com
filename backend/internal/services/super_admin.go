package services

import (
	"database/sql"
	"errors"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type SuperAdminService struct {
	DB *sql.DB
}

func NewSuperAdminService(db *sql.DB) *SuperAdminService {
	return &SuperAdminService{DB: db}
}

// CheckIfExists - angalia kama kuna admin yeyote
func (s *SuperAdminService) CheckIfExists() (bool, error) {
	var count int
	err := s.DB.QueryRow(`SELECT COUNT(*) FROM super_admin WHERE deleted_at IS NULL`).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateSuperAdmin - kuunda admin wa kwanza
func (s *SuperAdminService) CreateSuperAdmin(req *models.CreateSuperAdminRequest) (*models.SuperAdmin, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.PIN), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	admin := &models.SuperAdmin{
		ID:      uuid.New(),
		Name:    req.Name,
		Phone:   req.Phone,
		PinHash: string(hash),
	}

	err = s.DB.QueryRow(`
		INSERT INTO super_admin (id, name, phone, pin_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at
	`, admin.ID, admin.Name, admin.Phone, admin.PinHash).
		Scan(&admin.CreatedAt, &admin.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return admin, nil
}

// Login - kuingia kwa simu + PIN
func (s *SuperAdminService) Login(req *models.SuperAdminLoginRequest) (*models.SuperAdmin, error) {
	var admin models.SuperAdmin

	err := s.DB.QueryRow(`
		SELECT id, name, phone, pin_hash, created_at, updated_at, last_login
		FROM super_admin
		WHERE phone = $1 AND deleted_at IS NULL
	`, req.Phone).Scan(
		&admin.ID, &admin.Name, &admin.Phone, &admin.PinHash,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.LastLogin,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("simu au PIN si sahihi")
		}
		return nil, err
	}

	// Angalia PIN
	err = bcrypt.CompareHashAndPassword([]byte(admin.PinHash), []byte(req.PIN))
	if err != nil {
		return nil, errors.New("simu au PIN si sahihi")
	}

	// Sasisha last_login
	now := time.Now()
	s.DB.Exec(`UPDATE super_admin SET last_login = $1 WHERE id = $2`, now, admin.ID)
	admin.LastLogin = &now

	return &admin, nil
}

// GetByID
func (s *SuperAdminService) GetByID(id uuid.UUID) (*models.SuperAdmin, error) {
	var admin models.SuperAdmin

	err := s.DB.QueryRow(`
		SELECT id, name, phone, pin_hash, created_at, updated_at, last_login
		FROM super_admin
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&admin.ID, &admin.Name, &admin.Phone, &admin.PinHash,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.LastLogin,
	)
	if err != nil {
		return nil, err
	}

	return &admin, nil
}

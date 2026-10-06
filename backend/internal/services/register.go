package services

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type RegisterService struct {
	DB *sql.DB
}

func NewRegisterService(db *sql.DB) *RegisterService {
	return &RegisterService{DB: db}
}

func (s *RegisterService) Register(req *models.RegisterRequest) (*models.RegisterResponse, error) {
	// 1. Validate
	if strings.TrimSpace(req.ShopName) == "" {
		return nil, errors.New("jina la duka linahitajika")
	}
	if strings.TrimSpace(req.OwnerName) == "" {
		return nil, errors.New("jina la mmiliki linahitajika")
	}
	if strings.TrimSpace(req.Email) == "" {
		return nil, errors.New("email inahitajika")
	}
	if len(req.Password) < 6 {
		return nil, errors.New("password iwe angalau herufi 6")
	}
	if req.ShopType == "" {
		req.ShopType = "hardware"
	}

	// 2. Angalia kama email ipo tayari
	var exists int
	err := s.DB.QueryRow(`SELECT COUNT(*) FROM users WHERE email = $1 AND deleted_at IS NULL`, req.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists > 0 {
		return nil, errors.New("email hii imetumika tayari")
	}

	// 3. Angalia kama phone ipo tayari
	if req.Phone != "" {
		err = s.DB.QueryRow(`SELECT COUNT(*) FROM users WHERE phone = $1 AND deleted_at IS NULL`, req.Phone).Scan(&exists)
		if err != nil {
			return nil, err
		}
		if exists > 0 {
			return nil, errors.New("simu hii imetumika tayari")
		}
	}

	// 4. Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 5. Anza transaction
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	now := time.Now()
	shopID := uuid.New()
	userID := uuid.New()

	// 6. Unda duka
	_, err = tx.Exec(`
		INSERT INTO shops (id, name, owner_name, phone, address, region, district, shop_type, status, plan, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'free', $9, $9)
	`, shopID, req.ShopName, req.OwnerName, req.Phone, req.Address, req.Region, req.District, req.ShopType, now)
	if err != nil {
		return nil, err
	}

	// 7. Unda mtumiaji (mmiliki)
	_, err = tx.Exec(`
		INSERT INTO users (id, shop_id, name, email, phone, whatsapp, password_hash, role, status, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'owner', 'pending', true, $8, $8)
	`, userID, shopID, req.OwnerName, req.Email, req.Phone, req.WhatsApp, string(hash), now)
	if err != nil {
		return nil, err
	}

	// 8. Commit
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.RegisterResponse{
		ShopID:    shopID,
		UserID:    userID,
		ShopName:  req.ShopName,
		OwnerName: req.OwnerName,
		Email:     req.Email,
		Phone:     req.Phone,
		WhatsApp:  req.WhatsApp,
		Status:    "pending",
		CreatedAt: now,
	}, nil
}

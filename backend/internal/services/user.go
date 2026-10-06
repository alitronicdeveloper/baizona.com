package services

import (
	"database/sql"
	"errors"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	DB *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{DB: db}
}

// Login - kuingia kwa email + password
func (s *UserService) Login(req *models.UserLoginRequest) (*models.User, error) {
	var u models.User
	err := s.DB.QueryRow(`
		SELECT id, shop_id, name, COALESCE(email, ''), COALESCE(phone, ''), COALESCE(whatsapp, ''),
		       COALESCE(password_hash, ''), role, COALESCE(status, 'pending'), is_active, created_at, updated_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`, req.Email).Scan(
		&u.ID, &u.ShopID, &u.Name, &u.Email, &u.Phone, &u.WhatsApp,
		&u.PasswordHash, &u.Role, &u.Status, &u.IsActive, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("email au password si sahihi")
		}
		return nil, err
	}

	// Angalia kama akaunti imethibitishwa
	if u.Status == "pending" {
		return nil, errors.New("akaunti yako bado haijathibitishwa. Tafadhali subiri admin")
	}
	if u.Status == "suspended" {
		return nil, errors.New("akaunti yako imesimamishwa")
	}
	if !u.IsActive {
		return nil, errors.New("akaunti haifanyi kazi")
	}

	// Angalia password
	err = bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, errors.New("email au password si sahihi")
	}

	// Sasisha last_login
	now := time.Now()
	s.DB.Exec(`UPDATE users SET last_login = $1 WHERE id = $2`, now, u.ID)
	u.LastLogin = &now

	return &u, nil
}

// GetByID
func (s *UserService) GetByID(id uuid.UUID) (*models.User, error) {
	var u models.User
	err := s.DB.QueryRow(`
		SELECT id, shop_id, name, COALESCE(email, ''), COALESCE(phone, ''), COALESCE(whatsapp, ''),
		       role, COALESCE(status, 'pending'), is_active, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&u.ID, &u.ShopID, &u.Name, &u.Email, &u.Phone, &u.WhatsApp,
		&u.Role, &u.Status, &u.IsActive, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

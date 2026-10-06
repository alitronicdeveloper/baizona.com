package models

import (
	"time"
	"github.com/google/uuid"
)

type SuperAdmin struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	PinHash   string     `json:"-"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	LastLogin *time.Time `json:"last_login,omitempty"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type CreateSuperAdminRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	PIN   string `json:"pin"`
}

type SuperAdminLoginRequest struct {
	Phone string `json:"phone"`
	PIN   string `json:"pin"`
}

type SuperAdminLoginResponse struct {
	Token     string    `json:"token"`
	AdminID   uuid.UUID `json:"admin_id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	ExpiresAt time.Time `json:"expires_at"`
}

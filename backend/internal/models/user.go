package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID  `json:"id"`
	ShopID    *uuid.UUID `json:"shop_id,omitempty"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Phone     string     `json:"phone"`
	WhatsApp  string     `json:"whatsapp,omitempty"`
	PinHash   string     `json:"-"`
	PasswordHash string  `json:"-"`
	Role      string     `json:"role"`
	Status    string     `json:"status"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserLoginResponse struct {
	Token     string    `json:"token"`
	UserID    uuid.UUID `json:"user_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	WhatsApp  string    `json:"whatsapp,omitempty"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	ShopID    uuid.UUID `json:"shop_id"`
	ExpiresAt time.Time `json:"expires_at"`
}

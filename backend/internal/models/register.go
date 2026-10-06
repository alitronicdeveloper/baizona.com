package models

import (
	"time"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	// Taarifa za Duka
	ShopName  string `json:"shop_name"`
	ShopType  string `json:"shop_type"` // hardware | general
	OwnerName string `json:"owner_name"`
	Phone     string `json:"phone"`
	WhatsApp  string `json:"whatsapp"`
	Address   string `json:"address"`
	Region    string `json:"region"`
	District  string `json:"district"`

	// Taarifa za Mtumiaji
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterResponse struct {
	ShopID    uuid.UUID `json:"shop_id"`
	UserID    uuid.UUID `json:"user_id"`
	ShopName  string    `json:"shop_name"`
	OwnerName string    `json:"owner_name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	WhatsApp  string    `json:"whatsapp"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

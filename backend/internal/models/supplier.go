package models

import (
	"time"
	"github.com/google/uuid"
)

type Supplier struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Address   string     `json:"address"`
	Region    string     `json:"region"`
	District  string     `json:"district"`
	Notes     string     `json:"notes"`
	Balance   float64    `json:"balance"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	SyncedAt  *time.Time `json:"synced_at,omitempty"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	ShopID    *uuid.UUID `json:"shop_id,omitempty"`
}

type CreateSupplierRequest struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Address  string `json:"address"`
	Region   string `json:"region"`
	District string `json:"district"`
	Notes   string `json:"notes"`
}

type UpdateSupplierRequest struct {
	Name    string  `json:"name"`
	Phone   string  `json:"phone"`
	Address string  `json:"address"`
	Notes   string  `json:"notes"`
	Balance float64 `json:"balance"`
}

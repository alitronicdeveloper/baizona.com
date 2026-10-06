package models

import (
	"time"
	"github.com/google/uuid"
)

type Shop struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	OwnerName   string     `json:"owner_name"`
	Phone       string     `json:"phone"`
	Address     string     `json:"address"`
	Region      string     `json:"region"`
	District    string     `json:"district"`
	Status      string     `json:"status"`
	Plan        string     `json:"plan"`
	ShopType    string     `json:"shop_type"`
	TrialEndsAt *time.Time `json:"trial_ends_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type CreateShopRequest struct {
	Name      string `json:"name"`
	OwnerName string `json:"owner_name"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	ShopType  string `json:"shop_type"`
}

type UpdateShopRequest struct {
	Name    string `json:"name"`
	Status  string `json:"status"`
	Plan    string `json:"plan"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
}

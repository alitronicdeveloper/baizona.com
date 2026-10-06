package models

import (
	"time"

	"github.com/google/uuid"
)

type Customer struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Balance   float64    `json:"balance"`
	Deposit   float64    `json:"deposit"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	SyncedAt  *time.Time `json:"synced_at,omitempty"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type CreateCustomerRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

package models

import (
	"time"
	"github.com/google/uuid"
)

type Deposit struct {
	ID          uuid.UUID  `json:"id"`
	CustomerID  uuid.UUID  `json:"customer_id"`
	Amount      float64    `json:"amount"`
	DepositType string     `json:"deposit_type"` // in, out, refund
	Notes       string     `json:"notes"`
	DepositDate time.Time  `json:"deposit_date"`
	CreatedAt   time.Time  `json:"created_at"`
	SyncedAt    *time.Time `json:"synced_at,omitempty"`
	ShopID      *uuid.UUID `json:"shop_id,omitempty"`
}

type CreateDepositRequest struct {
	CustomerID  uuid.UUID `json:"customer_id"`
	Amount      float64   `json:"amount"`
	DepositType string    `json:"deposit_type"`
	Notes       string    `json:"notes"`
}

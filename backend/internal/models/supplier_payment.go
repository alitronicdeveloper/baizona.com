package models

import (
	"time"
	"github.com/google/uuid"
)

type SupplierPayment struct {
	ID            uuid.UUID  `json:"id"`
	SupplierID    uuid.UUID  `json:"supplier_id"`
	Amount        float64    `json:"amount"`
	PaymentMethod string     `json:"payment_method"`
	Notes         string     `json:"notes"`
	PaymentDate   time.Time  `json:"payment_date"`
	CreatedAt     time.Time  `json:"created_at"`
	SyncedAt      *time.Time `json:"synced_at,omitempty"`
	ShopID        *uuid.UUID `json:"shop_id,omitempty"`
}

type CreateSupplierPaymentRequest struct {
	SupplierID    uuid.UUID `json:"supplier_id"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	Notes         string    `json:"notes"`
}

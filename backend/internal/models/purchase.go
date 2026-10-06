package models

import (
	"time"
	"github.com/google/uuid"
)

type Purchase struct {
	ID           uuid.UUID  `json:"id"`
	SupplierID   *uuid.UUID `json:"supplier_id,omitempty"`
	TotalAmount  float64    `json:"total_amount"`
	AmountPaid   float64    `json:"amount_paid"`
	Balance      float64    `json:"balance"`
	Notes        string     `json:"notes"`
	PurchaseDate time.Time  `json:"purchase_date"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	SyncedAt     *time.Time `json:"synced_at,omitempty"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	ShopID       *uuid.UUID `json:"shop_id,omitempty"`
}

type PurchaseItem struct {
	ID          uuid.UUID `json:"id"`
	PurchaseID  uuid.UUID `json:"purchase_id"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    float64   `json:"quantity"`
	CostPrice   float64   `json:"cost_price"`
	Subtotal    float64   `json:"subtotal"`
	CreatedAt   time.Time `json:"created_at"`
	ShopID      *uuid.UUID `json:"shop_id,omitempty"`
}

type CreatePurchaseRequest struct {
	SupplierID *uuid.UUID                `json:"supplier_id,omitempty"`
	AmountPaid float64                   `json:"amount_paid"`
	Notes      string                    `json:"notes"`
	Items      []CreatePurchaseItemRequest `json:"items"`
}

type CreatePurchaseItemRequest struct {
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    float64   `json:"quantity"`
	CostPrice   float64   `json:"cost_price"`
}

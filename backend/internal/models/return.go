package models

import (
	"time"
	"github.com/google/uuid"
)

type Return struct {
	ID           uuid.UUID  `json:"id"`
	SaleID       *uuid.UUID `json:"sale_id,omitempty"`
	CustomerID   *uuid.UUID `json:"customer_id,omitempty"`
	TotalAmount  float64    `json:"total_amount"`
	RefundMethod string     `json:"refund_method"`
	Reason       string     `json:"reason"`
	ReturnDate   time.Time  `json:"return_date"`
	CreatedAt    time.Time  `json:"created_at"`
	SyncedAt     *time.Time `json:"synced_at,omitempty"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	ShopID       *uuid.UUID `json:"shop_id,omitempty"`
}

type ReturnItem struct {
	ID          uuid.UUID  `json:"id"`
	ReturnID    uuid.UUID  `json:"return_id"`
	ProductID   uuid.UUID  `json:"product_id"`
	ProductName string     `json:"product_name"`
	Quantity    float64    `json:"quantity"`
	UnitPrice   float64    `json:"unit_price"`
	CostPrice   float64    `json:"cost_price"`
	Subtotal    float64    `json:"subtotal"`
	CreatedAt   time.Time  `json:"created_at"`
	SyncedAt    *time.Time `json:"synced_at,omitempty"`
	ShopID      *uuid.UUID `json:"shop_id,omitempty"`
}

type CreateReturnRequest struct {
	SaleID       *uuid.UUID                `json:"sale_id,omitempty"`
	CustomerID   *uuid.UUID                `json:"customer_id,omitempty"`
	RefundMethod string                    `json:"refund_method"`
	Reason       string                    `json:"reason"`
	Items        []CreateReturnItemRequest `json:"items"`
}

type CreateReturnItemRequest struct {
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    float64   `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	CostPrice   float64   `json:"cost_price"`
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	ID            uuid.UUID  `json:"id"`
	CustomerID    *uuid.UUID `json:"customer_id,omitempty"`
	TotalAmount   float64    `json:"total_amount"`
	TotalCost     float64    `json:"total_cost"`
	Profit        float64    `json:"profit"`
	PaymentMethod string     `json:"payment_method"`
	AmountPaid    float64    `json:"amount_paid"`
	Balance       float64    `json:"balance"`
	SaleDate      time.Time  `json:"sale_date"`
	CreatedAt     time.Time  `json:"created_at"`
	Items         []SaleItem `json:"items,omitempty"`
}

type SaleItem struct {
	ID          uuid.UUID `json:"id"`
	SaleID      uuid.UUID `json:"sale_id"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    float64   `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	CostPrice   float64   `json:"cost_price"`
	Subtotal    float64   `json:"subtotal"`
	Profit      float64   `json:"profit"`
}

// CreateSaleRequest - kwa kupokea mauzo mapya
type CreateSaleRequest struct {
	CustomerID    *uuid.UUID             `json:"customer_id,omitempty"`
	PaymentMethod string                 `json:"payment_method"`
	AmountPaid    float64                `json:"amount_paid"`
	Items         []CreateSaleItemRequest `json:"items"`
}

type CreateSaleItemRequest struct {
	ProductID uuid.UUID `json:"product_id"`
	Quantity  float64   `json:"quantity"`
}

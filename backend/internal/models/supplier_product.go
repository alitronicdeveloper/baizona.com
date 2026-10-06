package models

import (
	"time"
	"github.com/google/uuid"
)

type SupplierProduct struct {
	ID            uuid.UUID `json:"id"`
	SupplierID    uuid.UUID `json:"supplier_id"`
	ProductID     uuid.UUID `json:"product_id"`
	ProductName   string    `json:"product_name,omitempty"`
	SupplierPrice float64   `json:"supplier_price"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AddSupplierProductRequest struct {
	ProductID     uuid.UUID `json:"product_id"`
	SupplierPrice float64   `json:"supplier_price"`
}

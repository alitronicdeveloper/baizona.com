package models

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Category     string     `json:"category"`
	Unit         string     `json:"unit"`
	CostPrice    float64    `json:"cost_price"`
	SellingPrice float64    `json:"selling_price"`
	Stock        float64    `json:"stock"`
	ReorderLevel float64    `json:"reorder_level"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	SyncedAt     *time.Time `json:"synced_at,omitempty"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}

// CreateProductRequest - kwa ajili ya kupokea data kutoka frontend
type CreateProductRequest struct {
	Name         string  `json:"name"`
	Category     string  `json:"category"`
	Unit         string  `json:"unit"`
	CostPrice    float64 `json:"cost_price"`
	SellingPrice float64 `json:"selling_price"`
	Stock        float64 `json:"stock"`
	ReorderLevel float64 `json:"reorder_level"`
}

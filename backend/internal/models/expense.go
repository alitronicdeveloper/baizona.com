package models

import (
	"time"
	"github.com/google/uuid"
)

type Expense struct {
	ID          uuid.UUID  `json:"id"`
	Category    string     `json:"category"`
	Description string     `json:"description"`
	Amount      float64    `json:"amount"`
	ExpenseDate time.Time  `json:"expense_date"`
	CreatedAt   time.Time  `json:"created_at"`
	SyncedAt    *time.Time `json:"synced_at,omitempty"`
	ShopID      *uuid.UUID `json:"shop_id,omitempty"`
}

type CreateExpenseRequest struct {
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

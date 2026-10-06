package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type ExpenseService struct {
	DB *sql.DB
}

func NewExpenseService(db *sql.DB) *ExpenseService {
	return &ExpenseService{DB: db}
}

// GetAllExpenses - gharama zote
func (s *ExpenseService) GetAllExpenses(shopID string) ([]models.Expense, error) {
	query := `SELECT id, category, description, amount, expense_date, created_at, synced_at, shop_id
	          FROM expenses WHERE 1=1`
	args := []interface{}{}
	if shopID != "" {
		query += ` AND shop_id = $1`
		args = append(args, shopID)
	}
	query += ` ORDER BY expense_date DESC`

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []models.Expense
	for rows.Next() {
		var e models.Expense
		err := rows.Scan(&e.ID, &e.Category, &e.Description, &e.Amount, &e.ExpenseDate, &e.CreatedAt, &e.SyncedAt, &e.ShopID)
		if err != nil {
			return nil, err
		}
		expenses = append(expenses, e)
	}
	return expenses, nil
}

// CreateExpense - gharama mpya
func (s *ExpenseService) CreateExpense(req *models.CreateExpenseRequest, shopID string) (*models.Expense, error) {
	id := uuid.New()
	now := time.Now()

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	_, err := s.DB.Exec(`INSERT INTO expenses (id, category, description, amount, expense_date, created_at, shop_id)
	                     VALUES ($1, $2, $3, $4, $5, $5, $6)`,
		id, req.Category, req.Description, req.Amount, now, shopUUID)
	if err != nil {
		return nil, err
	}

	return &models.Expense{
		ID:          id,
		Category:    req.Category,
		Description: req.Description,
		Amount:      req.Amount,
		ExpenseDate: now,
		CreatedAt:   now,
		ShopID:      shopUUID,
	}, nil
}

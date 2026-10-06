package services

import (
	"database/sql"
	"time"

	"github.com/baizona/backend/internal/models"
	"github.com/google/uuid"
)

type DepositService struct {
	DB *sql.DB
}

func NewDepositService(db *sql.DB) *DepositService {
	return &DepositService{DB: db}
}

// GetDepositsByCustomer - amana za mteja mmoja
func (s *DepositService) GetDepositsByCustomer(customerID uuid.UUID) ([]models.Deposit, error) {
	query := `SELECT id, customer_id, amount, deposit_type, notes, deposit_date, created_at, synced_at, shop_id
	          FROM deposits
	          WHERE customer_id = $1
	          ORDER BY deposit_date DESC`

	rows, err := s.DB.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deposits []models.Deposit
	for rows.Next() {
		var d models.Deposit
		err := rows.Scan(&d.ID, &d.CustomerID, &d.Amount, &d.DepositType, &d.Notes, &d.DepositDate, &d.CreatedAt, &d.SyncedAt, &d.ShopID)
		if err != nil {
			return nil, err
		}
		deposits = append(deposits, d)
	}
	return deposits, nil
}

// CreateDeposit - amana mpya
func (s *DepositService) CreateDeposit(req *models.CreateDepositRequest, shopID string) (*models.Deposit, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	id := uuid.New()
	now := time.Now()

	var shopUUID *uuid.UUID
	if shopID != "" {
		parsed, err := uuid.Parse(shopID)
		if err == nil {
			shopUUID = &parsed
		}
	}

	// 1. Unda deposit
	_, err = tx.Exec(`INSERT INTO deposits (id, customer_id, amount, deposit_type, notes, deposit_date, created_at, shop_id)
	                  VALUES ($1, $2, $3, $4, $5, $6, $6, $7)`,
		id, req.CustomerID, req.Amount, req.DepositType, req.Notes, now, shopUUID)
	if err != nil {
		return nil, err
	}

	// 2. Sasisha salio la mteja
	if req.DepositType == "in" {
		// Mteja anaweka amana
		// Angalia kama ana deni kwanza
		var currentBalance float64
		var currentDeposit float64
		err = tx.QueryRow(`SELECT COALESCE(balance, 0), COALESCE(deposit, 0) FROM customers WHERE id = $1`, req.CustomerID).Scan(&currentBalance, &currentDeposit)
		if err != nil {
			return nil, err
		}

		if currentBalance > 0 {
			if req.Amount >= currentBalance {
				// Amana inatosha kulipa deni lote
				newDeposit := currentDeposit + (req.Amount - currentBalance)
				_, err = tx.Exec(`UPDATE customers SET balance = 0, deposit = $1 WHERE id = $2`, newDeposit, req.CustomerID)
			} else {
				// Amana inapunguza deni
				newBalance := currentBalance - req.Amount
				_, err = tx.Exec(`UPDATE customers SET balance = $1 WHERE id = $2`, newBalance, req.CustomerID)
			}
		} else {
			// Hana deni, amana inaongezeka
			_, err = tx.Exec(`UPDATE customers SET deposit = COALESCE(deposit, 0) + $1 WHERE id = $2`, req.Amount, req.CustomerID)
		}
		if err != nil {
			return nil, err
		}
	} else if req.DepositType == "out" || req.DepositType == "refund" {
		// Kutumia au kurudisha amana
		_, err = tx.Exec(`UPDATE customers SET deposit = GREATEST(0, COALESCE(deposit, 0) - $1) WHERE id = $2`, req.Amount, req.CustomerID)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.Deposit{
		ID:          id,
		CustomerID:  req.CustomerID,
		Amount:      req.Amount,
		DepositType: req.DepositType,
		Notes:       req.Notes,
		DepositDate: now,
		CreatedAt:   now,
	}, nil
}

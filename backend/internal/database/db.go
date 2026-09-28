package database

import (
	"database/sql"
	"log"
	"time"

	"github.com/baizona/backend/internal/config"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect(cfg *config.Config) {
	var err error

	DB, err = sql.Open("postgres", cfg.DBConnectionString())
	if err != nil {
		log.Fatalf("❌ Imeshindwa kufungua database: %v", err)
	}

	// Jaribu kuunganisha
	err = DB.Ping()
	if err != nil {
		log.Fatalf("❌ Imeshindwa kuunganisha na database: %v", err)
	}

	// Weka settings za connection pool
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	log.Println("✅ Database imeunganishwa kikamilifu")
}

package main

import (
	"log"
	"net/http"

	"github.com/baizona/backend/internal/config"
	"github.com/baizona/backend/internal/database"
	"github.com/baizona/backend/internal/handlers"
	"github.com/baizona/backend/internal/services"
	"github.com/gorilla/mux"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	cfg := config.Load()
	database.Connect(cfg)

	productService := services.NewProductService(database.DB)
	saleService := services.NewSaleService(database.DB)

	productHandler := handlers.NewProductHandler(productService)
	saleHandler := handlers.NewSaleHandler(saleService)
	customerHandler := handlers.NewCustomerHandler(database.DB)
	paymentHandler := handlers.NewPaymentHandler(database.DB)

	r := mux.NewRouter()

	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"sawa"}`))
	}).Methods("GET")

	r.HandleFunc("/api/products", productHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/products", productHandler.Create).Methods("POST")
	r.HandleFunc("/api/products/{id}", productHandler.GetByID).Methods("GET")

	r.HandleFunc("/api/sales", saleHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/sales", saleHandler.Create).Methods("POST")
	r.HandleFunc("/api/sales/today", saleHandler.GetToday).Methods("GET")

	r.HandleFunc("/api/customers", customerHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/customers", customerHandler.Create).Methods("POST")

	r.HandleFunc("/api/payments", paymentHandler.Create).Methods("POST")
	r.HandleFunc("/api/payments", paymentHandler.GetByCustomer).Methods("GET")

	log.Println("🚀 Server inaanza kwenye port", cfg.ServerPort)
	log.Fatal(http.ListenAndServe(":"+cfg.ServerPort, corsMiddleware(r)))
}

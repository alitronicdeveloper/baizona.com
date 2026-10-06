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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token, X-User-Token, X-Shop-Token")
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
	userService := services.NewUserService(database.DB)
	superAdminService := services.NewSuperAdminService(database.DB)
	registerService := services.NewRegisterService(database.DB)
	depositService := services.NewDepositService(database.DB)
	expenseService := services.NewExpenseService(database.DB)
	supplierService := services.NewSupplierService(database.DB)
	returnService := services.NewReturnService(database.DB)
	supplierPaymentService := services.NewSupplierPaymentService(database.DB)
	purchaseService := services.NewPurchaseService(database.DB)
	supplierProductService := services.NewSupplierProductService(database.DB)

	productHandler := handlers.NewProductHandler(productService)
	saleHandler := handlers.NewSaleHandler(saleService)
	userHandler := handlers.NewUserHandler(userService)
	superAdminHandler := handlers.NewSuperAdminHandler(superAdminService)
	shopHandler := handlers.NewShopHandler(database.DB)
	adminUsersHandler := handlers.NewAdminUsersHandler(database.DB)
	adminSuppliersHandler := handlers.NewAdminSuppliersHandler(database.DB)
	settingsHandler := handlers.NewSettingsHandler(database.DB)
	dataCollectionHandler := handlers.NewDataCollectionHandler(database.DB)
	registerHandler := handlers.NewRegisterHandler(registerService)
	depositHandler := handlers.NewDepositHandler(depositService)
	expenseHandler := handlers.NewExpenseHandler(expenseService)
	supplierHandler := handlers.NewSupplierHandler(supplierService)
	returnHandler := handlers.NewReturnHandler(returnService)
	supplierPaymentHandler := handlers.NewSupplierPaymentHandler(supplierPaymentService)
	purchaseHandler := handlers.NewPurchaseHandler(purchaseService)
	supplierProductHandler := handlers.NewSupplierProductHandler(supplierProductService)
	customerHandler := handlers.NewCustomerHandler(database.DB)
	paymentHandler := handlers.NewPaymentHandler(database.DB)

	r := mux.NewRouter()

	r.HandleFunc("/api/register", registerHandler.Register).Methods("POST")
	r.HandleFunc("/api/login", userHandler.Login).Methods("POST")

	// Super Admin
	r.HandleFunc("/api/admin/setup", superAdminHandler.Setup).Methods("POST")
	r.HandleFunc("/api/admin/login", superAdminHandler.Login).Methods("POST")
	r.HandleFunc("/api/admin/me", superAdminHandler.GetMe).Methods("GET")

	// Shops (Super Admin)
	r.HandleFunc("/api/shops", shopHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/shops/{id}", shopHandler.GetByID).Methods("GET")
	r.HandleFunc("/api/shops/{id}", shopHandler.Update).Methods("PUT")
	r.HandleFunc("/api/shops/{id}", shopHandler.Delete).Methods("DELETE")

	// Admin Users
	r.HandleFunc("/api/admin/users", adminUsersHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/admin/users/{id}", adminUsersHandler.Update).Methods("PUT")
	r.HandleFunc("/api/admin/users/{id}", adminUsersHandler.Delete).Methods("DELETE")

	// Admin Suppliers
	r.HandleFunc("/api/admin/suppliers", adminSuppliersHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/admin/suppliers/{id}", adminSuppliersHandler.GetByID).Methods("GET")
	r.HandleFunc("/api/admin/suppliers/{id}", adminSuppliersHandler.Update).Methods("PUT")
	r.HandleFunc("/api/admin/suppliers/{id}/products", adminSuppliersHandler.GetProducts).Methods("GET")
	r.HandleFunc("/api/admin/suppliers/{id}/products", adminSuppliersHandler.AddProduct).Methods("POST")

	// Settings
	r.HandleFunc("/api/settings", settingsHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/settings", settingsHandler.Update).Methods("PUT")

	// Data Collection
	r.HandleFunc("/api/admin/data/top-products", dataCollectionHandler.TopProducts).Methods("GET")
	r.HandleFunc("/api/admin/data/shops-by-region", dataCollectionHandler.ShopsByRegion).Methods("GET")
	r.HandleFunc("/api/admin/data/supplier-prices", dataCollectionHandler.SupplierPrices).Methods("GET")
	r.HandleFunc("/api/me", userHandler.GetMe).Methods("GET")

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

	// Suppliers
	r.HandleFunc("/api/suppliers", supplierHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/suppliers", supplierHandler.Create).Methods("POST")
	r.HandleFunc("/api/suppliers/{id}", supplierHandler.GetByID).Methods("GET")
	r.HandleFunc("/api/suppliers/{id}", supplierHandler.Update).Methods("PUT")

	// Supplier Products
	r.HandleFunc("/api/suppliers/{id}/products", supplierProductHandler.GetProductsBySupplier).Methods("GET")
	r.HandleFunc("/api/suppliers/{id}/products", supplierProductHandler.AddProduct).Methods("POST")
	r.HandleFunc("/api/suppliers/{id}/products/{productId}", supplierProductHandler.RemoveProduct).Methods("DELETE")
	r.HandleFunc("/api/suppliers/{id}/products/{productId}", supplierProductHandler.UpdatePrice).Methods("PUT")

	// Purchases
	r.HandleFunc("/api/purchases", purchaseHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/purchases", purchaseHandler.Create).Methods("POST")
	r.HandleFunc("/api/suppliers/{id}/purchases", purchaseHandler.GetBySupplier).Methods("GET")

	// Supplier Payments
	r.HandleFunc("/api/supplier-payments", supplierPaymentHandler.Create).Methods("POST")
	r.HandleFunc("/api/suppliers/{id}/payments", supplierPaymentHandler.GetBySupplier).Methods("GET")

	// Returns
	r.HandleFunc("/api/returns", returnHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/returns", returnHandler.Create).Methods("POST")

	// Deposits
	r.HandleFunc("/api/deposits", depositHandler.Create).Methods("POST")
	r.HandleFunc("/api/customers/{id}/deposits", depositHandler.GetByCustomer).Methods("GET")

	// Expenses
	r.HandleFunc("/api/expenses", expenseHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/expenses", expenseHandler.Create).Methods("POST")
	r.HandleFunc("/api/payments", paymentHandler.GetByCustomer).Methods("GET")

	log.Println("🚀 Server inaanza kwenye port", cfg.ServerPort)
	log.Fatal(http.ListenAndServe(":"+cfg.ServerPort, corsMiddleware(r)))
}

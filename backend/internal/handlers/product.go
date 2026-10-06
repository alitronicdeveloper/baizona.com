package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ProductHandler struct {
	Service *services.ProductService
}

func NewProductHandler(s *services.ProductService) *ProductHandler {
	return &ProductHandler{Service: s}
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	// Pata shop_id kutoka query
	shopID := r.URL.Query().Get("shop_id")

	product, err := h.Service.CreateProduct(&req, shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	products, err := h.Service.GetAllProducts(shopID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if products == nil {
		products = []models.Product{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	product, err := h.Service.GetProductByID(id)
	if err != nil {
		http.Error(w, "Bidhaa haipatikani", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

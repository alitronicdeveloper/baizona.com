package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/baizona/backend/internal/models"
	"github.com/baizona/backend/internal/services"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type SupplierProductHandler struct {
	Service *services.SupplierProductService
}

func NewSupplierProductHandler(s *services.SupplierProductService) *SupplierProductHandler {
	return &SupplierProductHandler{Service: s}
}

// GET /api/suppliers/{id}/products
func (h *SupplierProductHandler) GetProductsBySupplier(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	list, err := h.Service.GetProductsBySupplier(supplierID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if list == nil {
		list = []models.SupplierProduct{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// POST /api/suppliers/{id}/products
func (h *SupplierProductHandler) AddProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}

	var req models.AddSupplierProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	sp, err := h.Service.AddProductToSupplier(supplierID, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sp)
}

// DELETE /api/suppliers/{id}/products/{productId}
func (h *SupplierProductHandler) RemoveProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}
	productID, err := uuid.Parse(vars["productId"])
	if err != nil {
		http.Error(w, "Product ID si sahihi", http.StatusBadRequest)
		return
	}

	if err := h.Service.RemoveProductFromSupplier(supplierID, productID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imeondolewa"})
}

// PUT /api/suppliers/{id}/products/{productId}
func (h *SupplierProductHandler) UpdatePrice(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	supplierID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "ID si sahihi", http.StatusBadRequest)
		return
	}
	productID, err := uuid.Parse(vars["productId"])
	if err != nil {
		http.Error(w, "Product ID si sahihi", http.StatusBadRequest)
		return
	}

	var body struct {
		SupplierPrice float64 `json:"supplier_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Data si sahihi", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdateSupplierProductPrice(supplierID, productID, body.SupplierPrice); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "imehifadhiwa"})
}

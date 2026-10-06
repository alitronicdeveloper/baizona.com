package models

type UpdateUserRequest struct {
	Name     string `json:"name"`
	Status   string `json:"status"`
	Role     string `json:"role"`
	Phone    string `json:"phone"`
	WhatsApp string `json:"whatsapp"`
}

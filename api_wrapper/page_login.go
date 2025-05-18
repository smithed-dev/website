package server

import (
	"net/http"
)

func Login(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("build/pages/login.html").ServePage(nil)
}

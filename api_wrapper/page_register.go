package server

import (
	"net/http"
)

func Register(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("build/pages/register.html").ServePage(nil)
}
